'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { siteConfig, type LookbookFrame } from '@/config/site';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Individual lookbook frame with clip-path + scale(1.15 -> 1) reveal,
 * continuous scrubbed image parallax, and opposing overlapping oversized display type.
 */
function LookbookPlate({ frame }: { frame: LookbookFrame }) {
  const plateRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plate = plateRef.current;
    if (!plate || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (clipRef.current) {
        gsap.fromTo(
          clipRef.current,
          { clipPath: 'inset(14% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DURATION.slow,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: plate,
              start: 'top 86%',
              once: true,
            },
          }
        );
      }

      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { yPercent: -6, scale: 1.15 },
          {
            yPercent: 6,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: plate,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.45,
            },
          }
        );
      }

      if (typeRef.current) {
        gsap.fromTo(
          typeRef.current,
          { yPercent: 14 },
          {
            yPercent: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: plate,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.55,
            },
          }
        );
      }
    }, plate);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const isWide = frame.layout === 'wide';

  return (
    <article
      ref={plateRef}
      aria-label={`${frame.index} ${frame.tag}`}
      className={
        isWide
          ? 'relative w-full'
          : frame.layout === 'portrait-left'
            ? 'relative md:col-span-6'
            : 'relative md:col-span-5 md:col-start-8 md:mt-24'
      }
    >
      <figure className="relative">
        <div
          ref={clipRef}
          data-cursor="LOOK"
          className={`group relative w-full overflow-hidden bg-[#121212] ${
            isWide
              ? 'h-[66vh] min-h-[400px] max-h-[780px]'
              : 'aspect-[3/4] max-h-[78vh]'
          }`}
        >
          <div ref={mediaRef} className="relative h-full w-full will-change-transform">
            <Image
              src={assetPath(frame.image)}
              alt={frame.alt}
              fill
              loading="eager"
              sizes={isWide ? '100vw' : '(max-width: 768px) 92vw, 46vw'}
              className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          </div>

          {/* Legibility gradient scrims over dark image regions */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/35 to-transparent"
          />
          {isWide && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-[#0A0A0A]/75 via-[#0A0A0A]/30 to-transparent"
            />
          )}

          {/* Overlapping Oversized Typography */}
          <div
            ref={typeRef}
            className={`pointer-events-none absolute will-change-transform ${
              isWide
                ? 'left-[var(--gutter)] top-[24%] max-w-4xl sm:top-[22%]'
                : 'bottom-12 left-5 right-5 sm:bottom-14 sm:left-7'
            }`}
          >
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8FF3D]">
              {frame.index} · {frame.tag}
            </p>
            <h3
              className={`font-display font-bold uppercase leading-[0.86] tracking-[-0.025em] [word-spacing:0.14em] ${
                isWide
                  ? 'text-[clamp(2.5rem,7.8vw,8.2rem)]'
                  : 'text-[clamp(2rem,4.5vw,4.6rem)]'
              }`}
            >
              <span className="block text-[#F2F0EB]/95">{frame.overlayLines[0]}</span>
              <span
                className="block text-transparent"
                style={{ WebkitTextStroke: '1.15px rgba(242, 240, 235, 0.7)' }}
              >
                {frame.overlayLines[1]}
              </span>
            </h3>
          </div>
        </div>

        {/* Bottom Architectural Specimen Caption */}
        <figcaption
          className={`mt-3.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86] ${
            isWide ? 'px-[var(--gutter)]' : ''
          }`}
        >
          <span className="text-[#F2F0EB]/80">{frame.garments}</span>
          <span>{frame.location}</span>
        </figcaption>
      </figure>
    </article>
  );
}

/**
 * Section 6: LOOKBOOK
 * Full-bleed campaign imagery with parallax, clip-path reveals,
 * and overlapping oversized typography across wide & asymmetric plates.
 */
export function LookbookSection() {
  const { lookbook } = siteConfig;
  const wideFrame = lookbook.frames[0];
  const diptychFrames = lookbook.frames.slice(1);

  return (
    <section
      id="lookbook"
      aria-label="AW 26 Editorial Lookbook"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        paddingTop: 'clamp(4.5rem, 9vh, 7rem)',
        paddingBottom: 'clamp(5.5rem, 12vh, 9rem)',
      }}
    >
      {/* Top Section Index */}
      <div className="px-[var(--gutter)]">
        <div className="mb-10 flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-4 sm:mb-12">
          <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
            {lookbook.indexLabel}
          </span>
          <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] sm:inline">
            {lookbook.campaignTag}
          </span>
        </div>
      </div>

      {/* Full-Bleed Opening Plate */}
      <LookbookPlate frame={wideFrame} />

      {/* Asymmetric Portrait Diptych */}
      <div className="mt-14 grid grid-cols-1 items-start gap-12 px-[var(--gutter)] md:mt-20 md:grid-cols-12 md:gap-8">
        {diptychFrames.map((frame) => (
          <LookbookPlate key={frame.id} frame={frame} />
        ))}
      </div>
    </section>
  );
}
