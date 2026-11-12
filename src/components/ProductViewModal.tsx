'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { GARMENT_SIZES, type CapsuleProduct, type GarmentSize } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import { useAppState } from '@/components/SmoothScrollProvider';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Quiet-luxury product detail modal triggered when clicking any Capsule / Archive image (`data-cursor="View"`).
 * Keeps collection cards pure while still providing sizing + cart addition and keyboard focus trapping.
 */
export function ProductViewModal({
  product,
  onClose,
}: {
  product: CapsuleProduct | null;
  onClose: () => void;
}) {
  const [size, setSize] = useState<GarmentSize>('M');
  const { addToCart } = useAppState();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const addedToCartRef = useRef(false);

  useEffect(() => {
    if (!product) {
      if (!addedToCartRef.current && previousFocusRef.current?.isConnected) {
        const target = previousFocusRef.current;
        previousFocusRef.current = null;
        requestAnimationFrame(() => target.focus());
      }
      addedToCartRef.current = false;
      return;
    }

    addedToCartRef.current = false;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = dialogRef.current;
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

    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  const handleAdd = () => {
    if (!product) return;
    addedToCartRef.current = true;
    addToCart({
      id: product.id,
      code: product.code,
      name: product.name,
      size,
      price: product.price,
      image: product.image,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            style={{ zIndex: 'var(--z-drawer)' }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 border border-[#EDE8DF]/14 bg-[#0B0B0A] p-6 text-[#EDE8DF] sm:p-8"
            style={{ zIndex: 'calc(var(--z-drawer) + 1)' }}
          >
            <div className="mb-5 flex items-center justify-between border-b border-[#EDE8DF]/12 pb-3.5">
              <span className="text-[14px] tracking-[0.04em] text-[#8A857B]">
                {product.category}
              </span>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="link text-[#EDE8DF]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-end">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#D8D3C9] sm:col-span-5">
                <Image
                  src={assetPath(product.image)}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 640px) 84vw, 240px"
                  className="object-contain object-center p-3"
                />
              </div>

              <div className="flex flex-col justify-between gap-6 sm:col-span-7">
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="display text-3xl text-[#EDE8DF]">{product.name}</h3>
                    <span className="display text-2xl tabular-nums text-[#EDE8DF]">
                      ${product.price}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[15px] text-[#8A857B]">{product.material}</p>
                  <p className="mt-4 text-[16px] leading-[1.6] text-[#EDE8DF]/86">
                    {product.specDetail}
                  </p>
                </div>

                <div>
                  <p className="mb-2.5 text-[14px] tracking-[0.04em] text-[#8A857B]">Size</p>
                  <div className="flex gap-2">
                    {GARMENT_SIZES.map((s) => {
                      const active = s === size;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          aria-pressed={active}
                          className={`min-w-[44px] border px-3 py-2 text-[14px] transition-colors duration-300 ${
                            active
                              ? 'border-[#EDE8DF] bg-[#EDE8DF] text-[#0B0B0A]'
                              : 'border-[#EDE8DF]/24 text-[#EDE8DF] hover:border-[#EDE8DF]/60'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full border border-[#EDE8DF]/35 bg-transparent py-3.5 text-[14px] tracking-[0.04em] text-[#EDE8DF] transition-colors duration-300 hover:border-[#EDE8DF] hover:bg-[#EDE8DF] hover:text-[#0B0B0A]"
                >
                  Add to bag
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
