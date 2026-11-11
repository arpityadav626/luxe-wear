'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { brandConfig } from '@/lib/brand.config';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useAppState } from './SmoothScrollProvider';

let sessionShown = false;

/**
 * Restrained 1.8s editorial curtain on initial `/` entry:
 * Sentence-case Instrument Serif wordmark + single hairline progress rule on #0B0B0A,
 * bypassed immediately under reduced motion, hash deep-links, or non-home routes.
 */
export function Preloader() {
  const pathname = usePathname();
  const { markPreloaded } = useAppState();
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  const [dismissed, setDismissed] = useState(
    () => pathname !== '/' || sessionShown
  );

  useEffect(() => {
    if (dismissed) {
      markPreloaded();
      return;
    }

    const skipImmediately =
      pathname !== '/' ||
      sessionShown ||
      prefersReducedMotion() ||
      (typeof window !== 'undefined' && window.location.hash.length > 1);

    if (skipImmediately) {
      sessionShown = true;
      markPreloaded();
      const raf = requestAnimationFrame(() => setDismissed(true));
      return () => cancelAnimationFrame(raf);
    }

    sessionShown = true;
    const root = rootRef.current;
    const line = lineRef.current;
    const pct = pctRef.current;
    const words = wordsRef.current;
    if (!root) {
      markPreloaded();
      return;
    }

    const counter = { val: 0 };
    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      markPreloaded();
    };

    const tl = gsap.timeline({
      onComplete: () => {
        release();
        setDismissed(true);
      },
    });

    if (words) {
      const spans = words.querySelectorAll<HTMLElement>('[data-preloader-word]');
      tl.fromTo(
        spans,
        { yPercent: 108 },
        { yPercent: 0, duration: 0.72, stagger: 0.08, ease: 'expo.out' },
        0
      );
    }

    if (line) {
      tl.fromTo(
        line,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.25, ease: 'expo.out' },
        0.05
      );
    }

    tl.to(
      counter,
      {
        val: 100,
        duration: 1.25,
        ease: 'expo.out',
        onUpdate: () => {
          if (pct) {
            pct.textContent = `${String(Math.round(counter.val)).padStart(3, '0')}`;
          }
        },
      },
      0.05
    );

    // Signal Hero reveal just as curtain begins sweeping up (~1.38s), completing at ~1.8s
    tl.call(release, undefined, 1.38);
    tl.to(
      root,
      {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.44,
        ease: 'power3.inOut',
      },
      1.36
    );

    const safety = window.setTimeout(() => {
      release();
      setDismissed(true);
    }, 2050);

    return () => {
      window.clearTimeout(safety);
      tl.kill();
    };
  }, [dismissed, markPreloaded, pathname]);

  if (dismissed) return null;

  return (
    <div
      id="site-preloader"
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 flex flex-col justify-between bg-[#0B0B0A] text-[#EDE8DF]"
      style={{
        zIndex: 'var(--z-preloader)',
        padding: '26px var(--gutter) 32px',
        clipPath: 'inset(0% 0% 0% 0%)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] tracking-[0.04em] text-[#EDE8DF]">
          {brandConfig.brand.name}
        </span>
        <span className="text-[14px] tracking-[0.04em] text-[#8A857B]">
          {brandConfig.piece.season}
        </span>
      </div>

      <div className="my-auto flex flex-col gap-6">
        <div ref={wordsRef} className="overflow-hidden py-2">
          <div className="display flex flex-wrap items-baseline gap-x-[0.22em] text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.94] tracking-[-0.03em] text-[#EDE8DF]">
            <span className="inline-block overflow-hidden pb-1">
              <span data-preloader-word className="inline-block">
                {brandConfig.brand.shortLines[0]}
              </span>
            </span>
            <span className="inline-block overflow-hidden pb-1">
              <span data-preloader-word className="inline-block italic text-[#EDE8DF]/92">
                {brandConfig.brand.shortLines[1]}
              </span>
            </span>
          </div>
        </div>

        <div className="h-[1px] w-full overflow-hidden bg-[#EDE8DF]/14">
          <div
            ref={lineRef}
            className="h-full w-full origin-left bg-[#B8A27A]"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between text-[14px] tracking-[0.04em] text-[#8A857B]">
        <span>{brandConfig.piece.name}</span>
        <span ref={pctRef} className="tabular-nums text-[#EDE8DF]/82">
          000
        </span>
      </div>
    </div>
  );
}
