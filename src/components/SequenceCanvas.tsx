'use client';

import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import { assetPath } from '@/lib/assets';
import { brandConfig } from '@/lib/brand.config';

interface SequenceCanvasProps {
  /** Normalized scroll progress (0..1) driven by GSAP ScrollTrigger */
  progressRef: MutableRefObject<number>;
  /** Direct frame fallback when reduced motion or mobile tab selection skips scrubbing */
  activeProgress: number;
  className?: string;
}

function getFrameUrl(frameIndexZeroBased: number): string {
  const { pathPrefix, extension, frameCount } = brandConfig.sequence;
  const clamped = Math.max(0, Math.min(frameCount - 1, frameIndexZeroBased));
  const padded = String(clamped + 1).padStart(4, '0');
  return assetPath(`${pathPrefix}${padded}${extension}`);
}

/**
 * Scroll-scrubbed image-sequence HTML5 <canvas> player.
 *
 * CLIENT TURNTABLE SWAP GUIDE:
 * Place numbered WebP frames in `/public/sequence/frame_0001.webp` ... `frame_XXXX.webp`:
 *   ffmpeg -i turntable.mp4 -vf "fps=30,scale=1600:-1" public/sequence/frame_%04d.webp
 * Then update `brandConfig.sequence.frameCount` in `src/lib/brand.config.ts`.
 */
export function SequenceCanvas({
  progressRef,
  activeProgress,
  className = '',
}: SequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnIdxRef = useRef<number>(-1);
  const rafIdRef = useRef<number>(0);

  const drawFrame = useCallback((targetIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = framesRef.current;
    let img = frames[targetIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback to nearest loaded frame (starting with frame 0) so stage never flashes blank
      for (let offset = 1; offset < frames.length; offset++) {
        const backward = frames[targetIndex - offset];
        if (backward?.complete && backward.naturalWidth > 0) {
          img = backward;
          break;
        }
        const forward = frames[targetIndex + offset];
        if (forward?.complete && forward.naturalWidth > 0) {
          img = forward;
          break;
        }
      }
      if (!img?.complete) {
        img = frames[0] ?? null;
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    if (displayW === 0 || displayH === 0) return;

    const targetW = Math.round(displayW * dpr);
    const targetH = Math.round(displayH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.clearRect(0, 0, targetW, targetH);

    // Contain fit preserving studio proportions with subtle soft bottom fade into dark canvas
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = targetW / targetH;
    let drawW = targetW;
    let drawH = targetH;
    if (imgRatio > boxRatio) {
      drawH = targetW / imgRatio;
    } else {
      drawW = targetH * imgRatio;
    }
    const offsetX = (targetW - drawW) * 0.5;
    const offsetY = (targetH - drawH) * 0.5;

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    lastDrawnIdxRef.current = targetIndex;
  }, []);

  // Preload frame 0 immediately, then progressively buffer the remaining frames
  useEffect(() => {
    const total = brandConfig.sequence.frameCount;
    const list: (HTMLImageElement | null)[] = new Array(total).fill(null);
    framesRef.current = list;

    let cancelled = false;

    const loadSingle = (idx: number): Promise<void> =>
      new Promise((resolve) => {
        if (cancelled) {
          resolve();
          return;
        }
        const img = new window.Image();
        img.decoding = 'async';
        img.src = getFrameUrl(idx);
        img.onload = () => {
          list[idx] = img;
          if (idx === 0 || idx === lastDrawnIdxRef.current) {
            drawFrame(Math.max(0, lastDrawnIdxRef.current));
          }
          resolve();
        };
        img.onerror = () => resolve();
      });

    // Draw frame 0 ASAP for zero cold start, then batch remaining frames gently
    loadSingle(0).then(async () => {
      if (cancelled) return;
      drawFrame(0);
      const batchSize = 6;
      for (let start = 1; start < total; start += batchSize) {
        if (cancelled) break;
        const batch = [];
        for (let i = start; i < Math.min(total, start + batchSize); i++) {
          batch.push(loadSingle(i));
        }
        await Promise.all(batch);
      }
    });

    const onResize = () => {
      if (lastDrawnIdxRef.current >= 0) {
        drawFrame(lastDrawnIdxRef.current);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
    };
  }, [drawFrame]);

  // Keep canvas synced smoothly to scroll progress on desktop, or selected stage stop on mobile/reduced motion
  useEffect(() => {
    const total = brandConfig.sequence.frameCount;
    const targetFromProp = Math.round(
      Math.max(0, Math.min(1, activeProgress)) * (total - 1)
    );
    drawFrame(targetFromProp);

    let running = true;
    const loop = () => {
      if (!running) return;
      const p = progressRef.current;
      const desired = Math.round(Math.max(0, Math.min(1, p)) * (total - 1));
      if (desired !== lastDrawnIdxRef.current) {
        drawFrame(desired);
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [activeProgress, drawFrame, progressRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={brandConfig.sequence.heroAlt}
      role="img"
      className={`block h-full w-full ${className}`}
    />
  );
}
