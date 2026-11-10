'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';
import { MagneticButton } from '@/components/MagneticButton';
import { FooterSection } from '@/sections/FooterSection';

export default function ArchivePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const { addToCart } = useAppState();

  const categories = ['ALL', ...Array.from(new Set(siteConfig.collection.products.map((p) => p.category)))];
  const visibleProducts =
    selectedCategory === 'ALL'
      ? siteConfig.collection.products
      : siteConfig.collection.products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F0EB]">
      <section
        aria-label="Drop 01 Technical Archive Index"
        className="w-full"
        style={{
          padding: 'clamp(6.5rem, 14vh, 9.5rem) var(--gutter) clamp(5rem, 10vh, 7rem)',
        }}
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[#F2F0EB]/12 pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
              ARCHIVE / {siteConfig.brand.season}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
              Technical Index.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#F2F0EB]/82 sm:text-lg">
              Complete garment specifications, textile weights, and serialized colorways across Drop 01.
            </p>
          </div>

          <MagneticButton strength={0.25}>
            <Link
              href="/"
              data-cursor="BACK"
              className="inline-flex items-center gap-3 rounded-full border border-[#F2F0EB]/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F2F0EB] transition-colors duration-300 hover:border-[#C8FF3D] hover:text-[#C8FF3D]"
            >
              <span aria-hidden="true">←</span>
              <span>Return to Runway</span>
            </Link>
          </MagneticButton>
        </div>

        {/* Category Filter Strip */}
        <div className="mb-12 flex flex-wrap items-center gap-2.5">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                  active
                    ? 'border-[#C8FF3D] bg-[#C8FF3D] text-[#0A0A0A]'
                    : 'border-[#F2F0EB]/16 bg-[#121212] text-[#F2F0EB]/80 hover:border-[#F2F0EB]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Technical Specification Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, idx) => (
            <article
              key={product.id}
              className="group flex flex-col justify-between border border-[#F2F0EB]/12 bg-[#121212]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0A0A]">
                <Image
                  src={assetPath(product.image)}
                  alt={product.alt}
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 30vw"
                  className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                <span className="absolute left-3.5 top-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C8FF3D]">
                  0{idx + 1} / {product.code}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86]">
                    {product.category}
                  </p>
                  <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-[#F2F0EB]">
                      {product.name}
                    </h2>
                    <span className="font-display text-lg font-medium tabular-nums text-[#F2F0EB]">
                      ${product.price}
                    </span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-[#F2F0EB]/80">
                    {product.material}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F2F0EB]/10 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8D8B86]">
                    {product.swatches.map((s) => s.name).join(' / ')}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        code: product.code,
                        name: product.name,
                        size: 'M',
                        price: product.price,
                        image: assetPath(product.image),
                      })
                    }
                    data-cursor="BAG"
                    className="shrink-0 whitespace-nowrap rounded-full border border-[#F2F0EB]/20 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F2F0EB] transition-colors hover:border-[#C8FF3D] hover:bg-[#C8FF3D] hover:text-[#0A0A0A]"
                  >
                    + Add (M)
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
