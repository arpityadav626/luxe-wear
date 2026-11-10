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
  const macroStageRef = useRef<HTMLDivElement>(null);
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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      if (copyCardRef.current) gsap.set(copyCardRef.current, { y: 0, opacity: 1 });
      if (macroStageRef.current) gsap.set(macroStageRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      return;
    }

    const tweens: gsap.core.Tween[] = [];
    if (copyCardRef.current) {
      tweens.push(
        gsap.fromTo(
          copyCardRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
        )
      );
    }

    if (macroStageRef.current) {
      const activeFrame = macroStageRef.current.querySelector<HTMLElement>('[data-macro-active="true"]');
      if (activeFrame) {
        tweens.push(
          gsap.fromTo(
            activeFrame,
            { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 },
            { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.65, ease: 'power3.out' }
          )
        );
      }
    }

    return () => {
      tweens.forEach((t) => t.kill());
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
          <span className="text-xs uppercase tracking-[0.1em] text-[#9A9790]">
            Garment Details
          </span>
          <span className="text-xs uppercase tracking-[0.1em] tabular-nums text-[#F2F0EB]/90">
            0{activeStage + 1} / 0{stages.length}
          </span>
        </div>

        {/* Core Stage: Stage Rail (~160px) | Turntable 3D Canvas (flex-1) | Macro Image (42vw) + Copy */}
        <div className="relative z-20 my-auto flex flex-1 flex-col justify-center gap-6 py-4 md:flex-row md:items-center md:gap-8 lg:gap-10">
          {/* Single Responsive Stage Tablist + Thin Progress Line */}
          <div className="order-2 flex shrink-0 items-center gap-5 md:order-1 md:w-[150px] lg:w-[170px]">
            <div className="hidden h-52 w-[2px] bg-[#F2F0EB]/15 md:block" aria-hidden="true">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-top bg-[#F2F0EB]"
                style={{ transform: 'scaleY(0.08)' }}
              />
            </div>

            <div
              role="tablist"
              aria-label="Construction details"
              className="flex flex-wrap gap-2 md:flex-col md:items-start md:gap-4"
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
                    className={`group inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-[14px] font-medium uppercase tracking-[0.08em] transition-all duration-300 md:rounded-none md:border-0 md:bg-transparent md:p-0 ${
                      isActive
                        ? 'border-[#F2F0EB] bg-[#F2F0EB] text-[#0A0A0A] md:bg-transparent md:text-[#F2F0EB]'
                        : 'border-[#F2F0EB]/20 bg-transparent text-[#F2F0EB]/50 hover:text-[#F2F0EB]/85'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`hidden h-2 w-2 rounded-full transition-colors duration-300 md:inline-block ${
                        isStitchingAccent
                          ? 'bg-[#C8FF3D]'
                          : isActive
                            ? 'bg-[#F2F0EB]'
                            : 'bg-[#F2F0EB]/30 group-hover:bg-[#F2F0EB]/70'
                      }`}
                    />
                    <span>{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll-Scrubbed 0° -> 40° -> 90° -> 180° RGBA Sequence Canvas over Soft Radial Pedestal */}
          <div className="order-1 relative h-[36vh] min-h-[260px] w-full shrink-0 md:order-2 md:h-[72vh] md:min-w-0 md:flex-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.085), transparent 60%)',
              }}
            />
            <div
              data-cursor="DRAG"
              className="relative h-full w-full"
            >
              <SequenceCanvas
                progressRef={storyProgressRef}
                activeProgress={stages[activeStage].progressStop}
              />
            </div>
          </div>

          {/* Large Macro Detail Image (42vw on desktop) with clip-path wipe reveal + Editorial Copy */}
          <div className="order-3 flex w-full shrink-0 flex-col justify-center gap-5 md:w-[42vw] md:max-w-[640px]">
            <div
              ref={macroStageRef}
              data-cursor="ZOOM"
              className="relative aspect-[16/10] w-full max-h-[38vh] overflow-hidden border border-[#F2F0EB]/12 bg-[#121212] md:max-h-[42vh]"
            >
              {stages.map((stage, idx) => {
                const isActive = activeStage === idx;
                return (
                  <div
                    key={stage.id}
                    data-macro-active={isActive ? 'true' : 'false'}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                    }`}
                  >
                    <Image
                      src={assetPath(stage.macroImage)}
                      alt={stage.macroAlt}
                      fill
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 768px) 92vw, 43vw"
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            <div className="relative min-h-[156px] md:min-h-[175px]">
              <div
                ref={copyCardRef}
                key={currentStage.id}
                className="flex flex-col justify-start border-l border-[#F2F0EB]/18 pl-5 md:justify-center"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-[#9A9790]">
                  {currentStage.id === 'stitching' && (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-[#C8FF3D]"
                    />
                  )}
                  <span>{currentStage.label}</span>
                </div>

                <h2 className="mt-2 font-display text-[clamp(1.65rem,2.4vw,2.4rem)] font-semibold uppercase leading-[1.02] tracking-[-0.015em] text-[#F2F0EB]">
                  {currentStage.title}
                </h2>

                <p className="mt-2.5 max-w-lg text-base leading-relaxed text-[#F2F0EB]/86">
                  {currentStage.description}
                </p>

                <details className="group/details mt-3.5 max-w-lg">
                  <summary className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium uppercase tracking-[0.1em] text-[#9A9790] transition-colors hover:text-[#F2F0EB]">
                    <span>Details</span>
                    <span aria-hidden="true" className="text-sm leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 border-t border-[#F2F0EB]/10 pt-2 text-[15px] leading-relaxed text-[#9A9790]">
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
