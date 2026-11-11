'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig, type LookbookFrame } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Editorial lookbook plate (Round 4 unified treatment):
 * All three looks render full-bleed `100vw × 100svh`, one look per viewport,
 * responsive object-position keeping figures uncropped on mobile + desktop,
 * sentence-case Instrument Serif title, and bottom-left 15px caption.
 */
function LookbookPlate({
  frame,
  sectionLabel,
}: {
  frame: LookbookFrame;
  sectionLabel: string;
}) {
  const plateRef = useRef<HTMLElement>(null);
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
          { clipPath: 'inset(6% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DURATION.slow,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: plate,
              start: 'top 84%',
              once: true,
            },
          }
        );
      }

      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { yPercent: -2.5, scale: 1.06 },
          {
            yPercent: 2.5,
            scale: 1.01,
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
          { yPercent: 6 },
          {
            yPercent: -4,
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

  const mobileFocus =
    frame.id === 'look-01'
      ? 'object-cover object-[72%_48%] md:object-center'
      : frame.id === 'look-02'
        ? 'object-cover object-[76%_50%] md:object-center'
        : 'object-cover object-[76%_40%] md:object-center';

  return (
    <article
      ref={plateRef}
      aria-label={`${frame.tag}: ${frame.overlayLines.join(' ')}`}
      className="relative flex h-[100svh] min-h-[640px] w-full flex-col justify-between overflow-hidden border-t border-[#EDE8DF]/10 bg-[#0B0B0A] first:border-t-0"
    >
      <div
        ref={clipRef}
        className="absolute inset-0 overflow-hidden bg-[#121210]"
      >
        <div ref={mediaRef} className="relative h-full w-full will-change-transform">
          <Image
            src={assetPath(frame.image)}
            alt={frame.alt}
            fill
            loading="lazy"
            sizes="100vw"
            className={mobileFocus}
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0B0B0A]/88 via-[#0B0B0A]/32 to-transparent"
        />
      </div>

      <div
        className="relative z-10 mx-[var(--gutter)] mt-12 flex items-center justify-between border-b border-[#EDE8DF]/14 pb-3.5 md:mt-[clamp(4.75rem,8vh,5.75rem)] md:pb-4"
      >
        <span className="text-[14px] tracking-[0.04em] text-[#EDE8DF]/84">{sectionLabel}</span>
        <span className="text-[14px] tracking-[0.04em] text-[#EDE8DF]/76">{frame.tag}</span>
      </div>

      <div
        className="relative z-10 flex flex-col items-start gap-6"
        style={{
          padding: '0 var(--gutter) clamp(2.5rem, 6vh, 4.5rem)',
        }}
      >
        <div ref={typeRef} className="pointer-events-none">
          <h3 className="display text-[clamp(3rem,6.8vw,6.8rem)] leading-[0.9] tracking-[-0.025em]">
            <span className="block text-[#EDE8DF]">{frame.overlayLines[0]}</span>
            <span className="block text-[#B3ADA2]">{frame.overlayLines[1]}</span>
          </h3>
        </div>

        <figcaption className="border-t border-[#EDE8DF]/18 pt-3.5 text-[15px] text-[#EDE8DF]/92">
          <span className="mr-3 text-[#B3ADA2]">{frame.tag}</span>
          <span>{frame.caption}</span>
        </figcaption>
      </div>
    </article>
  );
}

/**
 * Section 6: LOOKBOOK
 * Full-bleed `100vw × 100svh` editorial showcase across all three looks, strictly one look
 * per viewport with bottom-left 15px caption anchored in ink.
 */
export function LookbookSection() {
  const { lookbook } = brandConfig;

  return (
    <section
      id="lookbook"
      aria-label="Lookbook"
      className="relative w-full border-t border-[#EDE8DF]/12 bg-[#0B0B0A] text-[#EDE8DF]"
    >
      <div className="flex flex-col">
        {lookbook.frames.map((frame) => (
          <LookbookPlate
            key={frame.id}
            frame={frame}
            sectionLabel={lookbook.label}
          />
        ))}
      </div>
    </section>
  );
}
