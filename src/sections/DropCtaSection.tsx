'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

/**
 * Section 7: CTA ("Join the next drop.")
 * Quiet-luxury sentence-case serif headline + clean underline email input +
 * single hairline outlined CTA that fills cleanly on hover (#EDE8DF / #0B0B0A).
 */
export function DropCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const lines = headingRef.current?.querySelectorAll<HTMLElement>('[data-cta-line]');
      if (lines && lines.length > 0 && headingRef.current) {
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              lines,
              { yPercent: 108, opacity: 0.15 },
              {
                yPercent: 0,
                opacity: 1,
                duration: DURATION.base,
                stagger: 0.09,
                ease: EASE.expoOut,
              }
            );
          },
        });
      }

      if (formWrapRef.current) {
        ScrollTrigger.create({
          trigger: formWrapRef.current,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              formWrapRef.current,
              { y: 24, opacity: 0.15 },
              {
                y: 0,
                opacity: 1,
                duration: 0.95,
                ease: EASE.power3Out,
              }
            );
          },
        });
      }
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    setSubmittedEmail(cleaned);
    setEmail('');
  };

  const { cta } = brandConfig;

  return (
    <section
      id="drop-cta"
      ref={sectionRef}
      aria-label="Join the next drop"
      className="relative w-full border-t border-[#EDE8DF]/12 bg-[#0D0D10] text-[#EDE8DF]"
      style={{
        padding: 'clamp(6.5rem, 17vh, 11.5rem) var(--gutter)',
      }}
    >
      <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <h2
            ref={headingRef}
            className="display text-[clamp(2.8rem,6.5vw,6.2rem)] leading-[0.94] tracking-[-0.025em]"
          >
            {cta.headlineLines.map((line) => (
              <span key={line} className="block overflow-hidden pb-1">
                <span data-cta-line className="block text-[#EDE8DF]">
                  {line}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div ref={formWrapRef} className="lg:col-span-6">
          <p className="max-w-lg text-[17px] leading-[1.6] text-[#EDE8DF]/84 sm:text-[18px]">
            {cta.subtitle}
          </p>

          {submittedEmail ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-8 border border-[#EDE8DF]/20 bg-[#121210] p-6"
            >
              <p className="text-[14px] tracking-[0.04em] text-[#B8A27A]">
                Registered · {submittedEmail}
              </p>
              <p className="mt-2 text-[15px] text-[#EDE8DF]/88">{cta.successMessage}</p>
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="mt-4 text-[14px] tracking-[0.04em] text-[#8A857B] underline underline-offset-4 hover:text-[#EDE8DF]"
              >
                Use another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="flex-1">
                  <label htmlFor="drop-email" className="sr-only">
                    Email address for release notice
                  </label>
                  <input
                    id="drop-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={cta.placeholder}
                    className="w-full border-b border-[#EDE8DF]/28 bg-transparent py-3.5 text-base tracking-[0.02em] text-[#EDE8DF] placeholder:text-[#8A857B] focus:border-[#EDE8DF] focus:outline-none"
                  />
                </div>

                {/* Quiet-luxury outlined rectangular button: fills solid on hover */}
                <button
                  type="submit"
                  className="inline-flex shrink-0 self-start items-center gap-3 border border-[#EDE8DF]/38 bg-transparent px-7 py-3.5 text-[14px] tracking-[0.04em] text-[#EDE8DF] transition-colors duration-300 hover:border-[#EDE8DF] hover:bg-[#EDE8DF] hover:text-[#0B0B0A] sm:self-auto"
                >
                  <span>{cta.buttonLabel}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              {errorMsg && (
                <p role="alert" className="text-[15px] text-[#EDE8DF]">
                  {errorMsg}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
