'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { EASE, gsap, isTouchDevice, prefersReducedMotion } from '@/lib/gsap';

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic attraction wrapper for primary CTAs and nav actions.
 * Disabled automatically on touch devices and prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  strength = 0.28,
  className = '',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isTouchDevice() || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: EASE.power3Out });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: EASE.power3Out });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-flex ${className}`}>
      {children}
    </div>
  );
}
