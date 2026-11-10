'use client';

import { useEffect, useRef, useState } from 'react';
import { EASE, gsap, prefersReducedMotion } from '@/lib/gsap';
import { brandConfig } from '@/lib/brand.config';
import { useAppState } from './SmoothScrollProvider';

/**
 * Section 1: PRELOADER
 * Quick, tactile 000–100 counter + LUXE WEAR reveal completing under ~1.0s
 * so the Hero headline is immediately accessible on load.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const { markPreloaded } = useAppState();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      const t = window.setTimeout(() => {
        gsap.to(root, {
          autoAlpha: 0,
          duration: 0.15,
          onComplete: () => {
            setDone(true);
            markPreloaded();
          },
        });
      }, 30);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    let fontsReady = false;
    document.fonts.ready.then(() => {
      fontsReady = true;
    });

    const MIN_SECONDS = 0.28;
    const MAX_SECONDS = 0.52;
    const start = performance.now();
    const shown = { val: 0 };

    const tick = () => {
      if (cancelled) return;
      const elapsed = (performance.now() - start) / 1000;
      const timeProgress = Math.min(100, (elapsed / MIN_SECONDS) * 100);
      const readyTarget = fontsReady || elapsed >= MAX_SECONDS ? 100 : 88;
      const goal = Math.min(readyTarget, timeProgress);

      shown.val += (goal - shown.val) * 0.34;
      if (goal === 100 && shown.val > 98.5) {
        shown.val = 100;
      }

      if (countRef.current) {
        countRef.current.textContent = String(Math.round(shown.val)).padStart(3, '0');
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${shown.val / 100})`;
      }

      if (shown.val >= 100) {
        gsap.ticker.remove(tick);

        const tl = gsap.timeline({
          onStart: () => {
            window.setTimeout(() => {
              if (!cancelled) markPreloaded();
            }, 60);
          },
          onComplete: () => {
            if (!cancelled) setDone(true);
          },
        });

        tl.to(root, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.44,
          ease: EASE.expoInOut,
        });
      }
    };

    gsap.ticker.add(tick);
    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
    };
  }, [markPreloaded]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${brandConfig.brand.name}`}
      className="fixed inset-0 flex flex-col justify-between bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        zIndex: 'var(--z-preloader)',
        padding: 'var(--gutter)',
        clipPath: 'inset(0% 0% 0% 0%)',
      }}
    >
      <div className="flex items-center justify-between border-b border-[#F2F0EB]/10 pb-4">
        <span className="text-[13px] uppercase tracking-[0.16em] text-[#9A9790]">
          {brandConfig.brand.tagline}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <p className="font-display text-[clamp(2.4rem,8vw,6.8rem)] font-semibold uppercase leading-[0.9] tracking-[-0.01em] [word-spacing:0.22em] text-[#F2F0EB]">
          {brandConfig.brand.name}
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-end">
          <span
            ref={countRef}
            className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-none tracking-[-0.02em] tabular-nums text-[#F2F0EB]"
          >
            000
          </span>
        </div>
        <div className="h-[1px] w-full overflow-hidden bg-[#F2F0EB]/12">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-[#F2F0EB]"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </div>
  );
}
