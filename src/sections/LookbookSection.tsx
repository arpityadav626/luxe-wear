'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig, type LookbookFrame } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Individual editorial campaign plate:
 * One look per viewport, uniform 4:5 portrait plate with scrubbed parallax,
 * solid off-white + grey overlapping display typography (zero outline text over photos),
 * and clean bottom-left caption.
 */
function LookbookPlate({ frame }: { frame: LookbookFrame }) {
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
          { clipPath: 'inset(14% 0% 0% 0%)' },
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
          { yPercent: -6, scale: 1.14 },
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
          { yPercent: 12 },
          {
            yPercent: -10,
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

  return (
    <article
      ref={plateRef}
      aria-label={`${frame.tag}: ${frame.overlayLines.join(' ')}`}
      className="relative flex min-h-[78vh] w-full flex-col justify-center py-[3vh] md:min-h-[84vh] md:py-[4vh]"
    >
      <figure className="relative flex w-full flex-col">
        {/* Consistent 4:5 Editorial Plate shifted slightly right so overlapping heading + bottom-left caption breathe cleanly */}
        <div className="relative md:ml-auto md:w-[44vw] md:max-w-[560px]">
          <div
            ref={clipRef}
            data-cursor="LOOK"
            className="group relative aspect-[4/5] w-full max-h-[76vh] overflow-hidden bg-[#121212]"
          >
            <div ref={mediaRef} className="relative h-full w-full will-change-transform">
              <Image
                src={assetPath(frame.image)}
                alt={frame.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 92vw, 560px"
                className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/35 to-transparent"
            />
          </div>

          {/* Solid Two-Tone Overlapping Heading anchored lower-left across the 4:5 plate edge */}
          <div
            ref={typeRef}
            className="pointer-events-none relative -mt-20 z-10 px-2 md:absolute md:-left-[22vw] md:bottom-14 md:mt-0 md:px-0"
          >
            <h3 className="font-display text-[clamp(2.4rem,6vw,5.8rem)] font-bold uppercase leading-[0.88] tracking-[-0.015em] [word-spacing:0.22em]">
              <span className="block text-[#F2F0EB]">
                {frame.overlayLines[0]}{' '}
              </span>
              <span className="block text-[#9A9790]">
                {frame.overlayLines[1]}
              </span>
            </h3>
          </div>
        </div>

        {/* Clean Bottom-Left Caption */}
        <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-[#F2F0EB]/12 pt-4 md:mt-8">
          <span className="text-xs uppercase tracking-[0.1em] text-[#9A9790]">
            {frame.tag}
          </span>
          <span className="text-[15px] text-[#F2F0EB]/85 sm:text-base">
            {frame.caption}
          </span>
        </figcaption>
      </figure>
    </article>
  );
}

/**
 * Section 6: LOOKBOOK
 * One look per viewport in a consistent 4:5 aspect ratio with solid off-white + grey
 * overlapping typography and bottom-left captions.
 */
export function LookbookSection() {
  const { lookbook } = brandConfig;

  return (
    <section
      id="lookbook"
      aria-label="Lookbook"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(5.5rem, 15vh, 10rem) var(--gutter)',
      }}
    >
      <div className="mb-8 border-b border-[#F2F0EB]/12 pb-4 sm:mb-10">
        <span className="text-xs uppercase tracking-[0.1em] text-[#9A9790]">
          {lookbook.label}
        </span>
      </div>

      <div className="flex flex-col gap-10 md:gap-14">
        {lookbook.frames.map((frame) => (
          <LookbookPlate key={frame.id} frame={frame} />
        ))}
      </div>
    </section>
  );
}
