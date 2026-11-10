'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Section 4: FABRIC / CRAFT
 * Masked line-by-line editorial statement reveal paired with slow scrubbed parallax
 * and scale-on-scroll across macro Japanese 3L technical twill imagery.
 */
export function FabricCraftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineBlockRef = useRef<HTMLDivElement>(null);
  const macroFrameRef = useRef<HTMLDivElement>(null);
  const macroMediaRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);

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
          { yPercent: -7, scale: 1.16 },
          {
            yPercent: 7,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: macroFrameRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.4,
            },
          }
        );
      }

      const layerItems = specsRef.current?.querySelectorAll<HTMLElement>('[data-layer-row]');
      if (layerItems && layerItems.length > 0) {
        gsap.fromTo(
          layerItems,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: EASE.power3Out,
            scrollTrigger: {
              trigger: specsRef.current,
              start: 'top 86%',
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

  const craft = siteConfig.fabricCraft;

  return (
    <section
      id="fabric-craft"
      ref={sectionRef}
      aria-label="Fabric Material and Tailoring Craft"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(5.5rem, 12vh, 9rem) var(--gutter)',
      }}
    >
      {/* Top Section Header Row */}
      <div className="mb-10 flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-4 sm:mb-14">
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
          {craft.indexLabel}
        </span>
        <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] sm:inline">
          {craft.origin}
        </span>
      </div>

      {/* Large Masked Split-Text Manifesto */}
      <div ref={headlineBlockRef} className="max-w-5xl">
        <h2 className="font-display text-[clamp(1.75rem,5.2vw,5rem)] font-semibold uppercase leading-[0.94] tracking-[-0.035em]">
          {craft.headlineLines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-1">
              <span
                data-craft-line
                className={`block ${i === 1 ? 'text-[#8D8B86]' : 'text-[#F2F0EB]'}`}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        <p className="mt-5 max-w-3xl text-lg leading-snug text-[#F2F0EB]/80 sm:text-2xl sm:leading-tight">
          {craft.statementLines.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span data-craft-line className="block">
                {line}
              </span>
            </span>
          ))}
        </p>
      </div>

      {/* Editorial Grid: Left Macro Parallax Textile | Right 3L Construction Specs */}
      <div className="mt-10 grid grid-cols-1 items-start gap-10 md:mt-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <figure>
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
                  loading="eager"
                  sizes="(max-width: 768px) 92vw, 56vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>

              {/* Subtle edge gradient scrim for corner caption legibility */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent"
              />

              <figcaption className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#F2F0EB]/85">
                <span>{craft.macroCaption}</span>
                <span className="hidden text-[#C8FF3D] sm:inline">MACRO 12X</span>
              </figcaption>
            </div>
          </figure>
        </div>

        <div className="flex flex-col justify-between md:col-span-5 md:pt-4">
          <p className="text-base leading-relaxed text-[#F2F0EB]/80 sm:text-lg">
            {craft.narrative}
          </p>

          <div
            ref={specsRef}
            className="mt-10 divide-y divide-[#F2F0EB]/12 border-y border-[#F2F0EB]/12"
          >
            {craft.layers.map((item) => (
              <div key={item.index} data-layer-row className="py-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8FF3D]">
                    {item.index}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86]">
                    LAMINATE SPEC
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-medium tracking-[-0.02em] text-[#F2F0EB]">
                  {item.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#8D8B86]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
