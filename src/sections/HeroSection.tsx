'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';

/**
 * Section 2: HERO
 * Pure atmospheric opening stage: giant spaced LUXE / WEAR display typography
 * behind a softly vignette-melted garment cutout (`/sequence/frame_0001.webp`).
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topWordRef = useRef<HTMLSpanElement>(null);
  const bottomWordRef = useRef<HTMLSpanElement>(null);
  const garmentRef = useRef<HTMLDivElement>(null);
  const introLine1Ref = useRef<HTMLSpanElement>(null);
  const introLine2Ref = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  const { isPreloaded } = useAppState();

  useEffect(() => {
    if (!isPreloaded) return;

    if (prefersReducedMotion()) {
      gsap.set([introLine1Ref.current, introLine2Ref.current, captionRef.current], {
        yPercent: 0,
        opacity: 1,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE.expoOut } });

      tl.fromTo(
        [introLine1Ref.current, introLine2Ref.current],
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: DURATION.base,
          stagger: 0.08,
        }
      ).fromTo(
        captionRef.current,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: DURATION.fast,
          ease: EASE.power3Out,
        },
        0.1
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isPreloaded]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        garmentRef.current,
        { scale: 1, yPercent: 0 },
        {
          scale: 1.08,
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      gsap.to(topWordRef.current, {
        yPercent: -22,
        xPercent: -3,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(bottomWordRef.current, {
        yPercent: 18,
        xPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const heroImageUrl = assetPath(`${brandConfig.sequence.pathPrefix}0001${brandConfig.sequence.extension}`);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label={`${brandConfig.brand.name} Hero`}
      className="relative flex h-[100dvh] min-h-[640px] w-full flex-col justify-between overflow-hidden bg-[#0A0A0A]"
    >
        {/* Soft architectural horizon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[48%] h-[1px] bg-[#F2F0EB]/[0.06]"
          style={{ zIndex: 'var(--z-bg)' }}
        />

        {/* Giant Display Typography layered behind the garment */}
        <h1
          aria-label={brandConfig.brand.name}
          className="pointer-events-none absolute inset-x-0 top-0 bottom-[22vh] flex select-none flex-col justify-between px-[var(--gutter)] pt-[10vh] font-display text-[clamp(3.75rem,15vw,16rem)] font-bold uppercase leading-[0.86] tracking-[-0.015em] sm:bottom-[15vh] sm:pt-[9vh]"
          style={{ zIndex: 'var(--z-hero-type)' }}
        >
          <span ref={topWordRef} className="block self-start overflow-hidden">
            <span ref={introLine1Ref} data-hero-intro className="block text-[#F2F0EB]/[0.9]">
              {brandConfig.brand.shortLines[0]}{' '}
            </span>
          </span>

          <span ref={bottomWordRef} className="block self-end overflow-hidden text-right">
            <span
              ref={introLine2Ref}
              data-hero-intro
              className="block text-transparent"
              style={{
                WebkitTextStroke: '1.2px rgba(242, 240, 235, 0.36)',
              }}
            >
              {brandConfig.brand.shortLines[1]}
            </span>
          </span>
        </h1>

        {/* Feathered Studio Cutout with mix-blend-lighten so backdrop merges seamlessly into #0A0A0A */}
        <div
          className="pointer-events-none relative mx-auto my-auto flex h-[48vh] w-[78vw] max-w-[340px] items-center justify-center sm:h-[68vh] sm:w-[62vw] sm:max-w-[540px]"
          style={{ zIndex: 'var(--z-garment)' }}
        >
          <div
            ref={garmentRef}
            className="relative h-full w-full will-change-transform mix-blend-lighten [-webkit-mask-image:radial-gradient(ellipse_66%_74%_at_50%_50%,#000_56%,transparent_94%)] [mask-image:radial-gradient(ellipse_66%_74%_at_50%_50%,#000_56%,transparent_94%)]"
          >
            <Image
              src={heroImageUrl}
              alt={brandConfig.sequence.heroAlt}
              fill
              priority
              sizes="(max-width: 768px) 78vw, 540px"
              className="object-contain object-center select-none"
            />
          </div>
        </div>

        {/* Minimal Editorial Caption & Scroll Hairline */}
        <div
          ref={captionRef}
          data-hero-intro
          className="relative mt-auto flex w-full items-end justify-between gap-6"
          style={{
            zIndex: 'var(--z-hero-ui)',
            padding: '0 var(--gutter) clamp(1.5rem, 3.5vh, 2.5rem)',
          }}
        >
          <div className="max-w-lg">
            <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-[#F2F0EB] sm:text-2xl">
              {brandConfig.hero.title}
            </h2>
            <p className="mt-1.5 text-base text-[#F2F0EB]/80 sm:text-lg">
              {brandConfig.hero.subtitle}
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 text-[13px] uppercase tracking-[0.16em] text-[#9A9790] sm:flex">
            <span>Scroll</span>
            <span className="h-[1px] w-12 bg-[#F2F0EB]/25" aria-hidden="true" />
          </div>
        </div>
    </section>
  );
}
