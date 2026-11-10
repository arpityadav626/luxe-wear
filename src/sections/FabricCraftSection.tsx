'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Section 4: FABRIC / CRAFT
 * Masked line-by-line headline reveal paired with macro cloth parallax
 * and a collapsible Construction Details drawer (specs tucked out of primary canvas).
 */
export function FabricCraftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineBlockRef = useRef<HTMLDivElement>(null);
  const macroFrameRef = useRef<HTMLDivElement>(null);
  const macroMediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const lines = headlineBlockRef.current?.querySelectorAll<HTMLElement>('[data-craft-line]');
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: DURATION.base,
            stagger: 0.085,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: headlineBlockRef.current,
              start: 'top 84%',
              once: true,
            },
          }
        );
      }

      if (macroFrameRef.current) {
        gsap.fromTo(
          macroFrameRef.current,
          { clipPath: 'inset(14% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DURATION.slow,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: macroFrameRef.current,
              start: 'top 86%',
              once: true,
            },
          }
        );
      }

      if (macroMediaRef.current && macroFrameRef.current) {
        gsap.fromTo(
          macroMediaRef.current,
          { yPercent: -7, scale: 1.15 },
          {
            yPercent: 7,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: macroFrameRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.45,
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

  const craft = brandConfig.fabricCraft;

  return (
    <section
      id="fabric-craft"
      ref={sectionRef}
      aria-label="Fabric Material and Tailoring"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(5.5rem, 12vh, 9rem) var(--gutter)',
      }}
    >
      {/* Minimal Top Label */}
      <div className="mb-10 border-b border-[#F2F0EB]/12 pb-4 sm:mb-14">
        <span className="text-[13px] uppercase tracking-[0.18em] text-[#9A9790]">
          {craft.label}
        </span>
      </div>

      {/* Masked Line-by-Line Headline */}
      <div ref={headlineBlockRef} className="max-w-6xl">
        <h2 className="font-display text-[clamp(1.42rem,4.35vw,4.2rem)] font-semibold uppercase leading-[0.98] tracking-[-0.015em]">
          {craft.headlineLines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-1">
              <span
                data-craft-line
                className={`block ${i === 1 ? 'text-[#9A9790]' : 'text-[#F2F0EB]'}`}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>
      </div>

      {/* Editorial Grid: Left Macro Parallax Textile | Right Concise Line + Details Drawer */}
      <div className="mt-10 grid grid-cols-1 items-start gap-10 md:mt-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <div
            ref={macroFrameRef}
            data-cursor="ZOOM"
            className="group relative aspect-[4/4.2] max-h-[72vh] w-full overflow-hidden bg-[#121212]"
          >
            <div ref={macroMediaRef} className="relative h-full w-full will-change-transform">
              <Image
                src={assetPath(craft.macroImage)}
                alt={craft.macroAlt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 92vw, 56vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between md:col-span-5 md:pt-4">
          <p className="text-lg leading-relaxed text-[#F2F0EB]/85 sm:text-xl sm:leading-snug">
            {craft.statement}
          </p>

          <details className="mt-8 border-y border-[#F2F0EB]/14 py-4">
            <summary className="flex cursor-pointer items-center justify-between text-[13px] uppercase tracking-[0.16em] text-[#F2F0EB]/85 transition-colors hover:text-[#F2F0EB]">
              <span>{craft.detailsDrawerLabel}</span>
              <span aria-hidden="true" className="text-sm text-[#9A9790]">
                +
              </span>
            </summary>
            <dl className="mt-4 divide-y divide-[#F2F0EB]/10 border-t border-[#F2F0EB]/10">
              {craft.specs.map((spec) => (
                <div key={spec.label} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <dt className="text-[13px] uppercase tracking-[0.14em] text-[#9A9790]">
                    {spec.label}
                  </dt>
                  <dd className="text-sm text-[#F2F0EB]/85 sm:text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </div>
    </section>
  );
}
