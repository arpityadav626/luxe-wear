'use client';

import React, {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { brandConfig } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';

interface HeroGarmentCanvasProps {
  scrollProgressRef: MutableRefObject<number>;
  reducedMotion?: boolean;
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
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
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
  const spinGroupRef = useRef<THREE.Group>(null);
  const breathRef = useRef<number>(0);

  const normalizedModel = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.08 / maxDim;

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = false;
      child.receiveShadow = false;

      const srcMat = child.material as THREE.MeshStandardMaterial | undefined;
      if (srcMat && srcMat.isMeshStandardMaterial) {
        const clothMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#FFFFFF'),
          map: srcMat.map ?? null,
          normalMap: srcMat.normalMap ?? null,
          normalScale: new THREE.Vector2(0.9, 0.9),
          roughnessMap: srcMat.roughnessMap ?? null,
          metalnessMap: srcMat.metalnessMap ?? null,
          roughness: 0.88,
          metalness: 0.0,
          specularIntensity: 0.22,
          sheen: 0.34,
          sheenRoughness: 0.82,
          sheenColor: new THREE.Color('#6F737C'),
          envMapIntensity: 0.52,
          side: THREE.DoubleSide,
        });
        child.material = clothMat;
      }
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => onReady());
    return () => {
      cancelAnimationFrame(rafId);
      normalizedModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => m.dispose());
        }
      });
    };
  }, [normalizedModel, onReady]);

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
    <group ref={spinGroupRef} rotation={[0.04, 0.22, 0]}>
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

function supportsWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const testCanvas = document.createElement('canvas');
    return Boolean(
      testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

export function HeroGarmentCanvas({
  scrollProgressRef,
  reducedMotion = false,
}: HeroGarmentCanvasProps) {
  const modelUrl = assetPath(brandConfig.hero.modelPath);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [modelReady, setModelReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(() => !supportsWebGL());

  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

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
    <WebGLErrorBoundary fallback={<HeroFallbackPoster />}>
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
          <ambientLight intensity={0.34} />
          <directionalLight position={[2.4, 2.8, 3.6]} intensity={2.75} color="#F5F3EE" />
          <directionalLight position={[-3.6, 2.0, -2.4]} intensity={2.25} color="#EAECEF" />
          <directionalLight position={[3.5, 1.4, -2.4]} intensity={1.75} color="#F0EEE9" />
          <directionalLight position={[-0.6, -1.8, 2.8]} intensity={0.68} color="#DCDAD4" />

          <Environment resolution={128}>
            <Lightformer
              form="rect"
              intensity={1.1}
              color="#F5F3EE"
              scale={[6, 2, 1]}
              position={[0, 4, 2]}
              rotation={[Math.PI / 2.4, 0, 0]}
            />
            <Lightformer
              form="rect"
              intensity={1.3}
              color="#E8EAEE"
              scale={[3, 6, 1]}
              position={[-4, 1, -2]}
              rotation={[0, Math.PI / 3, 0]}
            />
            <Lightformer
              form="rect"
              intensity={1.0}
              color="#EFECE6"
              scale={[3, 5, 1]}
              position={[4, 0.5, -2]}
              rotation={[0, -Math.PI / 3, 0]}
            />
          </Environment>

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
    </WebGLErrorBoundary>
  );
}
