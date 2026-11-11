'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { brand, hero } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Section 1 (Landing): HERO
 * Quiet-luxury sentence-case serif wordmark ("Luxe" / italic "Wear") masked
 * behind The Overshirt over soft studio light, settling into scrubbed scroll drift.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // The ONE orchestrated moment: wordmark rises out of its mask, garment surfaces.
        gsap.from('.hero__word', {
          yPercent: 105,
          duration: 1.7,
          ease: 'expo.out',
          stagger: 0.14,
          delay: 0.15,
        });
        gsap.from('.hero__media', {
          opacity: 0.02,
          scale: 1.04,
          duration: 1.8,
          ease: 'expo.out',
          delay: 0.1,
        });
        gsap.from('.hero__foot > *', {
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.08,
          delay: 0.45,
        });

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
