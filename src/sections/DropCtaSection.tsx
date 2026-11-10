'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { siteConfig } from '@/config/site';
import { DURATION, EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { MagneticButton } from '@/components/MagneticButton';

/**
 * Section 8: CTA ("Join the next drop")
 * Minimalist private allocation signup with underline email input and magnetic CTA.
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
              { y: 26, opacity: 0.15 },
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
      setErrorMsg('ENTER A VALID EMAIL ADDRESS TO REGISTER ALLOCATION.');
      return;
    }
    setErrorMsg(null);
    setSubmittedEmail(cleaned);
    setEmail('');
  };

  const { cta } = siteConfig;

  return (
    <section
      id="drop-cta"
      ref={sectionRef}
      aria-label="Join Next Drop Allocation"
      className="relative w-full border-t border-[#F2F0EB]/12 bg-[#0D0D10] text-[#F2F0EB]"
      style={{
        padding: 'clamp(5.5rem, 13vh, 9.5rem) var(--gutter)',
      }}
    >
      <div className="mb-10 flex items-center justify-between gap-2 border-b border-[#F2F0EB]/12 pb-4 sm:mb-14">
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8FF3D]">
          {cta.indexLabel}
        </span>
        <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86] sm:inline">
          DROP 02 DISPATCH · PRIVATE ACCESS
        </span>
      </div>

      <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2.4rem,6.5vw,6.25rem)] font-semibold uppercase leading-[0.88] tracking-[-0.04em]"
          >
            {cta.headlineLines.map((line, idx) => (
              <span key={line} className="block overflow-hidden pb-1">
                <span
                  data-cta-line
                  className={`block ${idx === 1 ? 'text-[#8D8B86]' : 'text-[#F2F0EB]'}`}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div ref={formWrapRef} className="lg:col-span-6">
          <p className="max-w-xl text-base leading-relaxed text-[#F2F0EB]/80 sm:text-lg">
            {cta.subtitle}
          </p>

          {submittedEmail ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-8 border border-[#C8FF3D]/40 bg-[#121410] p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8FF3D]">
                ALLOCATION CONFIRMED · {submittedEmail.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-[#F2F0EB]/85">{cta.successMessage}</p>
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86] underline underline-offset-4 hover:text-[#F2F0EB]"
              >
                Register Another Address
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="flex-1">
                  <label htmlFor="drop-email" className="sr-only">
                    Email address for next drop allocation
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
                    className="w-full border-b border-[#F2F0EB]/28 bg-transparent py-3.5 font-mono text-xs tracking-[0.14em] text-[#F2F0EB] placeholder:text-[#8D8B86] focus:border-[#C8FF3D] focus:outline-none sm:text-sm"
                  />
                </div>

                <MagneticButton strength={0.3} className="self-start sm:self-auto">
                  <button
                    type="submit"
                    data-cursor="JOIN"
                    className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#C8FF3D] px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#0A0A0A] transition-colors duration-300 hover:bg-[#F2F0EB]"
                  >
                    <span>{cta.buttonLabel}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </MagneticButton>
              </div>

              {errorMsg ? (
                <p
                  role="alert"
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8FF3D]"
                >
                  {errorMsg}
                </p>
              ) : (
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8D8B86]">
                  LIMITED TO 250 SERIALIZED ALLOCATIONS PER RELEASE · UNSUBSCRIBE ANYTIME
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
