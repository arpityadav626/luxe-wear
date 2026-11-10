'use client';

import { useEffect, useRef, useState } from 'react';
import { EASE, gsap, prefersReducedMotion } from '@/lib/gsap';
import { siteConfig } from '@/config/site';
import { useAppState } from './SmoothScrollProvider';

/**
 * Section 1: PRELOADER
 * Percentage counter 000–100 tracking real document.fonts.ready + minimal floor/cap,
 * followed by a continuous clip-path curtain reveal straight into the Hero.
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
          duration: 0.2,
          onComplete: () => {
            setDone(true);
            markPreloaded();
          },
        });
      }, 60);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    let fontsReady = false;
    document.fonts.ready.then(() => {
      fontsReady = true;
    });

    const MIN_SECONDS = 0.85;
    const MAX_SECONDS = 1.65;
    const start = performance.now();
    const shown = { val: 0 };

    const tick = () => {
      if (cancelled) return;
      const elapsed = (performance.now() - start) / 1000;
      const timeProgress = Math.min(100, (elapsed / MIN_SECONDS) * 100);
      const readyTarget = fontsReady || elapsed >= MAX_SECONDS ? 100 : 88;
      const goal = Math.min(readyTarget, timeProgress);

      shown.val += (goal - shown.val) * 0.18;
      if (goal === 100 && shown.val > 99.2) {
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

        // Keep content visible inside the curtain as the entire curtain sweeps upward cleanly
        const tl = gsap.timeline({
          onStart: () => {
            window.setTimeout(() => {
              if (!cancelled) markPreloaded();
            }, 180);
          },
          onComplete: () => {
            if (!cancelled) setDone(true);
          },
        });

        tl.to(root, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.85,
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
      aria-label={`Loading ${siteConfig.brand.name}`}
      className="fixed inset-0 flex flex-col justify-between bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        zIndex: 'var(--z-preloader)',
        padding: 'var(--gutter)',
        clipPath: 'inset(0% 0% 0% 0%)',
      }}
    >
      {/* Top status bar */}
      <div className="flex items-center justify-between border-b border-[#F2F0EB]/12 pb-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8D8B86]">
          {siteConfig.brand.season}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8D8B86]">
          {siteConfig.brand.coordinates}
        </span>
      </div>

      {/* Center brand wordmark */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.26em] text-[#C8FF3D]">
          CALIBRATING ARCHIVE
        </p>
        <p className="font-display text-[clamp(2.4rem,8vw,7rem)] font-semibold uppercase leading-[0.88] tracking-[-0.04em]">
          {siteConfig.brand.name}
        </p>
      </div>

      {/* Bottom percentage counter + 1px accent line */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8D8B86]">
            {siteConfig.heroGarment.code} / INITIALIZING 3D STAGE
          </span>
          <span
            ref={countRef}
            className="font-display text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-none tracking-[-0.04em] tabular-nums text-[#F2F0EB]"
          >
            000
          </span>
        </div>
        <div className="h-[1px] w-full overflow-hidden bg-[#F2F0EB]/12">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-[#C8FF3D]"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </div>
  );
}
