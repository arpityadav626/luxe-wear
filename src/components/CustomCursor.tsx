'use client';

// Quiet cursor: an 8px difference dot everywhere on fine pointers.
// A 72px ring + label appears ONLY over elements that opt in with [data-cursor].
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/gsap';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.matchMedia('(pointer: fine)').matches ||
      prefersReducedMotion()
    ) {
      return;
    }

    const d = dotRef.current;
    const r = ringRef.current;
    const l = labelRef.current;
    if (!d || !r || !l) return;

    document.documentElement.classList.add('has-cursor');
    gsap.set([d, r], { xPercent: -50, yPercent: -50 });
    gsap.set(d, { opacity: 0 });
    gsap.set(r, { opacity: 0, scale: 0 });

    const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3' });
    const rx = gsap.quickTo(r, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.5, ease: 'power3' });

    let shown = false;
    let active = false;

    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to(d, { opacity: 1, duration: 0.4 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const target =
        e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor]') : null;
      if (target) {
        const text = target.dataset.cursor?.trim() ?? '';
        if (text) {
          l.textContent = text;
        }
        if (!active) {
          active = true;
          gsap.to(r, { scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' });
          gsap.to(d, { scale: 0, duration: 0.3 });
        }
      } else if (active) {
        active = false;
        gsap.to(r, { scale: 0, opacity: 0, duration: 0.5, ease: 'expo.out' });
        gsap.to(d, { scale: 1, duration: 0.3 });
      }
    };

    const hide = () => gsap.to([d, r], { opacity: 0, duration: 0.3 });
    const show = () => {
      if (shown) {
        gsap.to(d, { opacity: active ? 0 : 1, duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.documentElement.addEventListener('mouseleave', hide);
    document.documentElement.addEventListener('mouseenter', show);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.documentElement.removeEventListener('mouseleave', hide);
      document.documentElement.removeEventListener('mouseenter', show);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  );
}
