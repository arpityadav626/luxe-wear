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

function isAnchorIndex(idx: number, total: number): boolean {
  return idx === 0 || idx === total - 1 || idx % ANCHOR_STRIDE === 0;
}

function buildMultiPassOrder(total: number): number[] {
  const seen = new Uint8Array(total);
  const order: number[] = [];
  const push = (i: number) => {
    if (!seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(total - 1);
  for (const stride of [ANCHOR_STRIDE, 4, 2, 1]) {
    for (let i = 0; i < total; i += stride) {
      push(i);
    }
  }
  return order;
}

/**
 * High-FPS 360-frame turntable loader & renderer:
 * - Protects initial Hero LCP / Lighthouse score by loading only frame 0 until genuine user
 *   engagement (scroll/wheel/touch/key or section intersection).
 * - Streams frames into compressed in-memory Blobs via a playhead-prioritized fetch pool
 *   (no duplicate network fetches on repeat scrubs).
 * - Decodes off the main thread via `createImageBitmap(blob)` inside a bounded GPU sliding window
 *   with permanent anchor frames so both fine scrubbing and instant scrollbar jumps render crisply.
 */
export function useFrameSequence(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const decodedRef = useRef<(DecodedFrame | null)[]>([]);
  const currentRef = useRef(0);
  const currentFloatRef = useRef(0);
  const dirRef = useRef<1 | -1>(1);
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

      const clamped = Math.max(0, Math.min(count - 1, floatIndex));
      const lo = Math.floor(clamped);
      const hi = Math.min(count - 1, lo + 1);
      const frac = clamped - lo;

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
          // Adjacent 0.5° sub-frame crossfade eliminates 60/120Hz frame-stepping with zero dimming
          drawSingle(frameLo, 1);
          drawSingle(frameHi, frac);
          ctx.globalAlpha = 1;
        }
        return;
      }

      const center = Math.round(clamped);
      let frame: DecodedFrame | null = frames[center] ?? null;
      if (!frame) {
        // Outward nearest-distance search (slight bias opposite travel on ties for continuity)
        for (let d = 1; d < count; d++) {
          const prev = center - d;
          if (prev >= 0 && frames[prev]) {
            frame = frames[prev];
            break;
          }
          const next = center + d;
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
      const target = Math.round(clamped);
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
    const maxDecoded = isMobile ? 72 : 180;
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

    const baseOrder = buildMultiPassOrder(count);
    let orderCursor = 0;

    const evictIfNeeded = (protectCenter: number) => {
      while (activeDecoded.size >= maxDecoded) {
        let victim = -1;
        let maxScore = -1;
        for (const k of activeDecoded) {
          if (isAnchorIndex(k, count)) continue;
          const dist = Math.abs(k - protectCenter);
          // Protect immediate playback band tightly unless unavoidable
          if (dist <= 6 && activeDecoded.size < maxDecoded + 12) continue;
          const score = dist * 1_000_000 - lastTouched[k];
          if (score > maxScore) {
            maxScore = score;
            victim = k;
          }
        }
        if (victim === -1) {
          // Absolute fallback: evict farthest regardless of distance
          for (const k of activeDecoded) {
            if (isAnchorIndex(k, count)) continue;
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
        if (Math.abs(idx - cur) <= 2 || idx === 0) {
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
      const lo = Math.floor(currentFloatRef.current);
      const hi = Math.min(count - 1, lo + 1);
      // 1) Active sub-frame bracket [lo, hi] first for instant silky compositing
      if (blobs[cur] && decodeState[cur] === 0) return cur;
      if (blobs[hi] && decodeState[hi] === 0) return hi;
      if (blobs[lo] && decodeState[lo] === 0) return lo;

      // 2) Bias 2:1 ahead in the user's active scroll direction
      const winAhead = isMobile ? 20 : 38;
      const winBehind = isMobile ? 10 : 16;
      for (let d = 1; d <= winAhead; d++) {
        const fwd = cur + d * dir;
        if (fwd >= 0 && fwd < count && blobs[fwd] && decodeState[fwd] === 0) return fwd;
        if (d <= winBehind && d % 2 === 0) {
          const bwd = cur - (d >> 1) * dir;
          if (bwd >= 0 && bwd < count && blobs[bwd] && decodeState[bwd] === 0) return bwd;
        }
      }
      // 3) Pre-decode key anchors across the full 180° arc for instant scrub jumps
      for (let i = 0; i < count; i += ANCHOR_STRIDE) {
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
      // Highest priority: active neighborhood biased toward scroll travel
      if (fetchState[cur] === 0) return cur;
      for (let d = 1; d <= 28; d++) {
        const fwd = cur + d * dir;
        if (fwd >= 0 && fwd < count && fetchState[fwd] === 0) return fwd;
        const bwd = cur - d * dir;
        if (bwd >= 0 && bwd < count && fetchState[bwd] === 0) return bwd;
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
        // Mark via synchronous kickoff to avoid overspawning
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
                  Math.abs(curIdx - currentRef.current) <= 24 ||
                  isAnchorIndex(curIdx, count)
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
