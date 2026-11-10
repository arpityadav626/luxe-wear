'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { useLenis } from '@/hooks/useLenis';
import { MagneticButton } from '@/components/MagneticButton';

/**
 * Section 9: FOOTER
 * Minimal architecture: 5 direct links, single contact email, back-to-top anchor,
 * and oversized properly-spaced LUXE WEAR wordmark reveal.
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
              { yPercent: 55, opacity: 0.25 },
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
      className="relative w-full overflow-hidden border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(4rem, 9vh, 6.5rem) var(--gutter) clamp(2rem, 4vh, 3rem)',
      }}
    >
      {/* Clean Single-Row Navigation + Single Contact Email */}
      <div className="flex flex-col items-start justify-between gap-8 border-b border-[#F2F0EB]/12 pb-12 sm:flex-row sm:items-center">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <li key={item.href}>
                {item.href.startsWith('/') ? (
                  <Link
                    href={item.href}
                    data-cursor="OPEN"
                    className="nav-roll text-sm text-[#F2F0EB]/85 transition-colors hover:text-[#F2F0EB]"
                    data-label={item.label}
                  >
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.href);
                    }}
                    data-cursor="VIEW"
                    data-label={item.label}
                    className="nav-roll text-sm text-[#F2F0EB]/85 transition-colors hover:text-[#F2F0EB]"
                  >
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href={`mailto:${brand.contactEmail}`}
            className="text-sm text-[#9A9790] transition-colors hover:text-[#F2F0EB]"
          >
            {brand.contactEmail}
          </a>

          <MagneticButton strength={0.22}>
            <button
              type="button"
              onClick={() => handleLinkClick('#hero')}
              data-cursor="TOP"
              className="rounded-full border border-[#F2F0EB]/20 px-4 py-2 text-[13px] uppercase tracking-[0.12em] text-[#F2F0EB] transition-colors duration-300 hover:border-[#F2F0EB]/60"
            >
              ↑ Top
            </button>
          </MagneticButton>
        </div>
      </div>

      {/* Oversized Brand Wordmark with Clear Word Spacing */}
      <div className="overflow-hidden pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div
          ref={wordmarkRef}
          className="select-none font-display text-[clamp(3.1rem,13vw,13.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.015em] [word-spacing:0.22em] text-[#F2F0EB]/92"
        >
          {brand.name}
        </div>
      </div>

      {/* Minimal Copyright Row */}
      <div className="border-t border-[#F2F0EB]/12 pt-5 text-[13px] text-[#9A9790]">
        <span>{brand.copyright}</span>
      </div>
    </footer>
  );
}
