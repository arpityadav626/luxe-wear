import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Shared easing vocabulary matching the Master Prompt:
 * power3.out / expo.out (0.8–1.4s), nothing snappy or bouncy.
 */
export const EASE = {
  expoOut: 'expo.out',
  power3Out: 'power3.out',
  expoInOut: 'expo.inOut',
} as const;

export const DURATION = {
  fast: 0.8,
  base: 1.05,
  slow: 1.35,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

export { gsap, ScrollTrigger };
