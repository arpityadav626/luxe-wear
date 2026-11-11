'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { brand, hero } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Section 1 (Landing): HERO
 * Quiet-luxury sentence-case serif wordmark ("Luxe" / italic "Wear") masked
 * behind The Overshirt over soft studio light, settling into scrubbed scroll drift.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const { isPreloaded } = useAppState();
  const entranceDone = useRef(false);

  // Settle initial pre-reveal pose & register ScrollTrigger scrub
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!isPreloaded && !entranceDone.current) {
          gsap.set('.hero__word', { yPercent: 105 });
          gsap.set('.hero__media', { scale: 1.045 });
          gsap.set('.hero__foot > *', { opacity: 0 });
        }

        // Scroll: garment drifts closer, words part, footer line leaves gently.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
          .to('.hero__garment', { scale: 1.12, yPercent: -4 }, 0)
          .to('.hero__mask--l', { xPercent: -10 }, 0)
          .to('.hero__mask--r', { xPercent: 10 }, 0)
          .to('.hero__foot', { opacity: 0, duration: 0.42 }, 0);
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  // Coordinated wordmark + garment entrance right as Preloader curtain lifts (or immediately if skipped)
  useGSAP(
    () => {
      if (!isPreloaded || entranceDone.current) return;
      entranceDone.current = true;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.hero__word',
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.55,
            ease: 'expo.out',
            stagger: 0.12,
          }
        );
        gsap.fromTo(
          '.hero__media',
          { scale: 1.045 },
          {
            scale: 1,
            duration: 1.65,
            ease: 'expo.out',
          }
        );
        gsap.fromTo(
          '.hero__foot > *',
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            stagger: 0.08,
            delay: 0.25,
          }
        );
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [isPreloaded] }
  );

  return (
    <section ref={root} id="hero" className="hero" aria-label={`${brand.name} — ${brand.piece.name}`}>
      <h1 className="sr-only">{brand.name}</h1>

      <div className="hero__words display" aria-hidden="true">
        <span className="hero__mask hero__mask--l">
          <span className="hero__word">Luxe</span>
        </span>
        <span className="hero__mask hero__mask--r">
          <span className="hero__word hero__word--italic">Wear</span>
        </span>
      </div>

      <div className={`hero__garment${hero.hasAlpha ? '' : ' hero__garment--blend'}`}>
        <div className="hero__media">
          <Image
            src={assetPath(hero.image)}
            alt={hero.alt}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 900px) 86vw, 60vw"
          />
        </div>
      </div>

      <div className="hero__foot">
        <p className="hero__piece">{brand.piece.name}</p>
        <p className="hero__season">{brand.piece.season}</p>
        <p className="hero__hint">Scroll</p>
      </div>
    </section>
  );
}
