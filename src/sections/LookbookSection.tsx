'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig, type LookbookFrame } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Editorial lookbook plate:
 * Strictly one look per full viewport (`min-h-[100svh] overflow-hidden`) with zero overlap
 * between frames. Look 01 renders full-bleed 100vw; Look 02 & Look 03 render >= 52vw wide
 * with bottom-left 15px caption and high-contrast sentence-case Instrument Serif title.
 */
function LookbookPlate({
  frame,
  isFirst,
  sectionLabel,
}: {
  frame: LookbookFrame;
  isFirst: boolean;
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
          { clipPath: isFirst ? 'inset(6% 0% 0% 0%)' : 'inset(10% 0% 0% 0%)' },
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
          { yPercent: isFirst ? -3 : -1.5, scale: isFirst ? 1.09 : 1.04 },
          {
            yPercent: isFirst ? 3 : 1.5,
            scale: isFirst ? 1.03 : 1.01,
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
          { yPercent: 8 },
          {
            yPercent: -5,
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
  }, [isFirst]);

  if (isFirst) {
    return (
      <article
        ref={plateRef}
        aria-label={`${frame.tag}: ${frame.overlayLines.join(' ')}`}
        className="relative flex h-[100svh] min-h-[640px] w-full flex-col justify-between overflow-hidden bg-[#0B0B0A]"
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
              className="object-cover object-[72%_50%] md:object-center"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0B0B0A]/88 via-[#0B0B0A]/30 to-transparent"
          />
        </div>

        <div
          className="relative z-10 flex items-center justify-between border-b border-[#EDE8DF]/14 pb-4"
          style={{
            margin: 'clamp(4.5rem, 8vh, 5.75rem) var(--gutter) 0',
          }}
        >
          <span className="text-[14px] tracking-[0.04em] text-[#EDE8DF]/82">{sectionLabel}</span>
          <span className="text-[14px] tracking-[0.04em] text-[#EDE8DF]/72">{frame.tag}</span>
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

          <p className="border-t border-[#EDE8DF]/18 pt-3.5 text-[15px] text-[#EDE8DF]/90">
            <span className="mr-3 text-[#B3ADA2]">{frame.tag}</span>
            <span>{frame.caption}</span>
          </p>
        </div>
      </article>
    );
  }

  const boxClass =
    frame.id === 'look-02'
      ? 'relative aspect-[4/5] max-h-[68svh] w-full overflow-hidden bg-[#121210] md:aspect-auto md:max-h-none md:h-[92svh] md:w-full'
      : 'relative aspect-[4/5] max-h-[68svh] w-full overflow-hidden bg-[#121210] md:aspect-auto md:max-h-none md:h-[86svh] md:w-full';

  const imgPosClass =
    frame.id === 'look-02'
      ? 'object-cover object-[50%_50%]'
      : 'object-cover object-[50%_20%]';

  return (
    <article
      ref={plateRef}
      aria-label={`${frame.tag}: ${frame.overlayLines.join(' ')}`}
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden border-t border-[#EDE8DF]/10 bg-[#0B0B0A] md:h-[100svh]"
      style={{
        padding: 'clamp(2rem, 3.5vh, 3rem) var(--gutter)',
      }}
    >
      <figure className="relative mx-auto flex h-full w-full flex-col justify-center md:flex-row md:items-end md:justify-between">
        <div className="relative order-2 mt-6 flex flex-col items-start md:order-1 md:mt-0 md:w-[36vw] md:pb-2">
          <div ref={typeRef} className="pointer-events-none relative z-10 md:w-[44vw]">
            <h3 className="display text-[clamp(2.8rem,6vw,6rem)] leading-[0.9] tracking-[-0.025em]">
              <span className="block text-[#EDE8DF]">{frame.overlayLines[0]}</span>
              <span className="block text-[#A9A398]">{frame.overlayLines[1]}</span>
            </h3>
          </div>

          <figcaption className="mt-5 border-t border-[#EDE8DF]/14 pt-3.5 text-[15px] text-[#EDE8DF]/90 md:mt-7">
            <span className="mr-3 text-[#8A857B]">{frame.tag}</span>
            <span>{frame.caption}</span>
          </figcaption>
        </div>

        <div className="relative order-1 w-full md:order-2 md:w-[51vw] lg:w-[52vw]">
          <div ref={clipRef} className={boxClass}>
            <div ref={mediaRef} className="relative h-full w-full will-change-transform">
              <Image
                src={assetPath(frame.image)}
                alt={frame.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 92vw, 52vw"
                className={imgPosClass}
              />
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0B0B0A]/65 via-transparent to-transparent"
            />
          </div>
        </div>
      </figure>
    </article>
  );
}

/**
 * Section 6: LOOKBOOK
 * Full-viewport sequential lookbook showcase: strictly one look per viewport, zero overlap
 * between plates, full-bleed or >= 54vw frames, and bottom-left 15px caption anchored in ink.
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
        {lookbook.frames.map((frame, i) => (
          <LookbookPlate
            key={frame.id}
            frame={frame}
            isFirst={i === 0}
            sectionLabel={lookbook.label}
          />
        ))}
      </div>
    </section>
  );
}
