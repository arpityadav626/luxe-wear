'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { useAppState, useSmoothScrollContext } from '@/components/SmoothScrollProvider';

const HeroGarmentCanvas = dynamic(
  () => import('@/components/HeroGarmentCanvas').then((mod) => mod.HeroGarmentCanvas),
  { ssr: false }
);

/**
 * Section 2: HERO
 * Pure atmospheric opening stage: giant spaced LUXE / WEAR display typography
 * behind an interactive 3D obsidian tee (.glb) with pointer 360° orbit and
 * scroll-linked depth transitions.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topWordRef = useRef<HTMLSpanElement>(null);
  const bottomWordRef = useRef<HTMLSpanElement>(null);
  const introLine1Ref = useRef<HTMLSpanElement>(null);
  const introLine2Ref = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  const { isPreloaded } = useAppState();
  const { reducedMotion } = useSmoothScrollContext();

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
    if (!section || prefersReducedMotion()) {
      scrollProgressRef.current = 0;
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
        },
      });

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

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label={`${brandConfig.brand.name} Hero`}
      className="relative flex h-[100dvh] min-h-[680px] w-full flex-col justify-between overflow-hidden bg-[#0A0A0A]"
    >
        {/* Soft architectural horizon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[50%] h-[1px] bg-[#F2F0EB]/[0.06]"
          style={{ zIndex: 'var(--z-bg)' }}
        />

        {/* Giant Display Typography layered behind the 3D garment */}
        <h1
          aria-label={brandConfig.brand.name}
          className="pointer-events-none absolute inset-x-0 top-0 bottom-[21vh] flex select-none flex-col justify-between px-[var(--gutter)] pt-[12.5vh] font-display text-[clamp(3.6rem,14.2vw,15rem)] font-bold uppercase leading-[0.86] tracking-[-0.015em] sm:bottom-[15vh] sm:pt-[11.5vh]"
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
                WebkitTextStroke: '1.2px rgba(242, 240, 235, 0.38)',
              }}
            >
              {brandConfig.brand.shortLines[1]}
            </span>
          </span>
        </h1>

        {/* Interactive 3D Obsidian Garment Stage + Radial Halo Glow */}
        <div
          className="pointer-events-auto relative mx-auto mb-auto mt-[10vh] flex h-[54vh] min-h-[370px] max-h-[540px] w-[90vw] max-w-[480px] items-center justify-center sm:my-auto sm:h-[80vh] sm:max-h-[820px] sm:w-[76vw] sm:max-w-[780px]"
          style={{ zIndex: 'var(--z-garment)' }}
        >
          {/* Radial studio glow lifting obsidian cloth off the black backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.11), transparent 62%)',
            }}
          />

          <div className="relative h-full w-full">
            <HeroGarmentCanvas
              scrollProgressRef={scrollProgressRef}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* Minimal Editorial Caption & Interaction Hint */}
        <div
          ref={captionRef}
          data-hero-intro
          className="pointer-events-none relative mt-auto flex w-full items-end justify-between gap-6"
          style={{
            zIndex: 'var(--z-hero-ui)',
            padding: '0 var(--gutter) clamp(1.5rem, 3.5vh, 2.5rem)',
          }}
        >
          <div className="max-w-lg">
            <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-[#F2F0EB] sm:text-2xl">
              {brandConfig.hero.title}
            </h2>
            <p className="mt-1.5 text-base text-[#F2F0EB]/82 sm:text-lg">
              {brandConfig.hero.subtitle}
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 text-xs uppercase tracking-[0.12em] text-[#9A9790] sm:flex">
            <span>{brandConfig.hero.hint}</span>
            <span className="h-[1px] w-12 bg-[#F2F0EB]/25" aria-hidden="true" />
          </div>
        </div>
    </section>
  );
}
