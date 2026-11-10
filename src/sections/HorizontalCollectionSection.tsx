'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { brandConfig, type CapsuleProduct } from '@/lib/brand.config';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';

function CollectionProductCard({ product }: { product: CapsuleProduct }) {
  const [swatchIdx, setSwatchIdx] = useState(0);
  const { addToCart } = useAppState();

  const activeSwatch = product.swatches[swatchIdx] ?? product.swatches[0];

  const handleQuickAdd = () => {
    addToCart({
      id: `${product.id}-${activeSwatch.name.toLowerCase().replace(/\s+/g, '-')}`,
      code: product.code,
      name: `${product.name} · ${activeSwatch.name}`,
      size: 'M',
      price: product.price,
      image: assetPath(product.image),
    });
  };

  return (
    <article
      className="group flex w-[76vw] max-w-[300px] shrink-0 snap-center flex-col justify-between md:w-[clamp(260px,21.5vw,310px)] md:max-w-none md:snap-none"
      aria-label={product.name}
    >
      {/* Distinct 3:4 Portrait Garment Frame with Hover Zoom, Colorway Tint & Hover Add */}
      <div
        data-cursor="VIEW"
        className="relative h-[40vh] min-h-[270px] max-h-[395px] w-full overflow-hidden border border-[#F2F0EB]/10 bg-[#0D0D10] md:h-[46vh] md:min-h-[300px] md:max-h-[420px]"
      >
        <Image
          src={assetPath(product.image)}
          alt={product.alt}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 76vw, 24vw"
          className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-color transition-colors duration-500"
          style={{ backgroundColor: activeSwatch.tintOverlay }}
        />

        {/* Hover / Focus Add Action (always visible on touch/mobile so every device can add) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          data-cursor="BAG"
          className="absolute bottom-3.5 right-3.5 rounded-full border border-[#F2F0EB]/30 bg-[#0A0A0A]/85 px-4 py-1.5 text-[13px] uppercase tracking-[0.12em] text-[#F2F0EB] backdrop-blur-md transition-all duration-300 hover:border-[#F2F0EB] hover:bg-[#F2F0EB] hover:text-[#0A0A0A] md:pointer-events-none md:translate-y-1.5 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
        >
          Add (M)
        </button>
      </div>

      {/* Slim Editorial Meta & Colorway Swatches */}
      <div className="mt-3.5 flex flex-col gap-2.5 border-t border-[#F2F0EB]/12 pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-medium tracking-[-0.01em] text-[#F2F0EB] sm:text-xl">
              {product.name}
            </h3>
            <p className="mt-0.5 text-sm text-[#9A9790]">{product.material}</p>
          </div>
          <span className="shrink-0 font-display text-lg font-medium tabular-nums text-[#F2F0EB]">
            ${product.price}
          </span>
        </div>

        <div className="flex items-center gap-2.5" role="group" aria-label={`Colorway for ${product.name}`}>
          <div className="flex items-center gap-1.5">
            {product.swatches.map((swatch, idx) => {
              const isSelected = idx === swatchIdx;
              return (
                <button
                  key={swatch.name}
                  type="button"
                  onClick={() => setSwatchIdx(idx)}
                  onMouseEnter={() => setSwatchIdx(idx)}
                  aria-label={`${swatch.name} colorway`}
                  aria-pressed={isSelected}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border transition-transform duration-200 ${
                    isSelected
                      ? 'scale-110 border-[#F2F0EB]'
                      : 'border-[#F2F0EB]/25 hover:scale-105'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: swatch.hex }}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-[13px] uppercase tracking-[0.12em] text-[#9A9790]">
            {activeSwatch.name}
          </span>
        </div>
      </div>
    </article>
  );
}

/**
 * Section 5: HORIZONTAL SCROLL COLLECTION
 * Desktop: Pinned horizontal scroll across 5 distinct garments with right-side 01 / 05 progress.
 * Mobile / Reduced Motion: Clean non-pinned horizontal swipe carousel.
 */
export function HorizontalCollectionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const products = brandConfig.collection.products;

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!section || !wrapper || !track) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const getTravel = () => Math.max(0, track.scrollWidth - wrapper.clientWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(getTravel() * 1.8, window.innerHeight * 1.5)}`,
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          onUpdate: (self) => {
            const p = self.progress;
            const moveP = Math.min(1, Math.max(0, (p - 0.06) / 0.88));
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${Math.max(0.12, moveP)})`;
            }
            const nextIdx = Math.min(
              products.length - 1,
              Math.floor(moveP * products.length * 0.999)
            );
            setActiveIndex((prev) => (prev === nextIdx ? prev : nextIdx));
          },
        },
      });

      tl.to({}, { duration: 0.06 })
        .to(track, {
          x: () => -getTravel(),
          duration: 0.88,
          ease: 'none',
        })
        .to({}, { duration: 0.06 });

      return () => {
        tl.kill();
      };
    });

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, [products.length]);

  const handleMobileScroll = () => {
    const track = trackRef.current;
    if (!track || window.innerWidth >= 768) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const p = track.scrollLeft / maxScroll;
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${Math.max(0.18, p)})`;
    }
    const nextIdx = Math.min(products.length - 1, Math.round(p * (products.length - 1)));
    setActiveIndex((prev) => (prev === nextIdx ? prev : nextIdx));
  };

  return (
    <section
      id="collection"
      ref={sectionRef}
      aria-label="Capsule Collection"
      className="relative flex w-full flex-col justify-between overflow-hidden border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB] md:h-[100dvh]"
      style={{
        paddingTop: 'clamp(5.2rem, 10vh, 6.25rem)',
        paddingBottom: 'clamp(1.75rem, 4vh, 2.75rem)',
      }}
    >
      {/* Top Row with Label & Right Progress Counter (01 / 05) */}
      <div className="px-[var(--gutter)]">
        <div className="flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-3.5">
          <span className="text-[13px] uppercase tracking-[0.18em] text-[#9A9790]">
            {brandConfig.collection.label}
          </span>
          <span className="text-[13px] uppercase tracking-[0.16em] tabular-nums text-[#F2F0EB]/85">
            0{activeIndex + 1} / 0{products.length}
          </span>
        </div>
      </div>

      {/* Horizontal Track */}
      <div ref={wrapperRef} className="my-auto w-full overflow-hidden py-4 md:py-2">
        <div
          ref={trackRef}
          onScroll={handleMobileScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] md:w-max md:snap-none md:gap-12 md:overflow-visible md:px-[var(--gutter)]"
        >
          <div className="hidden shrink-0 flex-col justify-end border-r border-[#F2F0EB]/12 pr-8 pb-4 md:flex md:w-[clamp(220px,18vw,270px)]">
            <h2 className="font-display text-[clamp(2rem,3vw,3rem)] font-semibold uppercase leading-[0.96] tracking-[-0.015em] text-[#F2F0EB]">
              {brandConfig.collection.heading}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#9A9790]">
              {brandConfig.collection.subtitle}
            </p>
          </div>

          {products.map((product) => (
            <CollectionProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Right-aligned Progress Line */}
      <div className="flex items-center justify-end gap-4 px-[var(--gutter)]">
        <span className="text-[13px] uppercase tracking-[0.14em] text-[#9A9790] md:hidden">
          Swipe
        </span>
        <div className="h-[1px] w-full max-w-xs overflow-hidden bg-[#F2F0EB]/14">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-[#F2F0EB]"
            style={{ transform: 'scaleX(0.18)' }}
          />
        </div>
      </div>
    </section>
  );
}
