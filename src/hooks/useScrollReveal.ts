'use client';

import { useEffect, type RefObject } from 'react';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

export type RevealMode = 'up' | 'clip' | 'scale' | 'lines';

interface ScrollRevealOptions {
  mode?: RevealMode;
  delay?: number;
  duration?: number;
  start?: string;
  stagger?: number;
}

/**
 * Reusable GSAP ScrollTrigger reveal hook.
 * Automatically respects prefers-reduced-motion and cleans up inside gsap.context.
 */
export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options: ScrollRevealOptions = {}
) {
  const {
    mode = 'up',
    delay = 0,
    duration = DURATION.base,
    start = 'top 86%',
    stagger = 0.08,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (mode === 'lines') {
        const lines = el.querySelectorAll<HTMLElement>('[data-reveal-line]');
        const targets = lines.length > 0 ? lines : [el];
        gsap.fromTo(
          targets,
          { yPercent: 105, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration,
            stagger,
            delay,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
        return;
      }

      if (mode === 'clip') {
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DURATION.slow,
            delay,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
        return;
      }

      if (mode === 'scale') {
        gsap.fromTo(
          el,
          { clipPath: 'inset(10% 10% 10% 10%)', scale: 1.12 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: DURATION.slow,
            delay,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
        return;
      }

      gsap.fromTo(
        el,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: EASE.power3Out,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        }
      );
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [ref, mode, delay, duration, start, stagger]);
}
