'use client';

import { useRef } from 'react';
import { siteConfig } from '@/config/site';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLenis } from '@/hooks/useLenis';
import { MagneticButton } from '@/components/MagneticButton';

/**
 * Clean Stage 2 architectural close & Stage 3 ("Fabric / Craft") preview gateway.
 */
export function StageTeaserSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const nextCardRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();

  useScrollReveal(headlineRef, { mode: 'lines', stagger: 0.09 });
  useScrollReveal(specsRef, { mode: 'up', delay: 0.1 });
  useScrollReveal(nextCardRef, { mode: 'clip', delay: 0.05 });

  return (
    <section
      id="stage-next"
      className="relative border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(7rem, 15vh, 10rem) var(--gutter) clamp(5rem, 12vh, 8rem)',
      }}
    >
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-4">
          <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
            03 / SPECIFICATION SUMMARY
          </span>
          <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] sm:inline">
            {siteConfig.brand.season}
          </span>
        </div>

        <h2
          ref={headlineRef}
          className="font-display text-[clamp(1.75rem,5.2vw,5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.035em]"
        >
          <span className="block overflow-hidden">
            <span data-reveal-line className="block">
              Engineered silhouette.
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-reveal-line className="block text-[#8D8B86]">
              Zero ornament.
            </span>
          </span>
        </h2>

        <div
          ref={specsRef}
          className="mt-12 grid grid-cols-1 border-y border-[#F2F0EB]/12 sm:grid-cols-3 sm:divide-x sm:divide-[#F2F0EB]/12"
        >
          {siteConfig.heroGarment.specs.map((spec) => (
            <div key={spec.label} className="py-6 sm:px-6 sm:first:pl-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8D8B86]">
                {spec.label}
              </p>
              <p className="mt-2 font-display text-2xl font-medium tracking-[-0.02em] text-[#F2F0EB]">
                {spec.value}
              </p>
            </div>
          ))}
        </div>

        <div
          ref={nextCardRef}
          className="mt-14 flex flex-col items-start justify-between gap-6 border border-[#F2F0EB]/14 bg-[#121212] p-6 sm:flex-row sm:items-center sm:p-8"
          data-cursor="EXPLORE"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
              STAGE 02 COMPLETE · READY FOR STAGE 03
            </p>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#F2F0EB]/85">
              Next up in the build: Fabric &amp; Craft line-by-line split reveal, macro fabric
              parallax, and the Horizontal Scroll Capsule Collection.
            </p>
          </div>

          <MagneticButton strength={0.25}>
            <button
              type="button"
              onClick={() => scrollTo('#hero')}
              data-cursor="VIEW"
              className="shrink-0 rounded-full border border-[#F2F0EB]/22 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F2F0EB] transition-colors duration-300 hover:border-[#C8FF3D] hover:text-[#C8FF3D]"
            >
              Back to Top
            </button>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
