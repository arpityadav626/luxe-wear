'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, isTouchDevice, prefersReducedMotion } from '@/lib/gsap';

/**
 * Custom magnetic cursor follower.
 * Starts as a crisp electric-lime dot around the pointer and expands into a
 * labeled ring ("DRAG", "VIEW", "EXPLORE", "MENU", "BAG") over [data-cursor] targets.
 * Native cursor stays intact for usability and zero click-latency.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    const el = rootRef.current;
    if (!el) return;

    const moveX = gsap.quickTo(el, 'x', { duration: 0.32, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.32, ease: 'power3.out' });

    const onPointerMove = (e: PointerEvent) => {
      if (!visible) setVisible(true);
      moveX(e.clientX);
      moveY(e.clientY);

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      const nextLabel = target?.dataset.cursor?.trim() ?? '';
      setLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    };

    const onPointerLeave = () => {
      setVisible(false);
      setLabel('');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [visible]);

  const isExpanded = label.length > 0;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 hidden md:block"
      style={{
        zIndex: 'var(--z-cursor)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: 'translate(-50%, -50%)',
          width: isExpanded ? '76px' : '12px',
          height: isExpanded ? '76px' : '12px',
          backgroundColor: isExpanded ? 'rgba(200, 255, 61, 0.94)' : '#C8FF3D',
          borderColor: isExpanded ? 'rgba(200, 255, 61, 1)' : 'rgba(10, 10, 10, 0.25)',
          boxShadow: isExpanded ? '0 0 28px rgba(200, 255, 61, 0.22)' : 'none',
        }}
      >
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#0A0A0A] transition-opacity duration-200"
          style={{ opacity: isExpanded ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
