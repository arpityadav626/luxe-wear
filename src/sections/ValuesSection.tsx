'use client';

import { useEffect, useRef } from 'react';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

/**
 * Reusable GSAP Scroll-Triggered Number Counter.
 * Rendered ONLY when a verified client `value` is populated in `brandConfig.values`.
 */
export function AnimatedCounter({
  value,
  suffix = '',
  label,
}: {
  value: number;
  suffix?: string;
  label?: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el || prefersReducedMotion()) return;

    const proxy = { current: 0 };
    const tween = gsap.to(proxy, {
      current: value,
      duration: 0.85,
      ease: EASE.power3Out,
      onUpdate: () => {
        el.textContent = String(Math.round(proxy.current));
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        once: true,
      },
    });

    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <div className="mb-5">
      {label && (
        <p className="mb-2 text-[13px] uppercase tracking-[0.14em] text-[#9A9790]">{label}</p>
      )}
      <div className="flex items-baseline gap-1 font-display text-[clamp(3rem,4.8vw,4.75rem)] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[#F2F0EB]">
        <span ref={numRef}>{value}</span>
        {suffix && (
          <span className="text-[clamp(1.5rem,2.4vw,2.4rem)] font-medium text-[#9A9790]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Section 7: PRINCIPLES / VALUES
 * Three minimal columns with SVG line-draw rules and concise editorial copy (<= 2 lines).
 * Optional metric counter renders exclusively when `item.metric !== null`.
 */
export function ValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const headingLines = headingRef.current?.querySelectorAll<HTMLElement>('[data-values-line]');
      if (headingLines && headingLines.length > 0) {
        gsap.fromTo(
          headingLines,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: DURATION.base,
            stagger: 0.085,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      const drawLines = section.querySelectorAll<SVGGeometryElement>('[data-line-draw]');
      drawLines.forEach((shape, idx) => {
        const len = shape.getTotalLength ? shape.getTotalLength() : 320;
        gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(shape, {
          strokeDashoffset: 0,
          duration: 1.15,
          delay: idx * 0.08,
          ease: EASE.expoOut,
          scrollTrigger: {
            trigger: section.querySelector('[data-values-grid]') ?? section,
            start: 'top 84%',
            once: true,
          },
        });
      });

      const cards = section.querySelectorAll<HTMLElement>('[data-value-col]');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: EASE.power3Out,
            scrollTrigger: {
              trigger: section.querySelector('[data-values-grid]') ?? section,
              start: 'top 84%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const { values } = brandConfig;

  return (
    <section
      id="values"
      ref={sectionRef}
      aria-label="Principles"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(6rem, 16vh, 11rem) var(--gutter)',
      }}
    >
      <div className="mb-10 border-b border-[#F2F0EB]/12 pb-4 sm:mb-14">
        <span className="text-xs uppercase tracking-[0.12em] text-[#9A9790]">
          {values.label}
        </span>
      </div>

      <h2
        ref={headingRef}
        className="max-w-4xl font-display text-[clamp(1.85rem,5.2vw,4.8rem)] font-semibold uppercase leading-[0.96] tracking-[-0.015em]"
      >
        {values.headingLines.map((line, i) => (
          <span key={line} className="block overflow-hidden pb-1">
            <span
              data-values-line
              className={`block ${i === 1 ? 'text-[#9A9790]' : 'text-[#F2F0EB]'}`}
            >
              {line}
            </span>
          </span>
        ))}
      </h2>

      <div
        data-values-grid
        className="mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-3 md:gap-10"
      >
        {values.items.map((item) => (
          <article key={item.id} data-value-col className="flex flex-col pt-2">
            {/* Animated SVG Line-Draw Precision Rule */}
            <svg
              aria-hidden="true"
              viewBox="0 0 360 12"
              fill="none"
              className="mb-6 h-3 w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <line
                data-line-draw
                x1="0"
                y1="6"
                x2="360"
                y2="6"
                stroke="rgba(242, 240, 235, 0.2)"
                strokeWidth="1"
              />
              <line
                data-line-draw
                x1="0"
                y1="6"
                x2="56"
                y2="6"
                stroke="rgba(242, 240, 235, 0.85)"
                strokeWidth="1.5"
              />
            </svg>

            {item.metric !== null && (
              <AnimatedCounter
                value={item.metric}
                suffix={item.suffix}
                label={item.metricLabel}
              />
            )}

            <h3 className="font-display text-2xl font-medium uppercase tracking-[-0.01em] text-[#F2F0EB]">
              {item.title}
            </h3>
            <p className="mt-2.5 max-w-sm text-base leading-relaxed text-[#9A9790]">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
