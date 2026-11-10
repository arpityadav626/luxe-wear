'use client';

import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/config/site';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLenis } from '@/hooks/useLenis';
import { PinnedStoryViewer } from '@/components/PinnedStoryViewer';

/**
 * Section 3: PINNED STORY (Core Section)
 * Desktop: ScrollTrigger pins the garment stage and scrubs a 360° rotation,
 * macro camera zooms (collar, button, stitching, fabric weave), scrubbed
 * detail card transitions, and subtle background tone shifts across stages.
 * Mobile / Reduced Motion: Simplified non-pinned interactive chapter layout.
 */
export function PinnedStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const degreeRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const storyProgressRef = useRef<number>(0);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const stage = stageRef.current;
    const bgLayer = bgLayerRef.current;
    if (!stage || !bgLayer) return;

    const chapters = siteConfig.storyChapters;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = cardRefs.current;

      // Ensure card 0 starts crisp and cards 1..3 start tucked beneath
      cards.forEach((card, idx) => {
        if (!card) return;
        gsap.set(card, {
          opacity: idx === 0 ? 1 : 0,
          y: idx === 0 ? 0 : 28,
          pointerEvents: idx === 0 ? 'auto' : 'none',
        });
      });
      gsap.set(bgLayer, { backgroundColor: chapters[0].bgColor });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=320%',
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            storyProgressRef.current = p;

            if (degreeRef.current) {
              degreeRef.current.textContent = `${String(Math.round(p * 360)).padStart(3, '0')}°`;
            }
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleY(${Math.max(0.06, p)})`;
            }

            const idx = p < 0.21 ? 0 : p < 0.48 ? 1 : p < 0.75 ? 2 : 3;
            setActiveChapter((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      stRef.current = tl.scrollTrigger ?? null;

      // Normalized 0..1 ScrollTrigger choreography matching `sampleStoryPose` plateaus cleanly
      tl.to(bgLayer, { backgroundColor: chapters[1].bgColor, duration: 0.14, ease: 'none' }, 0.14)
        .to(cards[0], { opacity: 0, y: -24, duration: 0.07, ease: 'power2.inOut' }, 0.14)
        .fromTo(
          cards[1],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.09, ease: 'power3.out' },
          0.19
        )
        .to(bgLayer, { backgroundColor: chapters[2].bgColor, duration: 0.14, ease: 'none' }, 0.41)
        .to(cards[1], { opacity: 0, y: -24, duration: 0.07, ease: 'power2.inOut' }, 0.41)
        .fromTo(
          cards[2],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.09, ease: 'power3.out' },
          0.46
        )
        .to(bgLayer, { backgroundColor: chapters[3].bgColor, duration: 0.14, ease: 'none' }, 0.68)
        .to(cards[2], { opacity: 0, y: -24, duration: 0.07, ease: 'power2.inOut' }, 0.68)
        .fromTo(
          cards[3],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.09, ease: 'power3.out' },
          0.73
        )
        .to({}, { duration: 0.18 }, 0.82);

      return () => {
        stRef.current = null;
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  const handleSelectChapter = (idx: number) => {
    const chapters = siteConfig.storyChapters;
    const targetProgress = idx / (chapters.length - 1);

    const st = stRef.current;
    if (st) {
      // Desktop pinned mode: scroll smoothly to the exact chapter position on the ScrollTrigger track
      const chapterStop = [0.06, 0.34, 0.62, 0.9][idx] ?? targetProgress;
      const y = st.start + (st.end - st.start) * chapterStop;
      scrollTo(y);
      return;
    }

    // Mobile / reduced-motion interactive jump
    storyProgressRef.current = targetProgress;
    setActiveChapter(idx);
    if (degreeRef.current) {
      degreeRef.current.textContent = `${String(Math.round(targetProgress * 360)).padStart(3, '0')}°`;
    }
    if (bgLayerRef.current) {
      bgLayerRef.current.style.backgroundColor = chapters[idx].bgColor;
    }
  };

  const chapters = siteConfig.storyChapters;

  return (
    <section
      id="pinned-story"
      ref={sectionRef}
      aria-label="360 Degree Garment Anatomy Story"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
    >
      {/* Pinned Desktop Stage / Responsive Mobile Container */}
      <div
        ref={stageRef}
        className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden md:h-[100dvh]"
        style={{ padding: 'clamp(5.2rem, 10vh, 6.5rem) var(--gutter) clamp(1.75rem, 4vh, 2.75rem)' }}
      >
        {/* Subtle Stage-Reactive Background Color Layer */}
        <div
          ref={bgLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-colors duration-700"
          style={{ backgroundColor: chapters[0].bgColor }}
        />

        {/* Subtle radial spotlight behind center garment */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 48% 50%, rgba(200, 255, 61, 0.045) 0%, rgba(242, 240, 235, 0.04) 26%, transparent 62%)',
          }}
        />

        {/* Top Section Header Row */}
        <div className="relative z-20 flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8FF3D]">
              <span className="sm:hidden">02 / ANATOMY</span>
              <span className="hidden sm:inline">02 / GARMENT ANATOMY</span>
            </span>
            <span className="hidden h-[1px] w-8 bg-[#F2F0EB]/20 md:inline-block" aria-hidden="true" />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] md:inline">
              {siteConfig.heroGarment.code} MICRO-INSPECTION
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em]">
            <span className="hidden text-[#8D8B86] sm:inline">
              REVOLUTION{' '}
              <span ref={degreeRef} className="ml-1.5 tabular-nums text-[#F2F0EB]">
                000°
              </span>
            </span>
            <span className="whitespace-nowrap text-[#C8FF3D] tabular-nums">
              0{activeChapter + 1} / 0{chapters.length}
            </span>
          </div>
        </div>

        {/* Full-Bleed Desktop / Soft-Feathered Mobile 3D Macro Inspection Canvas */}
        <div className="story-canvas-stage relative my-2 h-[38vh] w-full sm:h-[44vh] md:absolute md:inset-0 md:z-10 md:my-0 md:h-full">
          <PinnedStoryViewer
            storyProgressRef={storyProgressRef}
            activeChapter={activeChapter}
          />
        </div>

        {/* Foreground 3-Column Editorial HUD Layer */}
        <div className="pointer-events-none relative z-20 my-auto grid flex-1 grid-cols-1 items-center gap-5 py-2 md:grid-cols-12 md:gap-8 md:py-4">
          {/* Desktop Left Rail: Chapter Selectors + Vertical Track */}
          <div className="pointer-events-auto hidden md:col-span-3 md:flex md:items-center md:gap-5">
            <div className="relative h-48 w-[1px] bg-[#F2F0EB]/14" aria-hidden="true">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-top bg-[#C8FF3D]"
                style={{ transform: 'scaleY(0.06)' }}
              />
            </div>

            <nav aria-label="Garment anatomy chapters" className="flex flex-col gap-3">
              {chapters.map((ch, idx) => {
                const isActive = activeChapter === idx;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectChapter(idx)}
                    data-cursor="ZOOM"
                    className={`group flex items-center gap-3 text-left transition-colors duration-300 ${
                      isActive ? 'text-[#F2F0EB]' : 'text-[#8D8B86] hover:text-[#F2F0EB]/85'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] tabular-nums transition-colors ${
                        isActive ? 'text-[#C8FF3D]' : 'text-[#8D8B86]'
                      }`}
                    >
                      {ch.index}
                    </span>
                    <span
                      className={`h-[1px] transition-all duration-300 ${
                        isActive ? 'w-6 bg-[#C8FF3D]' : 'w-2 bg-[#F2F0EB]/20 group-hover:w-4'
                      }`}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                      {ch.label.replace(/^\d+\s*\/\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center Aperture Spacer on Desktop so Canvas remains clear between Left & Right HUD */}
          <div className="hidden md:col-span-5 md:block" aria-hidden="true" />

          {/* Mobile Interactive Chapter Pills (< 768px) */}
          <div
            className="pointer-events-auto flex flex-wrap gap-2 md:hidden"
            role="tablist"
            aria-label="Anatomy details"
          >
            {chapters.map((ch, idx) => {
              const isActive = activeChapter === idx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectChapter(idx)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? 'border-[#C8FF3D] bg-[#C8FF3D] text-[#0A0A0A]'
                      : 'border-[#F2F0EB]/16 bg-[#121212] text-[#F2F0EB]/80'
                  }`}
                >
                  {ch.index} · {ch.label.replace(/^\d+\s*\/\s*/, '')}
                </button>
              );
            })}
          </div>

          {/* Right Column: Scrubbed Detail Overlays (Desktop) / Active Narrative (Mobile) */}
          <div className="pointer-events-auto relative md:col-span-4 md:h-[260px]">
            {/* Desktop Scrub-Animated Stacked Cards */}
            <div className="hidden md:block">
              {chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center border-l border-[#F2F0EB]/14 pl-6"
                  style={{ opacity: idx === 0 ? 1 : 0 }}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
                    {ch.label}
                  </span>
                  <h2 className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.65rem)] font-semibold uppercase leading-[0.98] tracking-[-0.03em] text-[#F2F0EB]">
                    {ch.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[#F2F0EB]/80">
                    {ch.description}
                  </p>
                  <div className="mt-5 inline-flex w-fit items-center gap-2 border border-[#F2F0EB]/14 bg-[#0A0A0A]/65 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86] backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF3D]" aria-hidden="true" />
                    <span>{ch.spec}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Simplified Active Detail */}
            <div className="space-y-3 md:hidden">
              {(() => {
                const ch = chapters[activeChapter];
                return (
                  <div className="border-l-2 border-[#C8FF3D] pl-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8FF3D]">
                      {ch.label}
                    </span>
                    <h2 className="mt-1.5 font-display text-2xl font-semibold uppercase leading-[1.0] tracking-[-0.025em] text-[#F2F0EB]">
                      {ch.title}
                    </h2>
                    <p className="mt-2 text-base leading-relaxed text-[#F2F0EB]/82">
                      {ch.description}
                    </p>
                    <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8D8B86]">
                      {ch.spec}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bottom Architectural Footer Bar inside Pinned Stage */}
        <div className="relative z-20 flex items-center justify-between border-t border-[#F2F0EB]/12 pt-3.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86]">
            {siteConfig.heroGarment.name}
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] sm:inline">
            SCROLL TO ZOOM THROUGH 4 CONSTRUCTION STAGES
          </span>
        </div>
      </div>
    </section>
  );
}
