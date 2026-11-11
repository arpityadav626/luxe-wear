'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type MutableRefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { brandConfig } from '@/lib/brand.config';
import { assetPath } from '@/lib/assets';
import { SequenceCanvas } from '@/components/SequenceCanvas';
import {
  disposeGarmentMaterials,
  GarmentStudioLighting,
  GarmentWebGLErrorBoundary,
  prepareDetailedGarment,
  supportsWebGL,
} from '@/components/GarmentStageRig';

interface StageCameraPreset {
  cam: readonly [number, number, number];
  target: readonly [number, number, number];
}

/**
 * Macro camera & target presets aligned with `brandConfig.storyStages`:
 * 0: Collar (ribbed neckband + inner woven LUXE WEAR neck label + top collar snap)
 * 1: Closure (concealed storm placket + magnetic snap + slotted clasp + chest welt)
 * 2: Stitching (rear upper spine seam tape + shoulder taping + #C8FF3D bar-tack)
 * 3: Weave (raking side-chest 2/2 diagonal twill micro-normal + fold depth + welt corner rivet)
 */
const STAGE_CAMERA_KEYFRAMES: readonly StageCameraPreset[] = [
  { cam: [0.28, 1.24, 1.38], target: [0.0, 0.79, -0.08] },
  { cam: [-0.46, 0.50, 1.48], target: [0.06, 0.50, 0.22] },
  { cam: [0.34, 1.04, -1.24], target: [0.0, 0.83, -0.26] },
  { cam: [0.92, 0.36, 1.22], target: [0.14, 0.28, 0.14] },
];

interface GarmentDetailsCanvasProps {
  activeStage: number;
  progressRef: MutableRefObject<number>;
  fallbackProgress: number;
  reducedMotion?: boolean;
}

function DetailedStageActor({
  modelUrl,
  activeStage,
  reducedMotion,
  controlsRef,
  userControlledRef,
  onReady,
}: {
  modelUrl: string;
  activeStage: number;
  reducedMotion: boolean;
  controlsRef: React.RefObject<ComponentRef<typeof OrbitControls> | null>;
  userControlledRef: MutableRefObject<boolean>;
  onReady: () => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const threeScene = useThree((s) => s.scene);
  const floatGroupRef = useRef<THREE.Group>(null);
  const clockAccumRef = useRef<number>(0);
  const [shaderReady, setShaderReady] = useState(false);

  const curTargetRef = useRef(new THREE.Vector3(...STAGE_CAMERA_KEYFRAMES[0].target));
  const goalTargetRef = useRef(new THREE.Vector3(...STAGE_CAMERA_KEYFRAMES[0].target));
  const goalCamRef = useRef(new THREE.Vector3(...STAGE_CAMERA_KEYFRAMES[0].cam));
  const scratchOffsetRef = useRef(new THREE.Vector3());
  const curSphRef = useRef(new THREE.Spherical());
  const goalSphRef = useRef(new THREE.Spherical());

  const normalizedModel = useMemo(() => prepareDetailedGarment(scene), [scene]);

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

  useEffect(() => {
    const preset = STAGE_CAMERA_KEYFRAMES[activeStage] ?? STAGE_CAMERA_KEYFRAMES[0];
    goalCamRef.current.set(preset.cam[0], preset.cam[1], preset.cam[2]);
    goalTargetRef.current.set(preset.target[0], preset.target[1], preset.target[2]);
    userControlledRef.current = false;
  }, [activeStage, userControlledRef]);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const controls = controlsRef.current;

    if (floatGroupRef.current) {
      if (reducedMotion) {
        floatGroupRef.current.position.y = 0;
        floatGroupRef.current.rotation.y = 0;
      } else {
        clockAccumRef.current += delta;
        floatGroupRef.current.position.y = Math.sin(clockAccumRef.current * 0.9) * 0.008;
        floatGroupRef.current.rotation.y = userControlledRef.current
          ? THREE.MathUtils.damp(floatGroupRef.current.rotation.y, 0, 5.0, delta)
          : Math.sin(clockAccumRef.current * 0.5) * 0.022;
      }
    }

    if (!controls || userControlledRef.current) return;

    if (reducedMotion) {
      camera.position.copy(goalCamRef.current);
      controls.target.copy(goalTargetRef.current);
      curTargetRef.current.copy(goalTargetRef.current);
      controls.update();
      return;
    }

    const dampLambda = 4.4;

    // 1. Smoothly damp look-at focus point
    curTargetRef.current.copy(controls.target);
    curTargetRef.current.x = THREE.MathUtils.damp(curTargetRef.current.x, goalTargetRef.current.x, dampLambda, delta);
    curTargetRef.current.y = THREE.MathUtils.damp(curTargetRef.current.y, goalTargetRef.current.y, dampLambda, delta);
    curTargetRef.current.z = THREE.MathUtils.damp(curTargetRef.current.z, goalTargetRef.current.z, dampLambda, delta);

    // 2. Spherical damped camera orbit around target so transitions glide around shoulders without intersecting mesh
    scratchOffsetRef.current.copy(camera.position).sub(controls.target);
    curSphRef.current.setFromVector3(scratchOffsetRef.current);

    scratchOffsetRef.current.copy(goalCamRef.current).sub(goalTargetRef.current);
    goalSphRef.current.setFromVector3(scratchOffsetRef.current);

    const nextR = THREE.MathUtils.damp(curSphRef.current.radius, goalSphRef.current.radius, dampLambda, delta);
    const nextPhi = THREE.MathUtils.damp(curSphRef.current.phi, goalSphRef.current.phi, dampLambda, delta);

    let dTheta = goalSphRef.current.theta - curSphRef.current.theta;
    while (dTheta > Math.PI) dTheta -= Math.PI * 2;
    while (dTheta < -Math.PI) dTheta += Math.PI * 2;
    const nextTheta = THREE.MathUtils.damp(
      curSphRef.current.theta,
      curSphRef.current.theta + dTheta,
      dampLambda,
      delta
    );

    curSphRef.current.set(nextR, nextPhi, nextTheta);
    scratchOffsetRef.current.setFromSpherical(curSphRef.current).add(curTargetRef.current);

    camera.position.copy(scratchOffsetRef.current);
    controls.target.copy(curTargetRef.current);
    controls.update();
  });

  return (
    <group ref={floatGroupRef} visible={shaderReady}>
      <primitive object={normalizedModel} />
    </group>
  );
}

