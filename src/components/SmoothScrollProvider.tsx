'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import type { GarmentSize } from '@/lib/brand.config';
import type { ScrollMetrics } from '@/hooks/useLenis';

export interface CartItem {
  id: string;
  code: string;
  name: string;
  size: GarmentSize;
  price: number;
  quantity: number;
  image: string;
}

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  reducedMotion: boolean;
  scrollTo: (target: string | HTMLElement | number) => void;
  stopScroll: () => void;
  startScroll: () => void;
  subscribeScroll: (cb: (metrics: ScrollMetrics) => void) => () => void;
}

interface AppStateContextValue {
  isPreloaded: boolean;
  markPreloaded: () => void;
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, size: GarmentSize, delta: number) => void;
  removeFromCart: (id: string, size: GarmentSize) => void;
  clearCart: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);
const AppStateContext = createContext<AppStateContextValue | null>(null);

function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

export function useSmoothScrollContext() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    throw new Error('useSmoothScrollContext must be used inside SmoothScrollProvider');
  }
  return ctx;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside SmoothScrollProvider');
  }
  return ctx;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => prefersReducedMotion(),
    () => false
  );

  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [isPreloaded, setIsPreloaded] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const pathname = usePathname();

  const lenisRef = useRef<Lenis | null>(null);
  const subscribersRef = useRef<Set<(metrics: ScrollMetrics) => void>>(new Set());

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const timer = window.setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.resize();
        if (hash) {
          lenisRef.current.scrollTo(hash, { immediate: false, duration: 1.1 });
        } else {
          lenisRef.current.scrollTo(0, { immediate: true });
        }
      } else if (!hash) {
        window.scrollTo(0, 0);
      }
      ScrollTrigger.refresh();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const publishMetrics = useCallback((metrics: ScrollMetrics) => {
    subscribersRef.current.forEach((cb) => cb(metrics));
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const onNativeScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        publishMetrics({
          y: window.scrollY,
          progress: max > 0 ? window.scrollY / max : 0,
          velocity: 0,
        });
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      return () => window.removeEventListener('scroll', onNativeScroll);
    }

    // lerp 0.08 = heavier, measured quiet-luxury scroll inertia
    const instance = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    lenisRef.current = instance;

    const rafId = requestAnimationFrame(() => {
      setLenis(instance);
    });

    instance.on('scroll', (l: Lenis) => {
      ScrollTrigger.update();
      publishMetrics({
        y: l.scroll,
        progress: l.limit > 0 ? l.scroll / l.limit : 0,
        velocity: l.velocity,
      });
    });

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(onTick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [publishMetrics, reducedMotion]);

  useEffect(() => {
    const instance = lenisRef.current;
    if (!instance) return;
    if (!isPreloaded || isMenuOpen || isCartOpen) {
      instance.stop();
    } else {
      instance.start();
    }
  }, [isPreloaded, isMenuOpen, isCartOpen]);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number) => {
      const instance = lenisRef.current;
      if (instance) {
        instance.scrollTo(target, {
          duration: 1.25,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target });
      } else {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    },
    [reducedMotion]
  );

  const stopScroll = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const startScroll = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const subscribeScroll = useCallback((cb: (metrics: ScrollMetrics) => void) => {
    subscribersRef.current.add(cb);
    return () => {
      subscribersRef.current.delete(cb);
    };
  }, []);

  const markPreloaded = useCallback(() => {
    setIsPreloaded(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id && p.size === item.size);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id && p.size === item.size
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, size: GarmentSize, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id && p.size === size
            ? { ...p, quantity: Math.max(0, p.quantity + delta) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string, size: GarmentSize) => {
    setCart((prev) => prev.filter((p) => !(p.id === id && p.size === size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const smoothValue = useMemo<SmoothScrollContextValue>(
    () => ({
      lenis,
      reducedMotion,
      scrollTo,
      stopScroll,
      startScroll,
      subscribeScroll,
    }),
    [lenis, reducedMotion, scrollTo, stopScroll, startScroll, subscribeScroll]
  );

  const appValue = useMemo<AppStateContextValue>(
    () => ({
      isPreloaded,
      markPreloaded,
      isMenuOpen,
      setMenuOpen,
      isCartOpen,
      setCartOpen,
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      isPreloaded,
      markPreloaded,
      isMenuOpen,
      isCartOpen,
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollContext.Provider value={smoothValue}>
        <AppStateContext.Provider value={appValue}>{children}</AppStateContext.Provider>
      </SmoothScrollContext.Provider>
    </MotionConfig>
  );
}
