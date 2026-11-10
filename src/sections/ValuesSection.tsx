'use client';

import { useEffect, useRef } from 'react';
import { siteConfig } from '@/config/site';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

/**
 * Section 7: FEATURES / VALUES
 * Three minimal architectural columns (Sustainable, Limited Drops, Made to Last)
 * featuring animated numeric counters and SVG stroke line-draw animations.
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

      // Draw each precision horizontal schematic stroke from left to right
      const drawLines = section.querySelectorAll<SVGGeometryElement>('[data-line-draw]');
      drawLines.forEach((shape, idx) => {
        const len = shape.getTotalLength ? shape.getTotalLength() : 320;
        gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(shape, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: idx * 0.1,
          ease: EASE.expoOut,
          scrollTrigger: {
            trigger: section.querySelector('[data-values-grid]') ?? section,
            start: 'top 82%',
            once: true,
          },
        });
      });

      // Stagger columns in and scrub/count metrics smoothly from 0 -> target
      const cards = section.querySelectorAll<HTMLElement>('[data-value-col]');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.12,
            ease: EASE.power3Out,
            scrollTrigger: {
              trigger: section.querySelector('[data-values-grid]') ?? section,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }

      const counters = section.querySelectorAll<HTMLElement>('[data-counter-target]');
      counters.forEach((el) => {
        const target = Number(el.dataset.counterTarget ?? '0');
        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: target,
          duration: 0.85,
          ease: EASE.power3Out,
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.value));
          },
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
          },
        });
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const { values } = siteConfig;

  return (
    <section
      id="values"
      ref={sectionRef}
      aria-label="Brand Values and Principles"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(5.5rem, 12vh, 9rem) var(--gutter)',
      }}
    >
      {/* Top Section Index */}
      <div className="mb-10 flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-4 sm:mb-14">
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
          {values.indexLabel}
        </span>
        <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] sm:inline">
          SYSTEM ARCHITECTURE
        </span>
      </div>

      {/* Concise 2-Line Display Headline */}
      <h2
        ref={headingRef}
        className="max-w-4xl font-display text-[clamp(1.85rem,5.2vw,5rem)] font-semibold uppercase leading-[0.94] tracking-[-0.035em]"
      >
        {values.headingLines.map((line, i) => (
          <span key={line} className="block overflow-hidden pb-1">
            <span
              data-values-line
              className={`block ${i === 1 ? 'text-[#8D8B86]' : 'text-[#F2F0EB]'}`}
            >
              {line}
            </span>
          </span>
        ))}
      </h2>

      {/* 3 Minimal Value Columns with SVG Line-Draw Rules & Numeric Counters */}
      <div
        data-values-grid
        className="mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-3 md:gap-8"
      >
        {values.items.map((item) => (
          <article key={item.index} data-value-col className="flex flex-col justify-between pt-2">
            <div>
              {/* Animated SVG Line-Draw Precision Header Rule */}
              <svg
                aria-hidden="true"
                viewBox="0 0 360 14"
                fill="none"
                className="mb-6 h-3.5 w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <line
                  data-line-draw
                  x1="0"
                  y1="7"
                  x2="360"
                  y2="7"
                  stroke="rgba(242, 240, 235, 0.24)"
                  strokeWidth="1"
                />
                <line
                  data-line-draw
                  x1="0"
                  y1="7"
                  x2="72"
                  y2="7"
                  stroke="#C8FF3D"
                  strokeWidth="1.5"
                />
                <line
                  data-line-draw
                  x1="360"
                  y1="1"
                  x2="360"
                  y2="13"
                  stroke="rgba(200, 255, 61, 0.65)"
                  strokeWidth="1"
                />
              </svg>

              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8FF3D]">
                  {item.index}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86]">
                  {item.metricLabel}
                </span>
              </div>

              {/* Animated Counter Metric */}
              <div className="mt-6 flex items-baseline gap-1 font-display text-[clamp(3.2rem,5.2vw,5.25rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#F2F0EB]">
                <span data-counter-target={item.metric}>{item.metric}</span>
                {item.suffix && (
                  <span className="text-[clamp(1.6rem,2.6vw,2.6rem)] font-medium text-[#C8FF3D]">
                    {item.suffix}
                  </span>
                )}
              </div>

              <h3 className="mt-5 font-display text-2xl font-medium uppercase tracking-[-0.025em] text-[#F2F0EB]">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[#F2F0EB]/82">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