export function GarmentDetailsCanvas({
  activeStage,
  progressRef,
  fallbackProgress,
  reducedMotion = false,
}: GarmentDetailsCanvasProps) {
  const modelUrl = assetPath(brandConfig.hero.modelPath);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const userControlledRef = useRef<boolean>(false);

  const [modelReady, setModelReady] = useState(false);
  const [hasEnteredNearView, setHasEnteredNearView] = useState(false);
  const [inView, setInView] = useState(false);
  const [webglFailed, setWebglFailed] = useState(() => !supportsWebGL());

  const currentStageInfo = brandConfig.storyStages[activeStage] ?? brandConfig.storyStages[0];

  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      const rafId = requestAnimationFrame(() => {
        setHasEnteredNearView(true);
        setInView(true);
      });
      return () => cancelAnimationFrame(rafId);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredNearView(true);
        }
      },
      { rootMargin: '450px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEnteredNearView) return;
    const rafId = requestAnimationFrame(() => {
      const canvasEl = stageWrapRef.current?.querySelector('canvas');
      if (canvasEl) {
        canvasEl.style.setProperty('touch-action', 'pan-y', 'important');
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [hasEnteredNearView, modelReady]);

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  if (webglFailed) {
    return (
      <SequenceCanvas
        progressRef={progressRef}
        activeProgress={fallbackProgress}
      />
    );
  }

  return (
    <GarmentWebGLErrorBoundary
      fallback={
        <SequenceCanvas
          progressRef={progressRef}
          activeProgress={fallbackProgress}
        />
      }
    >
      <div
        ref={stageWrapRef}
        role="img"
        data-cursor="DRAG"
        aria-label={`Interactive 3D close-up inspecting ${currentStageInfo.title}. Drag to orbit 360 degrees.`}
        className={`relative h-full w-full cursor-grab active:cursor-grabbing transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [&_canvas]:!touch-pan-y ${
          modelReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          touchAction: 'pan-y',
          WebkitMaskImage: 'radial-gradient(closest-side, #000 58%, transparent 100%)',
          maskImage: 'radial-gradient(closest-side, #000 58%, transparent 100%)',
        }}
      >
        {hasEnteredNearView && (
          <Canvas
          fallback={
            <SequenceCanvas
              progressRef={progressRef}
              activeProgress={fallbackProgress}
            />
          }
          frameloop={inView ? 'always' : 'demand'}
          dpr={[1, 2]}
          camera={{ position: [...STAGE_CAMERA_KEYFRAMES[0].cam], fov: 32, near: 0.05, far: 50 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.18,
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
          <GarmentStudioLighting />

          <Suspense fallback={null}>
            <DetailedStageActor
              modelUrl={modelUrl}
              activeStage={activeStage}
              reducedMotion={reducedMotion}
              controlsRef={controlsRef}
              userControlledRef={userControlledRef}
              onReady={handleModelReady}
            />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={[...STAGE_CAMERA_KEYFRAMES[0].target]}
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.075}
            rotateSpeed={0.85}
            minPolarAngle={Math.PI * 0.14}
            maxPolarAngle={Math.PI * 0.84}
            onStart={() => {
              userControlledRef.current = true;
            }}
          />
        </Canvas>
        )}
      </div>
    </GarmentWebGLErrorBoundary>
  );
}
