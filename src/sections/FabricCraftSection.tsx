'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Section 3: CLOTH & TAILORING (THE ONE LIGHT BONE SECTION)
 * Warm bone ground (#EDE8DF) paired with obsidian ink (#0B0B0A), muted stone (#6E695F / #5E5950),
 * sentence-case Instrument Serif headline, sculptural travertine/twill photography,
 * and a single restrained editorial statement.
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
            stagger: 0.09,
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
          { clipPath: 'inset(12% 0% 0% 0%)' },
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
          { yPercent: -4, scale: 1.14 },
          {
            yPercent: 4,
            scale: 1.08,
            ease: 'none',
            scrollTrigger: {
              trigger: macroFrameRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
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
      aria-label="Cloth and tailoring"
      className="relative w-full bg-[#EDE8DF] text-[#0B0B0A]"
      style={{
        padding: 'clamp(4.5rem, 10vh, 7.5rem) var(--gutter)',
      }}
    >
      <div className="mb-8 border-b border-[#0B0B0A]/14 pb-4 sm:mb-10">
        <span className="text-[14px] tracking-[0.04em] text-[#5E5950]">{craft.label}</span>
      </div>

      <div ref={headlineBlockRef} className="max-w-5xl">
        <h2 className="display text-[clamp(2.5rem,5.4vw,5.4rem)] leading-[0.95] tracking-[-0.025em]">
          {craft.headlineLines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-1">
              <span
                data-craft-line
                className={`block ${i === 1 ? 'text-[#6E695F]' : 'text-[#0B0B0A]'}`}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 items-end gap-8 md:mt-12 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-6">
          <div
            ref={macroFrameRef}
            className="relative aspect-[4/3] max-h-[54vh] w-full overflow-hidden bg-[#DFD8CC]"
          >
            <div ref={macroMediaRef} className="relative h-full w-full will-change-transform">
              <Image
                src={assetPath(craft.macroImage)}
                alt={craft.macroAlt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 92vw, 48vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 md:pb-2">
          <p className="max-w-[34ch] text-[18px] leading-[1.6] text-[#0B0B0A]/86 sm:text-[20px]">
            {craft.statement}
          </p>
        </div>
      </div>
    </section>
  );
}
