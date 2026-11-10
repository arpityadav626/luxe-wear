'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { siteConfig, type CollectionProduct } from '@/config/site';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';

function CollectionProductCard({
  product,
  index,
}: {
  product: CollectionProduct;
  index: number;
}) {
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
      aria-label={`${product.code} ${product.name}`}
    >
      {/* 3:4 Portrait Garment Frame with Hover Kinetic Zoom & Swatch Tint Preview */}
      <div
        data-cursor="VIEW"
        className="relative h-[40vh] min-h-[270px] max-h-[395px] w-full overflow-hidden border border-[#F2F0EB]/10 bg-[#0D0D10] md:h-[46vh] md:min-h-[300px] md:max-h-[420px]"
      >
        <Image
          src={assetPath(product.image)}
          alt={product.alt}
          fill
          loading="eager"
          sizes="(max-width: 768px) 76vw, 24vw"
          className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />

        {/* Dynamic Colorway Tint Preview Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-color transition-colors duration-500"
          style={{ backgroundColor: activeSwatch.tintOverlay }}
        />

        {/* Subtle Architectural Hover Vignette & Viewfinder Brackets */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, transparent 48%, rgba(10, 10, 10, 0.55) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C8FF3D]"
        >
          0{index + 1} / {product.code}
        </span>
      </div>

      {/* Product Meta, Interactive Color Swatches & Quick Add */}
      <div className="mt-4 flex flex-col gap-3 border-t border-[#F2F0EB]/12 pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-[#F2F0EB] sm:text-xl">
              {product.name}
            </h3>
            <p className="mt-0.5 text-sm text-[#8D8B86]">{product.material}</p>
          </div>
          <span className="shrink-0 font-display text-lg font-medium tabular-nums text-[#F2F0EB]">
            ${product.price}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Interactive Color Swatch Preview */}
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
                        ? 'scale-110 border-[#C8FF3D]'
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
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8D8B86]">
              {activeSwatch.name}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            data-cursor="BAG"
            className="shrink-0 rounded-full border border-[#F2F0EB]/20 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F2F0EB] transition-colors duration-300 hover:border-[#C8FF3D] hover:bg-[#C8FF3D] hover:text-[#0A0A0A]"
          >
            + Add (M)
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Section 5: HORIZONTAL SCROLL COLLECTION
 * Desktop: ScrollTrigger pins the stage and scrubs horizontally across 5 capsule silhouettes.
 * Mobile / Reduced Motion: Clean non-pinned horizontal swipe carousel with snap alignment.
 */
export function HorizontalCollectionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const products = siteConfig.collection.products;

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
          end: () => `+=${Math.max(getTravel() * 1.85, window.innerHeight * 1.55)}`,
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          onUpdate: (self) => {
            const p = self.progress;
            const moveP = Math.min(1, Math.max(0, (p - 0.06) / 0.88));
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${Math.max(0.08, moveP)})`;
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
      progressBarRef.current.style.transform = `scaleX(${Math.max(0.15, p)})`;
    }
    const nextIdx = Math.min(products.length - 1, Math.round(p * (products.length - 1)));
    setActiveIndex((prev) => (prev === nextIdx ? prev : nextIdx));
  };

  return (
    <section
      id="collection"
      ref={sectionRef}
      aria-label="Drop 01 Capsule Collection"
      className="relative flex w-full flex-col justify-between overflow-hidden border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB] md:h-[100dvh]"
      style={{
        paddingTop: 'clamp(5.2rem, 10vh, 6.25rem)',
        paddingBottom: 'clamp(1.75rem, 4vh, 2.75rem)',
      }}
    >
      {/* Top Collection Header Row */}
      <div className="px-[var(--gutter)]">
        <div className="flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
              <span className="sm:hidden">04 / COLLECTION</span>
              <span className="hidden sm:inline">{siteConfig.collection.indexLabel}</span>
            </span>
            <span className="hidden h-[1px] w-8 bg-[#F2F0EB]/20 md:inline-block" aria-hidden="true" />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] md:inline">
              {siteConfig.collection.tagline}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em]">
            <span className="hidden text-[#8D8B86] sm:inline">ARCHIVE PIECES</span>
            <span className="whitespace-nowrap text-[#C8FF3D] tabular-nums">
              0{activeIndex + 1} / 0{products.length}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Track (Desktop GSAP Pinned Translate / Mobile Native Swipe Carousel) */}
      <div ref={wrapperRef} className="my-auto w-full overflow-hidden py-4 md:py-2">
        <div
          ref={trackRef}
          onScroll={handleMobileScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] md:w-max md:snap-none md:gap-12 md:overflow-visible md:px-[var(--gutter)]"
        >
          {/* Desktop Lead Editorial Column (slides left as capsule garments traverse into frame) */}
          <div className="hidden shrink-0 flex-col justify-between border-r border-[#F2F0EB]/12 pr-8 md:flex md:w-[clamp(235px,20vw,290px)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8FF3D]">
                SYSTEM 01 · CAPSULE
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,3vw,3.1rem)] font-semibold uppercase leading-[0.94] tracking-[-0.035em] text-[#F2F0EB]">
                Modular
                <br />
                Garments.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#8D8B86]">
                Five interlocking silhouettes cut from matte 3L Japanese twill, merino knitwear, and
                anodized hardware. Hover swatches to preview finishes.
              </p>
            </div>

            <div className="border-t border-[#F2F0EB]/12 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8D8B86]">
                EDITION RUN
              </p>
              <p className="mt-1 font-display text-lg font-medium text-[#F2F0EB]">
                Numbered · 250 Units Each
              </p>
            </div>
          </div>

          {products.map((product, idx) => (
            <CollectionProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>

      {/* Bottom Progress Rail */}
      <div className="px-[var(--gutter)]">
        <div className="flex items-center justify-between gap-4 pb-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8D8B86] md:hidden">
            SWIPE TO EXPLORE DROP 01
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[#8D8B86] md:inline">
            SCROLL TO TRAVERSE CAPSULE ARCHIVE · HOVER TO PREVIEW COLORWAY
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8D8B86]">
            5 SILHOUETTES
          </span>
        </div>
        <div className="h-[1px] w-full overflow-hidden bg-[#F2F0EB]/12">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-[#C8FF3D]"
            style={{ transform: 'scaleX(0.15)' }}
          />
        </div>
      </div>
    </section>
  );
}
