'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { useLenis } from '@/hooks/useLenis';
import { MagneticButton } from '@/components/MagneticButton';

/**
 * Section 9: FOOTER
 * Oversized bottom wordmark reveal, studio index links, socials, and back-to-top anchor.
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
              { yPercent: 60, opacity: 0.25 },
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

      const columns = footer.querySelectorAll<HTMLElement>('[data-footer-col]');
      if (columns.length > 0) {
        ScrollTrigger.create({
          trigger: footer,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              columns,
              { y: 24, opacity: 0.2 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.08,
                ease: EASE.power3Out,
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

  const { brand, footer, nav } = siteConfig;

  return (
    <footer
      ref={footerRef}
      aria-label="Footer Navigation and Studio Credits"
      className="relative w-full overflow-hidden border-t border-[#F2F0EB]/12 bg-[#0A0A0A] text-[#F2F0EB]"
      style={{
        padding: 'clamp(4.5rem, 10vh, 7rem) var(--gutter) clamp(2rem, 4vh, 3rem)',
      }}
    >
      {/* Top 4-Column Architectural Directory */}
      <div className="grid grid-cols-1 gap-10 border-b border-[#F2F0EB]/12 pb-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Studio Coordinates & Contact */}
        <div data-footer-col className="space-y-4 lg:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
            STUDIO ATELIERS
          </p>
          <div className="space-y-3 pt-1">
            {footer.studios.map((s) => (
              <div key={s.city}>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#F2F0EB]">
                  {s.city}
                </p>
                <p className="text-sm text-[#8D8B86]">{s.address}</p>
              </div>
            ))}
          </div>
          <p className="pt-2 font-mono text-xs tracking-[0.06em] text-[#F2F0EB]/75">
            {footer.contactEmail}
          </p>
        </div>

        {/* Navigation Link Columns */}
        {footer.columns.map((col) => (
          <div key={col.title} data-footer-col className="lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8D8B86]">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((item) => (
                <li key={item.href}>
                  {item.href.startsWith('/') ? (
                    <Link
                      href={item.href}
                      data-cursor="OPEN"
                      className="nav-roll text-sm text-[#F2F0EB]/85 transition-colors hover:text-[#C8FF3D]"
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true" className="text-[#C8FF3D]">
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(item.href);
                      }}
                      data-cursor="VIEW"
                      className="nav-roll text-sm text-[#F2F0EB]/85 transition-colors hover:text-[#C8FF3D]"
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true" className="text-[#C8FF3D]">
                        {item.label}
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Channels + Back to Top */}
        <div data-footer-col className="flex flex-col justify-between gap-6 lg:col-span-2 lg:items-end">
          <div className="lg:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8D8B86]">
              CHANNELS
            </p>
            <ul className="mt-4 space-y-2.5">
              {nav.socials.map((s) => (
                <li key={s.label}>
                  {s.href.startsWith('/') ? (
                    <Link
                      href={s.href}
                      data-cursor="OPEN"
                      className="nav-roll text-sm text-[#F2F0EB]/85 transition-colors hover:text-[#C8FF3D]"
                    >
                      <span>{s.label}</span>
                      <span aria-hidden="true" className="text-[#C8FF3D]">
                        {s.label}
                      </span>
                    </Link>
                  ) : (
                    <a
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                      onClick={(e) => {
                        if (s.href.startsWith('#')) {
                          e.preventDefault();
                          handleLinkClick(s.href);
                        }
                      }}
                      className="nav-roll text-sm text-[#F2F0EB]/85 transition-colors hover:text-[#C8FF3D]"
                    >
                      <span>{s.label}</span>
                      <span aria-hidden="true" className="text-[#C8FF3D]">
                        {s.label}
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <MagneticButton strength={0.25}>
            <button
              type="button"
              onClick={() => handleLinkClick('#hero')}
              data-cursor="TOP"
              className="rounded-full border border-[#F2F0EB]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F2F0EB] transition-colors duration-300 hover:border-[#C8FF3D] hover:text-[#C8FF3D]"
            >
              ↑ Back to Top
            </button>
          </MagneticButton>
        </div>
      </div>

      {/* Huge Brand Wordmark */}
      <div className="overflow-hidden pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div
          ref={wordmarkRef}
          className="select-none font-display text-[clamp(3.3rem,13.6vw,14rem)] font-bold uppercase leading-[0.82] tracking-[-0.045em] text-[#F2F0EB]/92"
        >
          {brand.name}
        </div>
      </div>

      {/* Bottom Legal & Geo Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F2F0EB]/12 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86]">
        <span>{footer.legal}</span>
        <span>{brand.coordinates}</span>
      </div>
    </footer>
  );
}
