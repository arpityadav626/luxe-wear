'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { assetPath } from '@/lib/assets';
import { frameSrc, sequence } from '@/lib/brand.config';

interface DecodedFrame {
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}

const ANCHOR_STRIDE = 10;

function isSampledIndex(idx: number, total: number, stride: number): boolean {
  return idx === total - 1 || idx % stride === 0;
}

function isAnchorIndex(idx: number, total: number, stride: number): boolean {
  if (idx === 0 || idx === total - 1) return true;
  if (!isSampledIndex(idx, total, stride)) return false;
  return Math.floor(idx / stride) % ANCHOR_STRIDE === 0;
}

function snapSampledIndex(floatIndex: number, total: number, stride: number): number {
  const clamped = Math.max(0, Math.min(total - 1, Math.round(floatIndex)));
  if (stride <= 1 || isSampledIndex(clamped, total, stride)) return clamped;
  const down = Math.floor(clamped / stride) * stride;
  const up = Math.min(total - 1, down + stride);
  return clamped - down <= up - clamped ? down : up;
}

function getBracket(floatIndex: number, total: number, stride: number) {
  const clamped = Math.max(0, Math.min(total - 1, floatIndex));
  if (stride <= 1) {
    const lo = Math.floor(clamped);
    const hi = Math.min(total - 1, lo + 1);
    return { lo, hi, frac: clamped - lo };
  }
  const lo = Math.min(total - 1, Math.floor(clamped / stride) * stride);
  const hi = Math.min(total - 1, lo + stride);
  const span = Math.max(1, hi - lo);
  const frac = lo === hi ? 0 : (clamped - lo) / span;
  return { lo, hi, frac };
}

