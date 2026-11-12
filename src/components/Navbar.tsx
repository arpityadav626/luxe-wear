'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { assetPath } from '@/lib/assets';
import { brandConfig } from '@/lib/brand.config';
import { useLenis } from '@/hooks/useLenis';
import { useAppState } from './SmoothScrollProvider';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Quiet top header: plain text links, feathered backdrop blur gradient (zero border line),
 * hides on scroll down and returns smoothly on scroll up.
 */
export function Navbar() {
  const {
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

  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);
  const menuCloseBtnRef = useRef<HTMLButtonElement>(null);
  const cartPanelRef = useRef<HTMLElement>(null);
  const cartCloseBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOverlayOpenRef = useRef<'menu' | 'cart' | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScroll.current;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 120);
        lastScroll.current = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const anyOpen = isMenuOpen || isCartOpen;

    if (anyOpen && !wasOverlayOpenRef.current) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    if (!anyOpen) {
      const closedKind = wasOverlayOpenRef.current;
      if (closedKind) {
        wasOverlayOpenRef.current = null;
        const target = previousFocusRef.current;
        previousFocusRef.current = null;
        const fallback = closedKind === 'menu' ? menuTriggerRef.current : cartTriggerRef.current;
        const restoreTarget = target && target.isConnected ? target : fallback;
        if (restoreTarget && restoreTarget.isConnected) {
          requestAnimationFrame(() => restoreTarget.focus());
        }
      }
      return;
    }

    wasOverlayOpenRef.current = isMenuOpen ? 'menu' : 'cart';
    const activeContainerRef = isMenuOpen ? menuPanelRef : cartPanelRef;
    const initialBtnRef = isMenuOpen ? menuCloseBtnRef : cartCloseBtnRef;

    const focusTimer = window.setTimeout(() => {
      initialBtnRef.current?.focus();
    }, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setCartOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const container = activeContainerRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen, isCartOpen, setMenuOpen, setCartOpen]);

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

  const isHeaderHidden = hidden && !isMenuOpen && !isCartOpen;
  const menuLabel = isMenuOpen ? 'Close' : 'Menu';

  return (
    <>
      <header className={`header${isHeaderHidden ? ' header--hidden' : ''}`}>
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#hero');
          }}
          className="header__logo"
        >
          {brandConfig.brand.name}
        </a>

        <nav className="header__nav" aria-label="Primary">
          <button
            ref={menuTriggerRef}
            type="button"
            onClick={() => {
              setCartOpen(false);
              setMenuOpen(!isMenuOpen);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            className="link"
          >
            {menuLabel}
          </button>

          <button
            ref={cartTriggerRef}
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setCartOpen(!isCartOpen);
            }}
            aria-expanded={isCartOpen}
            aria-controls="site-cart"
            className="link tabular-nums"
          >
            Bag ({cartCount})
          </button>
        </nav>
      </header>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            ref={menuPanelRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.98 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex flex-col justify-between bg-[#0B0B0A]/96 text-[#EDE8DF] backdrop-blur-xl"
            style={{
              zIndex: 'var(--z-drawer)',
              padding: '6.5rem var(--gutter) 2.5rem',
            }}
          >
            <div className="flex items-center justify-between border-b border-[#EDE8DF]/12 pb-4">
              <span className="text-[14px] tracking-[0.04em] text-[#8A857B]">
                {brandConfig.brand.tagline}
              </span>
              <button
                ref={menuCloseBtnRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                className="link text-[#EDE8DF]"
              >
                Close
              </button>
            </div>

            <ul className="my-auto flex flex-col divide-y divide-[#EDE8DF]/10 overflow-y-auto py-2">
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
                    className="group flex items-baseline justify-between py-2.5 sm:py-3"
                  >
                    <span className="display text-[clamp(2.35rem,5vw,4.6rem)] leading-[1.06] tracking-[-0.025em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                      {item.label}
                    </span>
                    <span className="text-[14px] tracking-[0.04em] tabular-nums text-[#8A857B] transition-colors group-hover:text-[#EDE8DF]">
                      0{idx + 1}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EDE8DF]/12 pt-5 text-[14px] text-[#8A857B]">
              <span>{brandConfig.brand.name}</span>
              <a
                href={`mailto:${brandConfig.brand.contactEmail}`}
                className="transition-colors hover:text-[#EDE8DF]"
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
              ref={cartPanelRef}
              id="site-cart"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Bag"
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 right-0 top-0 flex w-full max-w-md flex-col justify-between border-l border-[#EDE8DF]/14 bg-[#0B0B0A]/96 p-6 text-[#EDE8DF] backdrop-blur-xl sm:p-8"
              style={{ zIndex: 'calc(var(--z-drawer) + 1)' }}
            >
              <div className="flex items-center justify-between border-b border-[#EDE8DF]/12 pb-5">
                <div>
                  <p className="text-[14px] tracking-[0.04em] text-[#8A857B]">
                    Your bag
                  </p>
                  <h2 className="mt-1 display text-2xl">
                    Selected ({cartCount})
                  </h2>
                </div>
                <button
                  ref={cartCloseBtnRef}
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="link text-[#EDE8DF]"
                >
                  Close
                </button>
              </div>

              <div className="my-6 flex-1 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-start justify-center border border-dashed border-[#EDE8DF]/14 p-6">
                    <p className="text-[14px] tracking-[0.04em] text-[#8A857B]">
                      Empty bag
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#EDE8DF]/82">
                      Select any silhouette in the Capsule section or Archive to add it here.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li
                        key={`${item.id}-${item.size}`}
                        className="flex gap-4 border border-[#EDE8DF]/12 bg-[#121210] p-3.5"
                      >
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#D8D3C9]">
                          <Image
                            src={assetPath(item.image)}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[14px] tracking-[0.04em] text-[#8A857B]">
                                {item.code} · Size {item.size}
                              </span>
                              <h3 className="mt-0.5 text-[15px] font-medium text-[#EDE8DF]">
                                {item.name}
                              </h3>
                            </div>
                            <span className="text-[15px] tabular-nums">
                              ${item.price * item.quantity}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#EDE8DF]/16">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.size, -1)}
                                aria-label="Decrease quantity"
                                className="px-2.5 py-1 text-[14px] hover:bg-[#EDE8DF]/10"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 text-[14px] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.size, 1)}
                                aria-label="Increase quantity"
                                className="px-2.5 py-1 text-[14px] hover:bg-[#EDE8DF]/10"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="text-[14px] text-[#8A857B] hover:text-[#EDE8DF]"
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

              <div className="border-t border-[#EDE8DF]/12 pt-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-[14px] tracking-[0.04em] text-[#8A857B]">
                    Subtotal
                  </span>
                  <span className="display text-2xl tabular-nums">
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
                  className="w-full border border-[#EDE8DF]/30 py-3.5 text-[14px] tracking-[0.04em] text-[#EDE8DF] transition-colors duration-300 hover:bg-[#EDE8DF] hover:text-[#0B0B0A] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {cart.length === 0 ? 'Select a garment' : 'Checkout preview'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
