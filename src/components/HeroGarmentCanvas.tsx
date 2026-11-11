'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import {
  disposeGarmentMaterials,
  GarmentStudioLighting,
  GarmentWebGLErrorBoundary,
  prepareDetailedGarment,
  supportsWebGL,
} from '@/components/GarmentStageRig';

interface HeroGarmentCanvasProps {
  scrollProgressRef: MutableRefObject<number>;
  reducedMotion?: boolean;
}

function ObsidianGarmentMesh({
  modelUrl,
  scrollProgressRef,
  reducedMotion,
  onReady,
}: {
  modelUrl: string;
  scrollProgressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  onReady: () => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const threeScene = useThree((s) => s.scene);
  const spinGroupRef = useRef<THREE.Group>(null);
  const breathRef = useRef<number>(0);
  const [shaderReady, setShaderReady] = useState(false);

  const normalizedModel = useMemo(
    () => prepareDetailedGarment(scene, { enableEnvironment: false }),
    [scene]
  );

  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(normalizedModel, camera, threeScene)
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        setShaderReady(true);
        onReady();
      });

    return () => {
      cancelled = true;
      disposeGarmentMaterials(normalizedModel);
    };
  }, [gl, camera, threeScene, normalizedModel, onReady]);

  useFrame((_, rawDelta) => {
    const group = spinGroupRef.current;
    if (!group) return;

    const delta = Math.min(rawDelta, 0.05);
    const p = Math.min(Math.max(scrollProgressRef.current, 0), 1);

    if (reducedMotion) {
      group.rotation.y = 0.24;
      group.position.y = 0;
      group.scale.setScalar(1);
      return;
    }

    breathRef.current += delta;
    const idleSway = Math.sin(breathRef.current * 0.55) * 0.12;
    const targetRotY = 0.22 + idleSway + p * Math.PI * 0.9;
    const targetPosY = Math.sin(breathRef.current * 1.15) * 0.022 - p * 0.04;
    const targetScale = 1 + p * 0.05;

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotY, 5.5, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, targetPosY, 5.5, delta);
    const nextScale = THREE.MathUtils.damp(group.scale.x, targetScale, 5.5, delta);
    group.scale.setScalar(nextScale);
  });

  return (
    <group ref={spinGroupRef} visible={shaderReady} rotation={[0.04, 0.22, 0]}>
      <primitive object={normalizedModel} />
    </group>
  );
}

function HeroFallbackPoster() {
  return (
    <div className="relative h-full w-full opacity-90 [-webkit-mask-image:radial-gradient(ellipse_90%_95%_at_50%_50%,#000_82%,transparent_100%)] [mask-image:radial-gradient(ellipse_90%_95%_at_50%_50%,#000_82%,transparent_100%)]">
      <Image
        src={assetPath(brandConfig.sequence.heroImage)}
        alt={brandConfig.sequence.heroAlt}
        fill
        priority
        sizes="(max-width: 768px) 92vw, 760px"
        className="object-contain object-center select-none"
      />
    </div>
  );
}

export function HeroGarmentCanvas({
  scrollProgressRef,
  reducedMotion = false,
}: HeroGarmentCanvasProps) {
  const modelUrl = assetPath(brandConfig.hero.modelPath);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [modelReady, setModelReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [webglFailed, setWebglFailed] = useState(() => !supportsWebGL());

  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.isIntersecting);
      },
      { rootMargin: '250px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const canvasEl = stageWrapRef.current?.querySelector('canvas');
      if (canvasEl) {
        canvasEl.style.setProperty('touch-action', 'pan-y', 'important');
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [modelReady]);

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  if (webglFailed) {
    return <HeroFallbackPoster />;
  }

  return (
    <GarmentWebGLErrorBoundary fallback={<HeroFallbackPoster />}>
      <div
        ref={stageWrapRef}
        role="img"
        data-cursor="DRAG"
        aria-label={`Interactive 3D model of ${brandConfig.hero.title}. Drag to rotate 360 degrees.`}
        className={`relative h-full w-full cursor-grab active:cursor-grabbing transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [&_canvas]:!touch-pan-y ${
          modelReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <Canvas
          fallback={<HeroFallbackPoster />}
          frameloop={inView ? 'always' : 'demand'}
          dpr={[1, 2]}
          camera={{ position: [0, 0.02, 4.35], fov: 34, near: 0.1, far: 50 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.14,
          }}
          style={{ background: 'transparent', touchAction: 'pan-y' }}
          onCreated={({ gl }) => {
            gl.debug.checkShaderErrors = false;
            gl.setClearColor(0x000000, 0);
            gl.domElement.addEventListener(
              'webglcontextlost',
              (event) => {
                event.preventDefault();
                setWebglFailed(true);
              },
              { once: true }
            );
          }}
        >
          <GarmentStudioLighting enableEnvironment={false} />

          <Suspense fallback={null}>
            <ObsidianGarmentMesh
              modelUrl={modelUrl}
              scrollProgressRef={scrollProgressRef}
              reducedMotion={reducedMotion}
              onReady={handleModelReady}
            />
          </Suspense>

          <OrbitControls
            makeDefault
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.075}
            rotateSpeed={0.85}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
          />
        </Canvas>
      </div>
    </GarmentWebGLErrorBoundary>
  );
}
