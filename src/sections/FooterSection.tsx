'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { useLenis } from '@/hooks/useLenis';

/**
 * Section 8: FOOTER
 * Minimal architecture: 5 direct links, single contact email, no top button pill,
 * and oversized sentence-case Instrument Serif wordmark ("Luxe Wear", Wear italic).
 */
export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();
  const pathname = usePathname();
  const router = useRouter();

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      if (pathname !== '/') {
        router.push(`/${href}`);
        return;
      }
      scrollTo(href);
    }
  };

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (wordmarkRef.current) {
        ScrollTrigger.create({
          trigger: wordmarkRef.current,
          start: 'top 96%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              wordmarkRef.current,
              { yPercent: 50, opacity: 0.25 },
              {
                yPercent: 0,
                opacity: 1,
                duration: DURATION.slow,
                ease: EASE.expoOut,
              }
            );
          },
        });
      }
    }, footer);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const { brand, footerLinks } = brandConfig;

  return (
    <footer
      ref={footerRef}
      aria-label="Footer"
      className="relative w-full overflow-hidden border-t border-[#EDE8DF]/12 bg-[#0B0B0A] text-[#EDE8DF]"
      style={{
        padding: 'clamp(4rem, 9vh, 6.5rem) var(--gutter) clamp(2rem, 4vh, 3rem)',
      }}
    >
      {/* Clean Single-Row Navigation + Contact Email (zero Top pill or cursor clutter) */}
      <div className="flex flex-col items-start justify-between gap-8 border-b border-[#EDE8DF]/12 pb-12 sm:flex-row sm:items-center">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <li key={item.href}>
                {item.href.startsWith('/') ? (
                  <Link
                    href={item.href}
                    className="link text-[15px] text-[#EDE8DF]/85 transition-colors hover:text-[#EDE8DF] sm:text-base"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.href);
                    }}
                    className="link text-[15px] text-[#EDE8DF]/85 transition-colors hover:text-[#EDE8DF] sm:text-base"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={`mailto:${brand.contactEmail}`}
          className="text-[15px] text-[#8A857B] transition-colors hover:text-[#EDE8DF] sm:text-base"
        >
          {brand.contactEmail}
        </a>
      </div>

      {/* Oversized Sentence-Case Brand Wordmark matching Hero */}
      <div className="overflow-hidden pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div
          ref={wordmarkRef}
          className="display select-none text-[clamp(3.6rem,15vw,15rem)] leading-[0.88] tracking-[-0.03em] text-[#EDE8DF]/92"
        >
          {brand.shortLines[0]}{' '}
          <span className="italic">{brand.shortLines[1]}</span>
        </div>
      </div>

      {/* Minimal Copyright Row */}
      <div className="border-t border-[#EDE8DF]/12 pt-5 text-[14px] text-[#8A857B]">
        <span>{brand.copyright}</span>
      </div>
    </footer>
  );
}
