'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { brandConfig } from '@/lib/brand.config';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { MagneticButton } from '@/components/MagneticButton';

/**
 * Section 8: CTA ("Join the next drop")
 * Clean underline email input + single signature electric-lime (#C8FF3D) magnetic CTA.
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
      aria-label="Join Next Drop"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0D0D10] text-[#F2F0EB]"
      style={{
        padding: 'clamp(6.5rem, 18vh, 12rem) var(--gutter)',
      }}
    >
      <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2.4rem,6.5vw,6rem)] font-semibold uppercase leading-[0.9] tracking-[-0.015em]"
          >
            {cta.headlineLines.map((line) => (
              <span key={line} className="block overflow-hidden pb-1">
                <span
                  data-cta-line
                  className="block text-[#F2F0EB]"
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div ref={formWrapRef} className="lg:col-span-6">
          <p className="max-w-lg text-base leading-relaxed text-[#F2F0EB]/86 sm:text-[18px]">
            {cta.subtitle}
          </p>

          {submittedEmail ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-8 border border-[#F2F0EB]/20 bg-[#121212] p-6"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-[#C8FF3D]">
                Registered · {submittedEmail}
              </p>
              <p className="mt-2 text-[15px] text-[#F2F0EB]/88">{cta.successMessage}</p>
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="mt-4 text-[13px] uppercase tracking-[0.1em] text-[#9A9790] underline underline-offset-4 hover:text-[#F2F0EB]"
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
                    className="w-full border-b border-[#F2F0EB]/28 bg-transparent py-3.5 text-base tracking-[0.02em] text-[#F2F0EB] placeholder:text-[#9A9790] focus:border-[#F2F0EB] focus:outline-none"
                  />
                </div>

                {/* Intentional primary Electric-Lime CTA */}
                <MagneticButton strength={0.28} className="self-start sm:self-auto">
                  <button
                    type="submit"
                    data-cursor="JOIN"
                    className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#C8FF3D] px-7 py-3.5 text-sm font-medium uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors duration-300 hover:bg-[#F2F0EB]"
                  >
                    <span>{cta.buttonLabel}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </MagneticButton>
              </div>

              {errorMsg && (
                <p role="alert" className="text-[15px] text-[#F2F0EB]">
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
