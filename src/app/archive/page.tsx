'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { brandConfig } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';
import { MagneticButton } from '@/components/MagneticButton';
import { FooterSection } from '@/sections/FooterSection';

export default function ArchivePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const { addToCart } = useAppState();

  const categories = ['ALL', ...Array.from(new Set(brandConfig.collection.products.map((p) => p.category)))];
  const visibleProducts =
    selectedCategory === 'ALL'
      ? brandConfig.collection.products
      : brandConfig.collection.products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F0EB]">
      <section
        aria-label="Capsule Archive Index"
        className="w-full"
        style={{
          padding: 'clamp(6.5rem, 14vh, 9.5rem) var(--gutter) clamp(5rem, 10vh, 7rem)',
        }}
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[#F2F0EB]/12 pb-6">
          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-[#9A9790]">
              {brandConfig.brand.tagline}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,5.25rem)] font-semibold uppercase leading-[0.94] tracking-[-0.015em]">
              Capsule Index.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#F2F0EB]/82 sm:text-lg">
              {brandConfig.brand.description}
            </p>
          </div>

          <MagneticButton strength={0.25}>
            <Link
              href="/"
              data-cursor="BACK"
              className="inline-flex items-center gap-3 rounded-full border border-[#F2F0EB]/20 px-5 py-2.5 text-[13px] uppercase tracking-[0.14em] text-[#F2F0EB] transition-colors duration-300 hover:border-[#F2F0EB]/60"
            >
              <span aria-hidden="true">←</span>
              <span>Return</span>
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
                className={`rounded-full border px-4 py-1.5 text-[13px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  active
                    ? 'border-[#F2F0EB] bg-[#F2F0EB] text-[#0A0A0A]'
                    : 'border-[#F2F0EB]/16 bg-[#121212] text-[#F2F0EB]/80 hover:border-[#F2F0EB]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Clean Specification Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col justify-between border border-[#F2F0EB]/12 bg-[#121212]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0F0F0F]">
                <Image
                  src={assetPath(product.image)}
                  alt={product.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 30vw"
                  className="object-cover object-center mix-blend-lighten transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
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
                  className="absolute bottom-4 right-4 rounded-full border border-[#F2F0EB]/30 bg-[#0A0A0A]/85 px-4 py-2 text-[13px] font-medium uppercase tracking-[0.1em] text-[#F2F0EB] backdrop-blur-md transition-all duration-300 hover:border-[#F2F0EB] hover:bg-[#F2F0EB] hover:text-[#0A0A0A] md:pointer-events-none md:translate-y-1.5 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                >
                  Add (M)
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#9A9790]">
                    {product.category}
                  </p>
                  <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-[#F2F0EB]">
                      {product.name}
                    </h2>
                    <span className="font-display text-lg font-medium tabular-nums text-[#F2F0EB]">
                      ${product.price}
                    </span>
                  </div>
                  <p className="mt-2 text-base text-[#9A9790]">{product.material}</p>
                </div>

                <details className="mt-4 border-t border-[#F2F0EB]/10 pt-3">
                  <summary className="flex cursor-pointer items-center justify-between text-[13px] font-medium uppercase tracking-[0.1em] text-[#9A9790] transition-colors hover:text-[#F2F0EB]">
                    <span>Details</span>
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 text-base leading-relaxed text-[#F2F0EB]/82">
                    {product.specDetail}
                  </p>
                  <p className="mt-1.5 text-[15px] text-[#9A9790]">
                    Finishes: {product.swatches.map((s) => s.name).join(' / ')}
                  </p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
