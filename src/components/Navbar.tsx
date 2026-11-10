'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { useLenis } from '@/hooks/useLenis';
import { MagneticButton } from './MagneticButton';
import { useAppState } from './SmoothScrollProvider';
import Image from 'next/image';

function subscribeWindowScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

/**
 * Minimal Top Nav: Logo left, Menu + Cart right.
 * Includes full-screen Framer Motion Menu Overlay & slide-over Bag Drawer.
 */
export function Navbar() {
  const {
    isPreloaded,
    isMenuOpen,
    setMenuOpen,
    isCartOpen,
    setCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useAppState();
  const { scrollTo } = useLenis();
  const isScrolled = useSyncExternalStore(
    subscribeWindowScroll,
    () => window.scrollY > 40,
    () => false
  );

  // Escape closes drawers cleanly
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setCartOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setMenuOpen, setCartOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      window.setTimeout(() => scrollTo(href), 220);
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={isPreloaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 flex items-center justify-between transition-colors duration-300 ${
          isScrolled
            ? 'border-b border-[#F2F0EB]/10 bg-[#0A0A0A]/94 backdrop-blur-md'
            : 'bg-transparent'
        }`}
        style={{
          zIndex: 'var(--z-nav)',
          padding: isScrolled ? '1rem var(--gutter)' : '1.35rem var(--gutter)',
        }}
      >
        {/* Logo left */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#hero');
          }}
          data-cursor="HOME"
          className="group inline-flex items-center gap-2.5 text-[#F2F0EB]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[#C8FF3D] transition-transform duration-300 group-hover:scale-125"
          />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.14em] sm:text-base">
            {siteConfig.brand.name}
          </span>
        </a>

        {/* Menu + Cart right */}
        <div className="flex items-center gap-3 sm:gap-5">
          <MagneticButton strength={0.22}>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setMenuOpen(!isMenuOpen);
              }}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              data-cursor={isMenuOpen ? 'CLOSE' : 'MENU'}
              className="group rounded-full border border-[#F2F0EB]/14 bg-[#0A0A0A]/55 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F2F0EB] backdrop-blur-md transition-colors duration-300 hover:border-[#C8FF3D]/60"
            >
              <span className="nav-roll">
                <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
                <span aria-hidden="true">{isMenuOpen ? 'Close' : 'Menu'}</span>
              </span>
            </button>
          </MagneticButton>

          <MagneticButton strength={0.22}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(!isCartOpen);
              }}
              aria-expanded={isCartOpen}
              aria-controls="site-cart"
              data-cursor="BAG"
              className="group inline-flex items-center gap-2 rounded-full border border-[#F2F0EB]/14 bg-[#0A0A0A]/55 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F2F0EB] backdrop-blur-md transition-colors duration-300 hover:border-[#C8FF3D]"
            >
              <span className="nav-roll">
                <span>Cart</span>
                <span aria-hidden="true">Cart</span>
              </span>
              <span className="tabular-nums text-[#C8FF3D]">({cartCount})</span>
            </button>
          </MagneticButton>
        </div>
      </motion.header>

      {/* Full-screen Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="site-menu"
            aria-label="Primary navigation"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.98 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.98 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex flex-col justify-between bg-[#0A0A0A]/96 text-[#F2F0EB] backdrop-blur-xl"
            style={{
              zIndex: 'var(--z-drawer)',
              padding: '6.5rem var(--gutter) 2.5rem',
            }}
          >
            <div className="flex items-center justify-between border-b border-[#F2F0EB]/12 pb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8D8B86]">
                NAVIGATION ARCHITECTURE
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                data-cursor="CLOSE"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8FF3D] hover:underline"
              >
                ESC / CLOSE
              </button>
            </div>

            <ul className="my-auto flex flex-col divide-y divide-[#F2F0EB]/10">
              {siteConfig.nav.links.map((item, idx) => (
                <motion.li
                  key={item.index}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.14 + idx * 0.055,
                    duration: 0.75,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('#')) e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    data-cursor={item.status === 'live' ? 'VIEW' : 'NEXT'}
                    className="group flex items-baseline justify-between py-4 sm:py-5"
                  >
                    <div className="flex items-baseline gap-4 sm:gap-8">
                      <span className="font-mono text-xs text-[#8D8B86] transition-colors group-hover:text-[#C8FF3D]">
                        {item.index}
                      </span>
                      <span className="font-display text-[clamp(1.75rem,4.4vw,4rem)] font-medium uppercase tracking-[-0.03em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                        item.status === 'live' ? 'text-[#C8FF3D]' : 'text-[#8D8B86]'
                      }`}
                    >
                      {item.status === 'live' ? 'LIVE' : 'STAGE 04'}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F2F0EB]/12 pt-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86]">
                {siteConfig.brand.tagline}
              </span>
              <div className="flex items-center gap-6">
                {siteConfig.nav.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                    onClick={(e) => {
                      if (s.href.startsWith('#')) {
                        e.preventDefault();
                        handleNavClick(s.href);
                      }
                    }}
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#F2F0EB]/80 transition-colors hover:text-[#C8FF3D]"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              style={{ zIndex: 'var(--z-drawer)' }}
            />

            <motion.aside
              id="site-cart"
              aria-label="Shopping Bag"
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 right-0 top-0 flex w-full max-w-md flex-col justify-between border-l border-[#F2F0EB]/14 bg-[#0A0A0A]/94 p-6 text-[#F2F0EB] backdrop-blur-xl sm:p-8"
              style={{ zIndex: 'calc(var(--z-drawer) + 1)' }}
            >
              <div className="flex items-center justify-between border-b border-[#F2F0EB]/12 pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8FF3D]">
                    BAG / {siteConfig.brand.season}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-medium uppercase tracking-[-0.02em]">
                    Selected Pieces ({cartCount})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  data-cursor="CLOSE"
                  className="rounded-full border border-[#F2F0EB]/18 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-[#C8FF3D] hover:text-[#C8FF3D]"
                >
                  Close
                </button>
              </div>

              <div className="my-6 flex-1 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-start justify-center border border-dashed border-[#F2F0EB]/14 p-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8D8B86]">
                      BAG IS EMPTY
                    </p>
                    <p className="mt-2 text-sm text-[#F2F0EB]/80">
                      Inspect the {siteConfig.heroGarment.code} {siteConfig.heroGarment.name} in the
                      Hero Stage and select your size to reserve.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li
                        key={`${item.id}-${item.size}`}
                        className="flex gap-4 border border-[#F2F0EB]/12 bg-[#121212] p-3.5"
                      >
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#0A0A0A]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8FF3D]">
                                {item.code} · SIZE {item.size}
                              </span>
                              <h3 className="mt-0.5 text-sm font-medium text-[#F2F0EB]">
                                {item.name}
                              </h3>
                            </div>
                            <span className="font-mono text-xs tabular-nums">
                              ${item.price * item.quantity}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#F2F0EB]/16">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.size, -1)}
                                aria-label="Decrease quantity"
                                className="px-2.5 py-1 font-mono text-xs hover:bg-[#F2F0EB]/10"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 font-mono text-xs tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.size, 1)}
                                aria-label="Increase quantity"
                                className="px-2.5 py-1 font-mono text-xs hover:bg-[#F2F0EB]/10"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8D8B86] hover:text-[#F2F0EB]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-[#F2F0EB]/12 pt-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8D8B86]">
                    SUBTOTAL
                  </span>
                  <span className="font-display text-2xl font-medium tabular-nums">
                    ${cartSubtotal}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => {
                    clearCart();
                    setCartOpen(false);
                  }}
                  data-cursor="RESERVE"
                  className="w-full bg-[#C8FF3D] py-3.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {cart.length === 0 ? 'Select a Garment First' : 'Reserve Drop 01 (Preview)'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
