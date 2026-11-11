'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { brandConfig, type CapsuleProduct } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import { ProductViewModal } from '@/components/ProductViewModal';
import { FooterSection } from '@/sections/FooterSection';

export default function ArchivePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<CapsuleProduct | null>(null);

  const categories = [
    'All',
    ...Array.from(new Set(brandConfig.collection.products.map((p) => p.category))),
  ];
  const visibleProducts =
    selectedCategory === 'All'
      ? brandConfig.collection.products
      : brandConfig.collection.products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#EDE8DF]">
      <section
        aria-label="Capsule archive index"
        className="w-full"
        style={{
          padding: 'clamp(6.5rem, 14vh, 9.5rem) var(--gutter) clamp(5rem, 10vh, 7rem)',
        }}
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[#EDE8DF]/12 pb-6">
          <div>
            <p className="text-[14px] tracking-[0.04em] text-[#8A857B]">
              {brandConfig.brand.tagline}
            </p>
            <h1 className="mt-3 display text-[clamp(2.8rem,6vw,5.4rem)] leading-[0.94] tracking-[-0.025em]">
              Archive index.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#EDE8DF]/82 sm:text-lg">
              {brandConfig.brand.description}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-3 border border-[#EDE8DF]/30 bg-transparent px-5 py-2.5 text-[14px] tracking-[0.04em] text-[#EDE8DF] transition-colors duration-300 hover:border-[#EDE8DF] hover:bg-[#EDE8DF] hover:text-[#0B0B0A]"
          >
            <span aria-hidden="true">←</span>
            <span>Return</span>
          </Link>
        </div>

        {/* Category Filter Strip (outlined clean tabs, sentence case) */}
        <div className="mb-12 flex flex-wrap items-center gap-2.5">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`border px-4 py-1.5 text-[14px] tracking-[0.04em] transition-colors duration-300 ${
                  active
                    ? 'border-[#EDE8DF] bg-[#EDE8DF] text-[#0B0B0A]'
                    : 'border-[#EDE8DF]/18 bg-transparent text-[#EDE8DF]/82 hover:border-[#EDE8DF]/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Clean Uniform #D8D3C9 Stone Archive Grid (`data-cursor="View"` solely on image boxes) */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product.id} className="group flex flex-col justify-between">
              <button
                type="button"
                onClick={() => setSelectedProduct(product)}
                data-cursor="View"
                aria-label={`View ${product.name}`}
                className="relative aspect-[4/5] w-full overflow-hidden bg-[#D8D3C9] text-left"
              >
                <Image
                  src={assetPath(product.image)}
                  alt={product.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 30vw"
                  className="object-contain object-center p-5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </button>

              <div className="mt-4 flex flex-col gap-1 border-t border-[#EDE8DF]/12 pt-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="display text-2xl text-[#EDE8DF]">{product.name}</h2>
                  <span className="display shrink-0 text-xl tabular-nums text-[#EDE8DF]">
                    ${product.price}
                  </span>
                </div>
                <p className="text-[15px] text-[#8A857B]">{product.material}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FooterSection />

      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
