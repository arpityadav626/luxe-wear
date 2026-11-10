'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { useLenis } from '@/hooks/useLenis';
import { MagneticButton } from './MagneticButton';
import { useAppState } from './SmoothScrollProvider';

function subscribeWindowScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

/**
 * Minimal Top Nav: Brand wordmark left, Menu + Cart right.
 * Zero duplicate DOM text inside .nav-roll buttons (CSS ::after renders hover roll).
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
  const pathname = usePathname();
  const router = useRouter();
  const isScrolled = useSyncExternalStore(
    subscribeWindowScroll,
    () => window.scrollY > 40,
    () => false
  );

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
      if (pathname !== '/') {
        router.push(`/${href}`);
        return;
      }
      window.setTimeout(() => scrollTo(href), 220);
      return;
    }
    if (href.startsWith('/')) {
      router.push(href);
    }
  };

  const menuLabel = isMenuOpen ? 'Close' : 'Menu';

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={isPreloaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 flex items-center justify-between bg-transparent transition-all duration-300"
        style={{
          zIndex: 'var(--z-nav)',
          padding: isScrolled ? '0.95rem var(--gutter)' : '1.25rem var(--gutter)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#hero');
          }}
          data-cursor="HOME"
          className="font-display text-base font-semibold uppercase tracking-[0.14em] [word-spacing:0.18em] text-[#F2F0EB] transition-opacity duration-300 hover:opacity-80 sm:text-lg"
        >
          {brandConfig.brand.name}
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <MagneticButton strength={0.2}>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setMenuOpen(!isMenuOpen);
              }}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              data-cursor={isMenuOpen ? 'CLOSE' : 'MENU'}
              className="group rounded-full border border-[#F2F0EB]/20 bg-[#0A0A0A]/45 px-4 py-2 text-[13px] font-medium uppercase tracking-[0.1em] text-[#F2F0EB] backdrop-blur-md transition-colors duration-300 hover:border-[#F2F0EB]/55 sm:text-sm"
            >
              <span className="nav-roll" data-label={menuLabel}>
                <span>{menuLabel}</span>
              </span>
            </button>
          </MagneticButton>

          <MagneticButton strength={0.2}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(!isCartOpen);
              }}
              aria-expanded={isCartOpen}
              aria-controls="site-cart"
              data-cursor="BAG"
              className="group inline-flex items-center gap-2 rounded-full border border-[#F2F0EB]/20 bg-[#0A0A0A]/45 px-4 py-2 text-[13px] font-medium uppercase tracking-[0.1em] text-[#F2F0EB] backdrop-blur-md transition-colors duration-300 hover:border-[#F2F0EB]/55 sm:text-sm"
            >
              <span className="nav-roll" data-label="Bag">
                <span>Bag</span>
              </span>
              <span className="tabular-nums text-[#9A9790]">({cartCount})</span>
            </button>
          </MagneticButton>
        </div>
      </motion.header>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="site-menu"
            aria-label="Primary navigation"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.98 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex flex-col justify-between bg-[#0A0A0A]/96 text-[#F2F0EB] backdrop-blur-xl"
            style={{
              zIndex: 'var(--z-drawer)',
              padding: '6.5rem var(--gutter) 2.5rem',
            }}
          >
            <div className="flex items-center justify-between border-b border-[#F2F0EB]/12 pb-4">
              <span className="text-[13px] uppercase tracking-[0.16em] text-[#9A9790]">
                {brandConfig.brand.tagline}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                data-cursor="CLOSE"
                className="text-[13px] uppercase tracking-[0.14em] text-[#F2F0EB] hover:opacity-75"
              >
                Close
              </button>
            </div>

            <ul className="my-auto flex flex-col divide-y divide-[#F2F0EB]/10 overflow-y-auto py-2">
              {brandConfig.nav.links.map((item, idx) => (
                <motion.li
                  key={item.href}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.12 + idx * 0.045,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('#') || item.href.startsWith('/')) e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    data-cursor="VIEW"
                    className="group flex items-baseline justify-between py-3 sm:py-4"
                  >
                    <span className="font-display text-[clamp(1.5rem,3.6vw,3.1rem)] font-medium uppercase tracking-[-0.015em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                      {item.label}
                    </span>
                    <span className="text-[13px] uppercase tracking-[0.14em] text-[#9A9790] transition-colors group-hover:text-[#F2F0EB]">
                      0{idx + 1}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F2F0EB]/12 pt-5 text-[13px] uppercase tracking-[0.14em] text-[#9A9790]">
              <span>{brandConfig.brand.name}</span>
              <a
                href={`mailto:${brandConfig.brand.contactEmail}`}
                className="transition-colors hover:text-[#F2F0EB]"
              >
                {brandConfig.brand.contactEmail}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Slide-over Bag Drawer */}
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
              className="fixed bottom-0 right-0 top-0 flex w-full max-w-md flex-col justify-between border-l border-[#F2F0EB]/14 bg-[#0A0A0A]/96 p-6 text-[#F2F0EB] backdrop-blur-xl sm:p-8"
              style={{ zIndex: 'calc(var(--z-drawer) + 1)' }}
            >
              <div className="flex items-center justify-between border-b border-[#F2F0EB]/12 pb-5">
                <div>
                  <p className="text-[13px] uppercase tracking-[0.16em] text-[#9A9790]">
                    Your Bag
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-medium uppercase tracking-[-0.015em]">
                    Selected ({cartCount})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  data-cursor="CLOSE"
                  className="rounded-full border border-[#F2F0EB]/18 px-3.5 py-1.5 text-[13px] uppercase tracking-[0.12em] transition-colors hover:border-[#F2F0EB] hover:text-[#F2F0EB]"
                >
                  Close
                </button>
              </div>

              <div className="my-6 flex-1 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-start justify-center border border-dashed border-[#F2F0EB]/14 p-6">
                    <p className="text-[12px] uppercase tracking-[0.1em] text-[#9A9790]">
                      Empty Bag
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#F2F0EB]/82">
                      Select any silhouette in the Capsule section or Archive to add it here.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li
                        key={`${item.id}-${item.size}`}
                        className="flex gap-4 border border-[#F2F0EB]/12 bg-[#121212] p-3.5"
                      >
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#0F0F0F]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover mix-blend-lighten"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A9790]">
                                {item.code} · Size {item.size}
                              </span>
                              <h3 className="mt-0.5 text-[15px] font-medium text-[#F2F0EB]">
                                {item.name}
                              </h3>
                            </div>
                            <span className="text-[15px] tabular-nums">
                              ${item.price * item.quantity}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#F2F0EB]/16">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.size, -1)}
                                aria-label="Decrease quantity"
                                className="px-2.5 py-1 text-[13px] hover:bg-[#F2F0EB]/10"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 text-[13px] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.size, 1)}
                                aria-label="Increase quantity"
                                className="px-2.5 py-1 text-[13px] hover:bg-[#F2F0EB]/10"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="text-[13px] uppercase tracking-[0.12em] text-[#9A9790] hover:text-[#F2F0EB]"
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
                  <span className="text-[13px] uppercase tracking-[0.14em] text-[#9A9790]">
                    Subtotal
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
                  className="w-full bg-[#F2F0EB] py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-[#0A0A0A] transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {cart.length === 0 ? 'Select a Garment' : 'Checkout Preview'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