function buildMultiPassOrder(total: number, stride: number): number[] {
  const seen = new Uint8Array(total);
  const order: number[] = [];
  const push = (i: number) => {
    if (i >= 0 && i < total && isSampledIndex(i, total, stride) && !seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(total - 1);
  for (const mult of [ANCHOR_STRIDE, 4, 2, 1]) {
    const step = stride * mult;
    for (let i = 0; i < total; i += step) {
      push(i);
    }
  }
  return order;
}

/**
 * High-FPS turntable loader & renderer:
 * - Protects initial Hero LCP / Lighthouse score by loading only frame 0 until genuine user
 *   engagement (scroll/wheel/touch/key or section intersection).
 * - Desktop streams all 360 frames (0.50 deg/step); mobile streams every 2nd frame (stride = 2,
 *   181 frames -> ~50% less cellular payload) while retaining adjacent sub-frame alpha blending.
 * - Decodes off the main thread via `createImageBitmap(blob)` inside a bounded GPU sliding window
 *   with permanent anchor frames so both fine scrubbing and scrollbar jumps render crisply.
 */
export function useFrameSequence(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const decodedRef = useRef<(DecodedFrame | null)[]>([]);
  const currentRef = useRef(0);
  const currentFloatRef = useRef(0);
  const dirRef = useRef<1 | -1>(1);
  const strideRef = useRef(1);
  const failedRef = useRef(false);
  const requestDecodeRef = useRef<(idx: number) => void>(() => {});

  const draw = useCallback(
    (floatIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      const frames = decodedRef.current;
      const count = frames.length;
      if (count === 0) return;

      const stride = strideRef.current;
      const { lo, hi, frac } = getBracket(floatIndex, count, stride);

      const drawSingle = (frame: DecodedFrame, alpha: number) => {
        const iw = frame.width;
        const ih = frame.height;
        if (!iw || !ih) return;
        const s =
          w > h
            ? Math.min((w * 0.47) / iw, (h * 1.02) / ih)
            : Math.min((w * 0.92) / iw, (h * 0.92) / ih);
        const dw = iw * s;
        const dh = ih * s;
        ctx.globalAlpha = alpha;
        ctx.drawImage(frame.source, (w - dw) / 2, (h - dh) / 2, dw, dh);
      };

      const frameLo = frames[lo] ?? null;
      const frameHi = frames[hi] ?? null;

      if (frameLo && frameHi) {
        if (lo === hi || frac <= 0.025) {
          drawSingle(frameLo, 1);
        } else if (frac >= 0.975) {
          drawSingle(frameHi, 1);
        } else {
          // Adjacent sampled sub-frame crossfade eliminates frame-stepping with zero dimming
          drawSingle(frameLo, 1);
          drawSingle(frameHi, frac);
          ctx.globalAlpha = 1;
        }
        return;
      }

      const center = snapSampledIndex(floatIndex, count, stride);
      let frame: DecodedFrame | null = frames[center] ?? frameLo ?? frameHi ?? null;
      if (!frame) {
        for (let step = 1; step * stride < count; step++) {
          const d = step * stride;
          const prev = center - d;
          if (prev >= 0 && frames[prev]) {
            frame = frames[prev];
            break;
          }
          const next = Math.min(count - 1, center + d);
          if (next < count && frames[next]) {
            frame = frames[next];
            break;
          }
        }
      }

      if (!frame) {
        if (failedRef.current) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#8A857B';
          ctx.font = `${Math.round(w * 0.025)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Add frames to /public/sequence', w / 2, h / 2);
        }
        return;
      }

      drawSingle(frame, 1);
    },
    [canvasRef]
  );

  const render = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(sequence.count - 1, i));
      if (Math.abs(clamped - currentFloatRef.current) > 1e-4) {
        dirRef.current = clamped >= currentFloatRef.current ? 1 : -1;
      }
      currentFloatRef.current = clamped;
      const target = snapSampledIndex(clamped, sequence.count, strideRef.current);
      currentRef.current = target;
      requestDecodeRef.current(target);
      draw(clamped);
    },
    [draw]
  );

  useEffect(() => {
    let cancelled = false;
    const count = sequence.count;
    const isMobile =
      window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 900;
    const stride = isMobile ? 2 : 1;
    strideRef.current = stride;
    const maxDecoded = isMobile ? 64 : 180;
    const fetchConcurrency = isMobile ? 4 : 8;
    const decodeConcurrency = isMobile ? 2 : 4;

    const controller = new AbortController();
    const blobs: (Blob | null)[] = new Array(count).fill(null);
    // 0 = idle, 1 = active, 2 = done, 3 = failed
    const fetchState = new Uint8Array(count);
    const decodeState = new Uint8Array(count);
    const frames: (DecodedFrame | null)[] = new Array(count).fill(null);
    decodedRef.current = frames;

    const activeDecoded = new Set<number>();
    const lastTouched = new Float64Array(count);
    let touchSeq = 1;
    let activeDecodes = 0;
    let activeFetches = 0;
    let restStarted = false;
    let preferBitmap = typeof createImageBitmap === 'function';

    const baseOrder = buildMultiPassOrder(count, stride);
    let orderCursor = 0;

    const evictIfNeeded = (protectCenter: number) => {
      while (activeDecoded.size >= maxDecoded) {
        let victim = -1;
        let maxScore = -1;
        for (const k of activeDecoded) {
          if (isAnchorIndex(k, count, stride)) continue;
          const dist = Math.abs(k - protectCenter);
          if (dist <= 6 * stride && activeDecoded.size < maxDecoded + 12) continue;
          const score = dist * 1_000_000 - lastTouched[k];
          if (score > maxScore) {
            maxScore = score;
            victim = k;
          }
        }
        if (victim === -1) {
          for (const k of activeDecoded) {
            if (isAnchorIndex(k, count, stride)) continue;
            const dist = Math.abs(k - protectCenter);
            if (dist > maxScore) {
              maxScore = dist;
              victim = k;
            }
          }
        }
        if (victim === -1) break;
        const old = frames[victim];
        frames[victim] = null;
        decodeState[victim] = 0;
        activeDecoded.delete(victim);
        old?.close?.();
      }
    };

    const decodeBlobFallback = (blob: Blob): Promise<DecodedFrame> =>
      new Promise((resolve, reject) => {
        const objUrl = URL.createObjectURL(blob);
        const img = new window.Image();
        img.decoding = 'async';
        const finalize = () => {
          URL.revokeObjectURL(objUrl);
          if (img.naturalWidth > 0) {
            resolve({
              source: img,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          } else {
            reject(new Error('Zero naturalWidth'));
          }
        };
        img.onload = finalize;
        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          reject(new Error('Image decode failed'));
        };
        img.src = objUrl;
        if (typeof img.decode === 'function') {
          img.decode().then(finalize).catch(() => {});
        }
      });

    const decodeOne = async (idx: number) => {
      const blob = blobs[idx];
      if (!blob || cancelled || decodeState[idx] !== 0) return;
      decodeState[idx] = 1;
      activeDecodes++;
      try {
        let decoded: DecodedFrame;
        if (preferBitmap) {
          try {
            const bm = await createImageBitmap(blob);
            if (cancelled) {
              bm.close?.();
              return;
            }
            decoded = {
              source: bm,
              width: bm.width,
              height: bm.height,
              close: () => bm.close?.(),
            };
          } catch {
            if (cancelled) return;
            preferBitmap = false;
            decoded = await decodeBlobFallback(blob);
            if (cancelled) return;
          }
        } else {
          decoded = await decodeBlobFallback(blob);
          if (cancelled) return;
        }

        evictIfNeeded(currentRef.current);
        frames[idx] = decoded;
        decodeState[idx] = 2;
        lastTouched[idx] = ++touchSeq;
        activeDecoded.add(idx);

        const cur = currentRef.current;
        if (Math.abs(idx - cur) <= stride * 2 || idx === 0) {
          draw(currentFloatRef.current);
        }
      } catch {
        decodeState[idx] = 3;
      } finally {
        activeDecodes--;
        if (!cancelled) pumpDecodes();
      }
    };

    const pickNextDecode = (): number => {
      const cur = currentRef.current;
      const dir = dirRef.current;
      const { lo, hi } = getBracket(currentFloatRef.current, count, stride);
      // 1) Active sub-frame bracket [lo, hi] first for instant silky compositing
      if (blobs[cur] && decodeState[cur] === 0) return cur;
      if (blobs[hi] && decodeState[hi] === 0) return hi;
      if (blobs[lo] && decodeState[lo] === 0) return lo;

      // 2) Bias 2:1 ahead in the user's active scroll direction (aligned to stride)
      const winAhead = isMobile ? 16 : 38;
      const winBehind = isMobile ? 8 : 16;
      const base = stride > 1 ? Math.floor(cur / stride) * stride : cur;
      for (let d = 1; d <= winAhead; d++) {
        const fwd = base + d * stride * dir;
        if (fwd >= 0 && fwd < count && isSampledIndex(fwd, count, stride) && blobs[fwd] && decodeState[fwd] === 0) {
          return fwd;
        }
        if (d <= winBehind && d % 2 === 0) {
          const bwd = base - (d >> 1) * stride * dir;
          if (bwd >= 0 && bwd < count && isSampledIndex(bwd, count, stride) && blobs[bwd] && decodeState[bwd] === 0) {
            return bwd;
          }
        }
      }
      // 3) Pre-decode key anchors across the full 180° arc for instant scrub jumps
      const step = ANCHOR_STRIDE * stride;
      for (let i = 0; i < count; i += step) {
        if (blobs[i] && decodeState[i] === 0) return i;
      }
      if (blobs[count - 1] && decodeState[count - 1] === 0) return count - 1;
      return -1;
    };

    const pumpDecodes = () => {
      if (cancelled) return;
      while (activeDecodes < decodeConcurrency) {
        const nextIdx = pickNextDecode();
        if (nextIdx === -1) break;
        void decodeOne(nextIdx);
      }
    };

    const pickNextFetch = (): number => {
      const cur = currentRef.current;
      const dir = dirRef.current;
      const { lo, hi } = getBracket(currentFloatRef.current, count, stride);
      if (fetchState[cur] === 0 && isSampledIndex(cur, count, stride)) return cur;
      if (fetchState[hi] === 0 && isSampledIndex(hi, count, stride)) return hi;
      if (fetchState[lo] === 0 && isSampledIndex(lo, count, stride)) return lo;

      const base = stride > 1 ? Math.floor(cur / stride) * stride : cur;
      for (let d = 1; d <= 20; d++) {
        const fwd = base + d * stride * dir;
        if (fwd >= 0 && fwd < count && isSampledIndex(fwd, count, stride) && fetchState[fwd] === 0) {
          return fwd;
        }
        const bwd = base - d * stride * dir;
        if (bwd >= 0 && bwd < count && isSampledIndex(bwd, count, stride) && fetchState[bwd] === 0) {
          return bwd;
        }
      }
      while (orderCursor < baseOrder.length) {
        const cand = baseOrder[orderCursor++];
        if (fetchState[cand] === 0) return cand;
      }
      return -1;
    };

    const spawnFetchWorkers = () => {
      while (activeFetches < fetchConcurrency && !cancelled) {
        const idx = pickNextFetch();
        if (idx === -1) break;
        fetchState[idx] = 1;
        activeFetches++;
        void (async (initialIdx: number) => {
          let curIdx = initialIdx;
          try {
            while (!cancelled && curIdx !== -1) {
              try {
                const res = await fetch(assetPath(frameSrc(curIdx + 1)), {
                  signal: controller.signal,
                  credentials: 'same-origin',
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                if (cancelled) break;
                blobs[curIdx] = blob;
                fetchState[curIdx] = 2;
                if (
                  Math.abs(curIdx - currentRef.current) <= 24 * stride ||
                  isAnchorIndex(curIdx, count, stride)
                ) {
                  pumpDecodes();
                }
              } catch {
                if (!cancelled) {
                  fetchState[curIdx] = 3;
                  if (curIdx === 0) {
                    failedRef.current = true;
                    draw(0);
                  }
                }
              }
              curIdx = pickNextFetch();
              if (curIdx !== -1) fetchState[curIdx] = 1;
            }
          } finally {
            activeFetches--;
          }
        })(idx);
      }
    };

    requestDecodeRef.current = (target: number) => {
      if (cancelled) return;
      if (frames[target]) {
        lastTouched[target] = ++touchSeq;
      }
      pumpDecodes();
      if (restStarted) {
        spawnFetchWorkers();
      }
    };

    // Load opening frame immediately so opening canvas frame is warm without competing with Hero LCP.
    fetchState[0] = 1;
    void (async () => {
      try {
        const res = await fetch(assetPath(frameSrc(1)), {
          signal: controller.signal,
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        blobs[0] = blob;
        fetchState[0] = 2;
        pumpDecodes();
      } catch {
        if (!cancelled) {
          fetchState[0] = 3;
          failedRef.current = true;
          draw(0);
        }
      }
    })();

    const startRemaining = () => {
      if (cancelled || restStarted) return;
      restStarted = true;
      spawnFetchWorkers();
    };

    const onRealScroll = () => {
      if (window.scrollY > 6) startRemaining();
    };

    const onKeyScroll = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'Space', 'End', ' '].includes(e.key)) {
        startRemaining();
      }
    };

    window.addEventListener('scroll', onRealScroll, { passive: true });
    window.addEventListener('wheel', startRemaining, { once: true, passive: true });
    window.addEventListener('touchstart', startRemaining, { once: true, passive: true });
    window.addEventListener('pointerdown', startRemaining, { once: true, passive: true });
    window.addEventListener('keydown', onKeyScroll, { passive: true });

    const canvasEl = canvasRef.current;
    let observer: IntersectionObserver | null = null;
    if (canvasEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            startRemaining();
            observer?.disconnect();
          }
        },
        { rootMargin: '0px', threshold: 0.02 }
      );
      observer.observe(canvasEl);
    }

    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = c.getBoundingClientRect();
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
      draw(currentFloatRef.current);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      cancelled = true;
      controller.abort();
      observer?.disconnect();
      window.removeEventListener('scroll', onRealScroll);
      window.removeEventListener('wheel', startRemaining);
      window.removeEventListener('touchstart', startRemaining);
      window.removeEventListener('pointerdown', startRemaining);
      window.removeEventListener('keydown', onKeyScroll);
      window.removeEventListener('resize', resize);
      for (const f of frames) {
        f?.close?.();
      }
      decodedRef.current = [];
    };
  }, [canvasRef, draw]);

  return { render };
}
