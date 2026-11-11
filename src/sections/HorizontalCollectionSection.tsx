'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { brandConfig, type CapsuleProduct } from '@/lib/brand.config';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';
import { ProductViewModal } from '@/components/ProductViewModal';

function CollectionProductCard({
  product,
  onSelect,
}: {
  product: CapsuleProduct;
  onSelect: (p: CapsuleProduct) => void;
}) {
  return (
    <article
      className="group flex w-[80vw] max-w-[340px] shrink-0 snap-center flex-col justify-between md:w-[29vw] md:min-w-[310px] md:max-w-[440px] md:snap-none"
      aria-label={product.name}
    >
      {/* Unified #D8D3C9 Warm Stone Container — carries [data-cursor="View"] */}
      <button
        type="button"
        onClick={() => onSelect(product)}
        data-cursor="View"
        aria-label={`View ${product.name}`}
        className="relative aspect-[4/5] max-h-[55vh] w-full overflow-hidden bg-[#D8D3C9] text-left"
      >
        <Image
          src={assetPath(product.image)}
          alt={product.alt}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 80vw, 29vw"
          className="object-contain object-center p-[5%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </button>

      {/* Pure Editorial Meta: Title, Price & Single Material Line (no swatches or buttons) */}
      <div className="mt-4 flex flex-col gap-1 border-t border-[#0B0B0A]/14 pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="display text-xl text-[#0B0B0A] sm:text-2xl">{product.name}</h3>
          <span className="display shrink-0 text-lg tabular-nums text-[#0B0B0A] sm:text-xl">
            ${product.price}
          </span>
        </div>
        <p className="text-[15px] text-[#5A554D]">{product.material}</p>
      </div>
    </article>
  );
}

/**
 * Section 5: HORIZONTAL SCROLL COLLECTION
 * Desktop: 3 large cards per screen across 5 garments with clean hairline progress bar.
 * Clicking any garment image (`data-cursor="View"`) opens the minimal sizing sheet.
 */
export function HorizontalCollectionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<CapsuleProduct | null>(null);

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
    <>
      <section
        id="collection"
        ref={sectionRef}
        aria-label="Capsule collection"
        className="relative flex w-full flex-col justify-between overflow-hidden border-t border-[#0B0B0A]/12 bg-[#E6E1D7] text-[#0B0B0A] md:h-[100dvh]"
        style={{
          paddingTop: 'clamp(4.75rem, 8.5vh, 5.75rem)',
          paddingBottom: 'clamp(1.75rem, 4vh, 2.75rem)',
        }}
      >
        <div className="px-[var(--gutter)]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#0B0B0A]/14 pb-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] tracking-[0.04em] text-[#5A554D]">
                {brandConfig.collection.label}
              </span>
              <h2 className="display text-[clamp(3.2rem,4.6vw,4.5rem)] leading-[0.95] tracking-[-0.025em] text-[#0B0B0A]">
                {brandConfig.collection.heading}
              </h2>
            </div>
            <span className="text-[14px] tracking-[0.04em] tabular-nums text-[#0B0B0A]/82">
              0{activeIndex + 1} / 0{products.length}
            </span>
          </div>
        </div>

        {/* Horizontal Track: no data-cursor on outer strip; only product image buttons opt in */}
        <div ref={wrapperRef} className="my-auto w-full overflow-hidden py-4 md:py-2">
          <div
            ref={trackRef}
            onScroll={handleMobileScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] md:w-max md:snap-none md:gap-[2vw] md:overflow-visible md:px-[var(--gutter)]"
          >
            {products.map((product) => (
              <CollectionProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-[var(--gutter)]">
          <p className="hidden text-[15px] text-[#5A554D] md:block">
            {brandConfig.collection.subtitle}
          </p>
          <span className="text-[14px] tracking-[0.04em] text-[#5A554D] md:hidden">Swipe</span>
          <div className="h-[1px] w-full max-w-xs overflow-hidden bg-[#0B0B0A]/14">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-[#0B0B0A]"
              style={{ transform: 'scaleX(0.18)' }}
            />
          </div>
        </div>
      </section>

      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
