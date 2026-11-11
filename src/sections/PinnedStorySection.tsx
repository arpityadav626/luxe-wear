'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useFrameSequence } from '@/hooks/useFrameSequence';
import { sequence, stages } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STAGE_POSITIONS = [
  'stage--left-top',
  'stage--right-bottom',
  'stage--left-bottom',
  'stage--right-top',
] as const;

/**
 * Section 2: GARMENT FILM / PINNED STORY
 * 380vh ScrollTrigger pin scrubbing the centered rim-lit 2D turntable canvas
 * over warm studio spotlight, flanked by alternating left/right 24vw macro
 * stages with 10% in / 75% hold / 10% out timing.
 */
export function PinnedStorySection() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { render } = useFrameSequence(canvasRef);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const S = stages.length;
        const state = { frame: 0 };
        const els = gsap.utils.toArray<HTMLElement>('.stage');

        // ONE master timeline, duration 1 = the whole pinned scroll (380vh).
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=380%',
            pin: pin.current,
            scrub: 0.75,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1) Turntable: scroll progress -> frame number
        tl.to(
          state,
          { frame: sequence.count - 1, duration: 1, onUpdate: () => render(state.frame) },
          0
        );

        // 2) Subtle restrained push-in on centered garment (keeps 180° back compact)
        tl.fromTo(canvasRef.current, { scale: 1 }, { scale: 1.035, duration: 1 }, 0);

        // 3) Each stage owns a 0.25 slice: ~10% fade-in -> 75% full hold -> ~10% fade-out
        els.forEach((el, i) => {
          const a = i / S;
          const b = (i + 1) / S;
          const len = b - a;
          const fadeIn = len * 0.1;
          const fadeOut = len * 0.1;
          const media = el.querySelector('.stage__media');
          const img = el.querySelector('.stage__media img');
          const text = el.querySelector('.stage__text');

          if (i === 0) {
            gsap.set(el, { autoAlpha: 1 });
            gsap.set(media, { clipPath: 'inset(0% 0 0% 0)' });
            gsap.set(img, { scale: 1 });
            gsap.set(text, { y: 0, opacity: 1 });
            tl.to(el, { autoAlpha: 0, duration: fadeOut, ease: 'power2.in' }, b - fadeOut - 0.012);
          } else {
            tl.fromTo(
              el,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: fadeIn * 0.65, ease: 'power2.out' },
              a + 0.01
            );
            tl.fromTo(
              media,
              { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: fadeIn, ease: 'power3.out' },
              a + 0.01
            );
            tl.fromTo(
              img,
              { scale: 1.12 },
              { scale: 1, duration: fadeIn * 1.4, ease: 'power3.out' },
              a + 0.01
            );
            tl.fromTo(
              text,
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: fadeIn * 0.9, ease: 'power3.out' },
              a + 0.014
            );

            if (i < S - 1) {
              tl.to(el, { autoAlpha: 0, duration: fadeOut, ease: 'power2.in' }, b - fadeOut - 0.012);
            }
          }
        });

        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="film"
      id="pinned-story"
      aria-label="The Overshirt construction details"
    >
      <div ref={pin} className="film__pin">
        <canvas
          ref={canvasRef}
          className="film__canvas"
          aria-label="The Overshirt, rotating as you scroll"
          role="img"
        />

        <div className="stages">
          {stages.map((s, i) => (
            <article className={`stage ${STAGE_POSITIONS[i] ?? STAGE_POSITIONS[0]}`} key={s.id}>
              <div className="stage__media">
                <Image
                  src={assetPath(s.macroImage)}
                  alt={s.macroAlt}
                  fill
                  loading={i === 0 ? 'eager' : 'lazy'}
                  sizes="(max-width: 900px) 84vw, 25vw"
                />
              </div>
              <div className="stage__text">
                <p className="stage__meta">
                  <span>{s.label}</span>
                  <span>
                    {i + 1} / {stages.length}
                  </span>
                </p>
                <h2 className="stage__title display">{s.title}</h2>
                <p className="stage__line">{s.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
