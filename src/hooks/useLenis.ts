'use client';

import { useEffect, useState } from 'react';
import type Lenis from 'lenis';
import { useSmoothScrollContext } from '@/components/SmoothScrollProvider';

export type ScrollMetrics = {
  y: number;
  progress: number;
  velocity: number;
};

/**
 * Reusable hook to access the active Lenis instance, scroll lock helpers,
 * and subscribe to GSAP-synced Lenis scroll updates.
 */
export function useLenis(onUpdate?: (metrics: ScrollMetrics) => void) {
  const { lenis, scrollTo, stopScroll, startScroll, subscribeScroll, reducedMotion } =
    useSmoothScrollContext();

  useEffect(() => {
    if (!onUpdate) return;
    return subscribeScroll(onUpdate);
  }, [onUpdate, subscribeScroll]);

  return { lenis, scrollTo, stopScroll, startScroll, reducedMotion };
}

/**
 * Lightweight hook returning reactive normalized page scroll progress (0..1)
 * for non-WebGL HUD readouts. (For 60fps R3F animations, read the ref directly!)
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  const { subscribeScroll } = useSmoothScrollContext();

  useEffect(() => {
    return subscribeScroll((metrics) => {
      setProgress(metrics.progress);
    });
  }, [subscribeScroll]);

  return progress;
}

export type { Lenis };
