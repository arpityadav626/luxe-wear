'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLenis } from '@/hooks/useLenis';
import { SequenceCanvas } from '@/components/SequenceCanvas';

/**
 * Section 3: PINNED STORY (Core Section)
 * Desktop: ScrollTrigger pins the stage, subtly shifts surface tone between stages,
 * scrubs a 60-frame turntable image sequence on <canvas>, crossfades separate macro
 * detail photographs (Collar, Closure, Stitching, Weave), and transitions ONE unified
 * editorial copy block + collapsible Details drawer.
 * Mobile / Reduced Motion: Unpinned interactive stage selector.
 */
export function PinnedStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const copyCardRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const storyProgressRef = useRef<number>(0);
  const [activeStage, setActiveStage] = useState<number>(0);
  const { scrollTo } = useLenis();

  const stages = brandConfig.storyStages;
  const currentStage = stages[activeStage] ?? stages[0];

  useEffect(() => {
    const stage = stageRef.current;
    const bgLayer = bgLayerRef.current;
    if (!stage || !bgLayer) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set(bgLayer, { backgroundColor: stages[0].bgColor });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=240%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            storyProgressRef.current = p;

            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleY(${Math.max(0.08, p)})`;
            }

            const idx = p < 0.22 ? 0 : p < 0.49 ? 1 : p < 0.76 ? 2 : 3;
            setActiveStage((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      stRef.current = tl.scrollTrigger ?? null;

      tl.to(bgLayer, { backgroundColor: stages[1].bgColor, duration: 0.16, ease: 'none' }, 0.16)
        .to(bgLayer, { backgroundColor: stages[2].bgColor, duration: 0.16, ease: 'none' }, 0.44)
        .to(bgLayer, { backgroundColor: stages[3].bgColor, duration: 0.16, ease: 'none' }, 0.72)
        .to({}, { duration: 0.12 }, 0.88);

      return () => {
        stRef.current = null;
      };
    });

    return () => {
      mm.revert();
    };
  }, [stages]);

  useEffect(() => {
    if (!copyCardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(copyCardRef.current, { y: 0, opacity: 1 });
      return;
    }
    const tween = gsap.fromTo(
      copyCardRef.current,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
    );
    return () => {
      tween.kill();
    };
  }, [activeStage]);

  const handleSelectStage = (idx: number) => {
    const targetStop = stages[idx]?.progressStop ?? 0;
    const st = stRef.current;

    if (st) {
      const y = st.start + (st.end - st.start) * targetStop;
      scrollTo(y);
      return;
    }

    storyProgressRef.current = targetStop;
    setActiveStage(idx);
    if (bgLayerRef.current) {
      bgLayerRef.current.style.backgroundColor = stages[idx].bgColor;
    }
  };

  return (
    <section
      id="pinned-story"
      ref={sectionRef}
      aria-label="Garment Construction Study"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
    >
      <div
        ref={stageRef}
        className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden md:h-[100dvh]"
        style={{ padding: 'clamp(5.4rem, 10vh, 6.4rem) var(--gutter) clamp(1.75rem, 4vh, 2.75rem)' }}
      >
        {/* Subtle Stage-Reactive Surface Layer */}
        <div
          ref={bgLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-colors duration-700"
          style={{ backgroundColor: stages[0].bgColor }}
        />

        {/* Minimal Top Bar */}
        <div className="relative z-20 flex items-center justify-between border-b border-[#F2F0EB]/12 pb-3.5">
          <span className="text-[13px] uppercase tracking-[0.16em] text-[#9A9790]">
            Garment Details
          </span>
          <span className="text-[13px] uppercase tracking-[0.16em] tabular-nums text-[#F2F0EB]/85">
            0{activeStage + 1} / 0{stages.length}
          </span>
        </div>

        {/* Core Stage */}
        <div className="relative z-20 my-auto grid flex-1 grid-cols-1 items-center gap-6 py-4 md:grid-cols-12 md:gap-8">
          {/* Single Responsive Stage Tablist */}
          <div className="order-2 flex items-center gap-5 md:order-1 md:col-span-2">
            <div className="hidden h-44 w-[1px] bg-[#F2F0EB]/14 md:block" aria-hidden="true">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-top bg-[#F2F0EB]"
                style={{ transform: 'scaleY(0.08)' }}
              />
            </div>

            <div
              role="tablist"
              aria-label="Construction details"
              className="flex flex-wrap gap-1.5 md:flex-col md:items-start md:gap-3.5"
            >
              {stages.map((stage, idx) => {
                const isActive = activeStage === idx;
                const isStitchingAccent = stage.id === 'stitching' && isActive;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectStage(idx)}
                    data-cursor="VIEW"
                    className={`group inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[13px] uppercase tracking-[0.1em] transition-colors duration-300 md:rounded-none md:border-0 md:bg-transparent md:p-0 ${
                      isActive
                        ? 'border-[#F2F0EB] bg-[#F2F0EB] text-[#0A0A0A] md:bg-transparent md:text-[#F2F0EB]'
                        : 'border-[#F2F0EB]/18 bg-transparent text-[#9A9790] hover:text-[#F2F0EB]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`hidden h-1.5 w-1.5 rounded-full transition-colors duration-300 md:inline-block ${
                        isStitchingAccent
                          ? 'bg-[#C8FF3D]'
                          : isActive
                            ? 'bg-[#F2F0EB]'
                            : 'bg-[#F2F0EB]/20 group-hover:bg-[#F2F0EB]/50'
                      }`}
                    />
                    <span>{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll-Scrubbed Sequence Canvas blended seamlessly via mix-blend-lighten + radial vignette */}
          <div className="order-1 relative h-[34vh] w-full sm:h-[42vh] md:order-2 md:col-span-5 md:h-[68vh]">
            <div className="relative h-full w-full mix-blend-lighten [-webkit-mask-image:radial-gradient(ellipse_68%_78%_at_50%_50%,#000_56%,transparent_94%)] [mask-image:radial-gradient(ellipse_68%_78%_at_50%_50%,#000_56%,transparent_94%)]">
              <SequenceCanvas
                progressRef={storyProgressRef}
                activeProgress={stages[activeStage].progressStop}
              />
            </div>
          </div>

          {/* Dedicated 4:3 Macro Detail Image + Single Editorial Copy Block */}
          <div className="order-3 flex flex-col justify-center gap-5 md:col-span-5">
            <div className="relative aspect-[4/3] w-full max-w-[380px] overflow-hidden border border-[#F2F0EB]/12 bg-[#121212]">
              {stages.map((stage, idx) => {
                const isActive = activeStage === idx;
                return (
                  <div
                    key={stage.id}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.03] opacity-0'
                    }`}
                  >
                    <Image
                      src={assetPath(stage.macroImage)}
                      alt={stage.macroAlt}
                      fill
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 768px) 92vw, 380px"
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            <div className="relative min-h-[168px] md:min-h-[195px]">
              <div
                ref={copyCardRef}
                key={currentStage.id}
                className="flex flex-col justify-start border-l border-[#F2F0EB]/18 pl-5 md:justify-center"
              >
                <div className="flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-[#9A9790]">
                  {currentStage.id === 'stitching' && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-[#C8FF3D]"
                    />
                  )}
                  <span>{currentStage.label}</span>
                </div>

                <h2 className="mt-2 font-display text-[clamp(1.6rem,2.4vw,2.35rem)] font-semibold uppercase leading-[1.02] tracking-[-0.015em] text-[#F2F0EB]">
                  {currentStage.title}
                </h2>

                <p className="mt-2.5 max-w-md text-base leading-relaxed text-[#F2F0EB]/85">
                  {currentStage.description}
                </p>

                <details className="group/details mt-3.5 max-w-md">
                  <summary className="inline-flex cursor-pointer items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-[#9A9790] transition-colors hover:text-[#F2F0EB]">
                    <span>Details</span>
                    <span aria-hidden="true" className="text-sm leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 border-t border-[#F2F0EB]/10 pt-2 text-sm leading-relaxed text-[#9A9790]">
                    {currentStage.detailNote}
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
