'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig, type GarmentSize } from '@/config/site';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';
import { GarmentViewer } from '@/components/GarmentViewer';
import { MagneticButton } from '@/components/MagneticButton';
import { useAppState, useSmoothScrollContext } from '@/components/SmoothScrollProvider';

/**
 * Section 2: HERO
 * Full-screen sticky stage where a single 3D hero garment sits centered over
 * giant 10vw+ brand typography. Scrolling scrubs garment rotation + scale
 * while the background display words parallax at differential speeds.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topWordRef = useRef<HTMLSpanElement>(null);
  const bottomWordRef = useRef<HTMLSpanElement>(null);
  const introLine1Ref = useRef<HTMLSpanElement>(null);
  const introLine2Ref = useRef<HTMLSpanElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);
  const degreeTextRef = useRef<HTMLSpanElement>(null);

  const [selectedSize, setSelectedSize] = useState<GarmentSize>('M');
  const { isPreloaded, addToCart } = useAppState();
  const { heroProgressRef } = useSmoothScrollContext();

  // Entrance choreography synchronized with the Preloader curtain lift
  useEffect(() => {
    if (!isPreloaded) return;

    if (prefersReducedMotion()) {
      gsap.set([introLine1Ref.current, introLine2Ref.current, hudRef.current], {
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
        hudRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: DURATION.fast,
          ease: EASE.power3Out,
        },
        0.12
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isPreloaded]);

  // Scroll-scrubbed differential parallax + 3D garment progress driver
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReducedMotion()) {
      heroProgressRef.current = 0;
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          heroProgressRef.current = self.progress;

          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleY(${Math.max(0.08, self.progress)})`;
          }
          if (percentTextRef.current) {
            percentTextRef.current.textContent = `${String(Math.round(self.progress * 100)).padStart(2, '0')}%`;
          }
          if (degreeTextRef.current) {
            degreeTextRef.current.textContent = `${String(Math.round(self.progress * 216)).padStart(3, '0')}°`;
          }
        },
      });

      // Differential speed parallax on the giant brand layers behind the 3D garment
      gsap.to(topWordRef.current, {
        yPercent: -22,
        xPercent: -3,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      gsap.to(bottomWordRef.current, {
        yPercent: 16,
        xPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [heroProgressRef]);

  const handleAddToBag = () => {
    addToCart({
      id: siteConfig.heroGarment.id,
      code: siteConfig.heroGarment.code,
      name: siteConfig.heroGarment.name,
      size: selectedSize,
      price: siteConfig.heroGarment.price,
      image: assetPath(siteConfig.heroGarment.fallbackImage),
    });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label={`${siteConfig.brand.name} Hero Showcase`}
      className="relative h-[165svh] w-full bg-[#0A0A0A] md:h-[215svh]"
    >
      {/* Sticky full-viewport cinematic stage */}
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col justify-between overflow-hidden">
        {/* Soft architectural radial studio glow + thin 1px reference horizon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 'var(--z-bg)',
            background:
              'radial-gradient(circle at 50% 45%, rgba(242, 240, 235, 0.07) 0%, rgba(200, 255, 61, 0.035) 32%, transparent 66%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[46%] h-[1px] bg-[#F2F0EB]/[0.07]"
          style={{ zIndex: 'var(--z-bg)' }}
        />

        {/* Giant 10vw+ Brand Display Typography positioned clearly above bottom HUD */}
        <h1
          className="pointer-events-none absolute inset-x-0 top-0 bottom-[31vh] flex select-none flex-col justify-between px-[var(--gutter)] pt-[11vh] font-display text-[clamp(4.4rem,16.5vw,17.5rem)] font-bold uppercase leading-[0.82] tracking-[-0.045em] sm:bottom-[15vh] sm:pt-[9vh]"
          style={{ zIndex: 'var(--z-hero-type)' }}
        >
          <span ref={topWordRef} className="block self-start overflow-hidden">
            <span ref={introLine1Ref} data-hero-intro className="block text-[#F2F0EB]/[0.92]">
              {siteConfig.brand.shortLines[0]}
            </span>
          </span>

          <span ref={bottomWordRef} className="block self-end overflow-hidden text-right">
            <span
              ref={introLine2Ref}
              data-hero-intro
              className="block text-transparent"
              style={{
                WebkitTextStroke: '1.2px rgba(242, 240, 235, 0.34)',
              }}
            >
              {siteConfig.brand.shortLines[1]}
            </span>
          </span>
        </h1>

        {/* Centered 3D Garment Viewport floating IN FRONT of giant type */}
        <div
          className="pointer-events-auto relative mx-auto my-auto h-[52vh] w-full max-w-[820px] sm:h-[68vh]"
          style={{ zIndex: 'var(--z-garment)' }}
        >
          <GarmentViewer heroProgressRef={heroProgressRef} />
        </div>

        {/* Minimal Bottom Hero HUD */}
        <div
          ref={hudRef}
          data-hero-intro
          className="pointer-events-auto relative mt-auto flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          style={{
            zIndex: 'var(--z-hero-ui)',
            padding: '0 var(--gutter) clamp(1.25rem, 3vh, 2.25rem)',
          }}
        >
          {/* Left: Product designation, size pill & magnetic CTA */}
          <div className="w-full max-w-lg space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
                {siteConfig.heroGarment.indexLabel}
              </span>
              <span className="h-[1px] w-8 bg-[#F2F0EB]/20" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86]">
                {siteConfig.heroGarment.code}
              </span>
            </div>

            <div>
              <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-[#F2F0EB] sm:text-2xl">
                {siteConfig.heroGarment.name}
              </h2>
              <p className="mt-1 text-base leading-snug text-[#F2F0EB]/75">
                {siteConfig.heroGarment.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Small glassmorphic size selector */}
              <div
                role="group"
                aria-label="Select garment size"
                className="inline-flex items-center gap-1 rounded-full border border-[#F2F0EB]/16 bg-[#0A0A0A]/65 p-1 backdrop-blur-md"
              >
                {siteConfig.heroGarment.sizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={active}
                      className={`relative rounded-full px-3 py-1 font-mono text-[11px] transition-colors duration-200 ${
                        active ? 'text-[#0A0A0A]' : 'text-[#F2F0EB]/75 hover:text-[#F2F0EB]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="hero-size-pill"
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 rounded-full bg-[#F2F0EB]"
                        />
                      )}
                      <span className="relative z-10">{size}</span>
                    </button>
                  );
                })}
              </div>

              <MagneticButton strength={0.28}>
                <button
                  type="button"
                  onClick={handleAddToBag}
                  data-cursor="BAG"
                  className="inline-flex items-center gap-3 rounded-full bg-[#C8FF3D] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#0A0A0A] transition-transform duration-200 active:scale-[0.97]"
                >
                  <span>Add to Bag</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">${siteConfig.heroGarment.price}</span>
                </button>
              </MagneticButton>
            </div>
          </div>

          {/* Right: Live 3D scrub telemetry & vertical scroll indicator */}
          <div className="hidden shrink-0 items-end gap-4 sm:flex">
            <div className="text-right font-mono text-[11px] uppercase tracking-[0.16em]">
              <div className="text-[#8D8B86]">
                ORBIT <span ref={degreeTextRef} className="ml-2 tabular-nums text-[#F2F0EB]">000°</span>
              </div>
              <div className="mt-1 text-[#8D8B86]">
                SCROLL <span ref={percentTextRef} className="ml-2 tabular-nums text-[#C8FF3D]">00%</span>
              </div>
            </div>

            <div className="relative h-14 w-[1px] overflow-hidden bg-[#F2F0EB]/16" aria-hidden="true">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-top bg-[#C8FF3D]"
                style={{ transform: 'scaleY(0.08)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
