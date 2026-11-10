'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, isTouchDevice, prefersReducedMotion } from '@/lib/gsap';

/**
 * Custom magnetic cursor follower.
 * Starts as a minimal off-white dot and expands into a crisp circle with action label
 * ("VIEW", "EXPLORE", "BAG", "JOIN") over interactive [data-cursor] elements.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    const el = rootRef.current;
    if (!el) return;

    document.documentElement.classList.add('custom-cursor-enabled');

    const moveX = gsap.quickTo(el, 'x', { duration: 0.28, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.28, ease: 'power3.out' });

    const onPointerMove = (e: PointerEvent) => {
      if (!visible) setVisible(true);
      moveX(e.clientX);
      moveY(e.clientY);

      const target =
        e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor]') : null;
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
      document.documentElement.classList.remove('custom-cursor-enabled');
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
        transition: 'opacity 0.22s ease',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,backdrop-filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: 'translate(-50%, -50%)',
          width: isExpanded ? '76px' : '14px',
          height: isExpanded ? '76px' : '14px',
          backgroundColor: isExpanded ? 'rgba(10, 10, 10, 0.45)' : 'rgba(242, 240, 235, 0.94)',
          borderWidth: isExpanded ? '1.5px' : '1px',
          borderColor: isExpanded ? '#F2F0EB' : 'rgba(242, 240, 235, 0.9)',
          backdropFilter: isExpanded ? 'blur(8px)' : 'none',
          boxShadow: isExpanded ? '0 0 24px rgba(242, 240, 235, 0.14)' : 'none',
        }}
      >
        <span
          className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#F2F0EB] transition-opacity duration-200"
          style={{ opacity: isExpanded ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
