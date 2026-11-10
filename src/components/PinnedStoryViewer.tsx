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

const PinnedStoryCanvas = dynamic(() => import('./PinnedStoryCanvas'), {
  ssr: false,
});

interface PinnedStoryViewerProps {
  storyProgressRef: MutableRefObject<number>;
  activeChapter: number;
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
 * Lazy-loaded Stage 2 macro inspection 3D viewport with IntersectionObserver
 * pause and studio macro zoom image fallback.
 */
export function PinnedStoryViewer({ storyProgressRef, activeChapter }: PinnedStoryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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

  // Different macro crop positions for static/reduced-motion fallback per chapter
  const cropTransforms = [
    'scale(1.45) translateY(16%)',
    'scale(1.65) translateY(8%)',
    'scale(1.5) translate(-6%, -12%)',
    'scale(1.85) translate(-8%, 4%)',
  ];

  const staticFallback = (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative h-[82%] w-[82%] max-w-[480px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: cropTransforms[activeChapter] ?? cropTransforms[0] }}
      >
        <Image
          src={assetPath(siteConfig.heroGarment.fallbackImage)}
          alt={siteConfig.heroGarment.fallbackAlt}
          fill
          sizes="(max-width: 768px) 85vw, 480px"
          className="object-contain"
        />
      </div>
    </div>
  );

  if (!mounted || !canRender3D || reduced) {
    return staticFallback;
  }

  return (
    <WebGLErrorBoundary fallback={staticFallback}>
      <div ref={containerRef} className="h-full w-full" data-cursor="INSPECT">
        <PinnedStoryCanvas storyProgressRef={storyProgressRef} active={inView} />
      </div>
    </WebGLErrorBoundary>
  );
}
