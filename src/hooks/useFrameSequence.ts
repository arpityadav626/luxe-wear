'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { assetPath } from '@/lib/assets';
import { frameSrc, sequence } from '@/lib/brand.config';

/**
 * Preloads the turntable frames and draws the requested one to a canvas
 * ("contain" fit, retina-aware). Returns render(i) to call from ScrollTrigger.
 */
export function useFrameSequence(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const images = useRef<HTMLImageElement[]>([]);
  const current = useRef(0);
  const failed = useRef(false);

  const draw = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      // Use nearest loaded frame at or before `index` (fallback upward if needed) for zero flicker
      let img: HTMLImageElement | undefined;
      for (let k = index; k >= 0; k--) {
        const c = images.current[k];
        if (c && c.complete && c.naturalWidth) {
          img = c;
          break;
        }
      }
      if (!img) {
        for (let k = index + 1; k < images.current.length; k++) {
          const c = images.current[k];
          if (c && c.complete && c.naturalWidth) {
            img = c;
            break;
          }
        }
      }

      if (!img) {
        if (failed.current) {
          ctx.fillStyle = '#8A857B';
          ctx.font = `${Math.round(w * 0.025)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Add frames to /public/sequence', w / 2, h / 2);
        }
        return;
      }

      const s =
        w > h
          ? Math.min((w * 0.38) / img.naturalWidth, (h * 0.76) / img.naturalHeight)
          : Math.min((w * 0.88) / img.naturalWidth, (h * 0.88) / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    },
    [canvasRef]
  );

  const render = useCallback(
    (i: number) => {
      current.current = Math.max(0, Math.min(sequence.count - 1, Math.round(i)));
      draw(current.current);
    },
    [draw]
  );

  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(sequence.count);
    images.current = imgs;

    const loadIndex = (i: number) => {
      if (cancelled || imgs[i]) return;
      const img = new window.Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!cancelled && i <= current.current) {
          draw(current.current);
        }
      };
      if (i === 0) {
        img.onerror = () => {
          if (!cancelled) {
            failed.current = true;
            draw(0);
          }
        };
      }
      img.src = assetPath(frameSrc(i + 1));
      imgs[i] = img;
    };

    // Load opening frame immediately so the garment stage is ready without competing with Hero LCP.
    loadIndex(0);

    // Trigger remaining 89 frames as soon as user interacts/scrolls or Pinned Story enters viewport,
    // protecting mobile Hero LCP and initial network budget while ensuring instant scrub readiness.
    let restStarted = false;
    const loadRemaining = () => {
      if (cancelled || restStarted) return;
      restStarted = true;
      for (const stride of [6, 3, 1]) {
        for (let i = 0; i < sequence.count; i += stride) {
          loadIndex(i);
        }
      }
    };

    const onRealScroll = () => {
      if (window.scrollY > 12) loadRemaining();
    };

    const onKeyScroll = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'Space', 'End', ' '].includes(e.key)) {
        loadRemaining();
      }
    };

    window.addEventListener('scroll', onRealScroll, { passive: true });
    window.addEventListener('wheel', loadRemaining, { once: true, passive: true });
    window.addEventListener('touchstart', loadRemaining, { once: true, passive: true });
    window.addEventListener('keydown', onKeyScroll, { passive: true });

    const canvasEl = canvasRef.current;
    let observer: IntersectionObserver | null = null;
    if (canvasEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            loadRemaining();
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
      draw(current.current);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('scroll', onRealScroll);
      window.removeEventListener('wheel', loadRemaining);
      window.removeEventListener('touchstart', loadRemaining);
      window.removeEventListener('keydown', onKeyScroll);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, draw]);

  return { render };
}
