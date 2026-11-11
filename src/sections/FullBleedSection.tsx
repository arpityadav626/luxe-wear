'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

/**
 * Section 4: FULL-BLEED EDITORIAL MOMENT
 * One 100svh campaign photograph breaking rhythm between the Bone cloth
 * section and the obsidian Capsule carousel, carrying a single Instrument Serif line.
 */
export function FullBleedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { scale: 1.12, yPercent: -3 },
          {
            scale: 1.06,
            yPercent: 3,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      }

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { yPercent: 60, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: DURATION.slow,
            ease: EASE.expoOut,
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
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

  const { fullBleed } = brandConfig;

  return (
    <section
      id="full-bleed"
      ref={sectionRef}
      aria-label="Campaign editorial moment"
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-[#0B0B0A] text-[#EDE8DF]"
    >
      <div ref={mediaRef} className="relative h-full w-full will-change-transform">
        <Image
          src={assetPath(fullBleed.image)}
          alt={fullBleed.alt}
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Subtle directional gradient scrim over concrete shadows so sentence-case serif reads cleanly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0B0B0A]/80 via-[#0B0B0A]/25 to-transparent"
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ padding: 'clamp(2.5rem, 7vh, 5rem) var(--gutter)' }}
      >
        <p
          ref={lineRef}
          className="display max-w-[16ch] text-[clamp(2.2rem,5.4vw,5.4rem)] leading-[0.98] tracking-[-0.02em] text-[#EDE8DF]"
        >
          {fullBleed.line}
        </p>
      </div>
    </section>
  );
}
