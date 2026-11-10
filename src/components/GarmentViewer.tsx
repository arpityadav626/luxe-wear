'use client';

import React, {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { prefersReducedMotion } from '@/lib/gsap';
import { assetPath } from '@/lib/assets';

const GarmentCanvas = dynamic(() => import('./GarmentCanvas'), {
  ssr: false,
});

interface GarmentViewerProps {
  heroProgressRef: MutableRefObject<number>;
}

class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const emptySubscribe = () => () => {};

function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

let cachedWebGLSupport: boolean | null = null;
function canUseWebGL(): boolean {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) {
      cachedWebGLSupport = false;
      return false;
    }
    const canvas = document.createElement('canvas');
    cachedWebGLSupport = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
    return cachedWebGLSupport;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

/**
 * Lazy-loaded 3D viewport with IntersectionObserver frameloop pausing
 * and automatic static studio photograph fallback.
 */
export function GarmentViewer({ heroProgressRef }: GarmentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => prefersReducedMotion(),
    () => false
  );
  const canRender3D = useSyncExternalStore(emptySubscribe, canUseWebGL, () => false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '250px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const staticFallback = (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative h-[74%] w-[78%] max-w-[480px]">
        <Image
          src={assetPath(siteConfig.heroGarment.fallbackImage)}
          alt={siteConfig.heroGarment.fallbackAlt}
          fill
          priority
          sizes="(max-width: 768px) 85vw, 480px"
          className="object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.85)]"
        />
      </div>
    </div>
  );

  if (!mounted || !canRender3D || reduced) {
    return staticFallback;
  }

  return (
    <WebGLErrorBoundary fallback={staticFallback}>
      <div ref={containerRef} className="h-full w-full" data-cursor="DRAG">
        <GarmentCanvas
          heroProgressRef={heroProgressRef}
          reducedMotion={reduced}
          active={inView}
        />
      </div>
    </WebGLErrorBoundary>
  );
}
