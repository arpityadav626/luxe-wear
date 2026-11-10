'use client';

import React, { useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { siteConfig } from '@/config/site';
import { GarmentModel } from './GarmentMesh';

interface PinnedStoryCanvasProps {
  storyProgressRef: MutableRefObject<number>;
  active?: boolean;
}

/**
 * Maps normalized scroll progress (p in 0..1) into discrete chapter plateaus
 * matching the ScrollTrigger card transitions:
 *   Ch 0 hold [0.00..0.14] -> Ch 1 [0.28..0.41] -> Ch 2 [0.55..0.68] -> Ch 3 [0.82..1.00].
 */
function sampleStoryPose(p: number) {
  const chapters = siteConfig.storyChapters;
  const clamped = THREE.MathUtils.clamp(p, 0, 1);

  let idx = 0;
  let rawT = 0;
  if (clamped < 0.14) {
    idx = 0;
    rawT = 0;
  } else if (clamped < 0.28) {
    idx = 0;
    rawT = (clamped - 0.14) / 0.14;
  } else if (clamped < 0.41) {
    idx = 1;
    rawT = 0;
  } else if (clamped < 0.55) {
    idx = 1;
    rawT = (clamped - 0.41) / 0.14;
  } else if (clamped < 0.68) {
    idx = 2;
    rawT = 0;
  } else if (clamped < 0.82) {
    idx = 2;
    rawT = (clamped - 0.68) / 0.14;
  } else {
    idx = 2;
    rawT = 1;
  }

  // Smoothstep easing between chapters so camera rests dead-on each macro detail
  const t = rawT * rawT * (3 - 2 * rawT);

  const a = chapters[idx];
  const b = chapters[idx + 1];

  // Continuous 360° garment revolution across full scroll
  const rotY = clamped * Math.PI * 2;
  const rotX = THREE.MathUtils.lerp(a.rotationX, b.rotationX, t);

  const localCam = new THREE.Vector3(
    THREE.MathUtils.lerp(a.cameraPos[0], b.cameraPos[0], t),
    THREE.MathUtils.lerp(a.cameraPos[1], b.cameraPos[1], t),
    THREE.MathUtils.lerp(a.cameraPos[2], b.cameraPos[2], t)
  );

  const localLook = new THREE.Vector3(
    THREE.MathUtils.lerp(a.lookAt[0], b.lookAt[0], t),
    THREE.MathUtils.lerp(a.lookAt[1], b.lookAt[1], t),
    THREE.MathUtils.lerp(a.lookAt[2], b.lookAt[2], t)
  );

  const hotspot = new THREE.Vector3(
    THREE.MathUtils.lerp(a.hotspot[0], b.hotspot[0], t),
    THREE.MathUtils.lerp(a.hotspot[1], b.hotspot[1], t),
    THREE.MathUtils.lerp(a.hotspot[2], b.hotspot[2], t)
  );

  return { rotY, rotX, localCam, localLook, hotspot };
}

function StoryRig({ storyProgressRef }: { storyProgressRef: MutableRefObject<number> }) {
  const garmentGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const initialChapter = siteConfig.storyChapters[0];
  const currentLookAt = useMemo(
    () => new THREE.Vector3(...initialChapter.lookAt),
    [initialChapter.lookAt]
  );
  const worldCamTarget = useMemo(() => new THREE.Vector3(), []);
  const worldLookTarget = useMemo(() => new THREE.Vector3(), []);
  const adjustedLocalCam = useMemo(() => new THREE.Vector3(), []);
  const euler = useMemo(() => new THREE.Euler(), []);

  useFrame((state, delta) => {
    const group = garmentGroupRef.current;
    if (!group) return;

    const damp = 1 - Math.exp(-delta * 5.8);
    const pose = sampleStoryPose(storyProgressRef.current);

    // 1. Rotate garment smoothly through full 360°
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, pose.rotY, damp);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, pose.rotX, damp);

    // Subtle breathing motion while stationary
    const elapsed = state.clock.getElapsedTime();
    group.position.y = Math.sin(elapsed * 1.1) * 0.014;

    // Pull macro camera back slightly on compact viewports so soft feather never crops details
    const distanceScale = state.size.width < 768 ? 1.24 : 1.0;
    adjustedLocalCam
      .copy(pose.localCam)
      .sub(pose.localLook)
      .multiplyScalar(distanceScale)
      .add(pose.localLook);

    // 2. Transform local feature camera/lookAt into the garment's current world frame
    //    so macro close-ups always frame the active detail clearly while studio lights sweep 360°
    euler.set(group.rotation.x, group.rotation.y, 0, 'YXZ');

    worldCamTarget.copy(adjustedLocalCam).applyEuler(euler).add(group.position);
    worldLookTarget.copy(pose.localLook).applyEuler(euler).add(group.position);

    camera.position.lerp(worldCamTarget, damp);
    currentLookAt.lerp(worldLookTarget, damp);
    camera.lookAt(currentLookAt);

    // 3. Position subtle electric-lime 3D target reticle over active detail
    if (ringRef.current && dotRef.current) {
      ringRef.current.position.lerp(pose.hotspot, damp * 1.4);
      dotRef.current.position.copy(ringRef.current.position);
      const pulse = 1 + Math.sin(elapsed * 3.2) * 0.14;
      ringRef.current.scale.setScalar(pulse);
      ringRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={garmentGroupRef}>
      <GarmentModel />

      {/* Precision electric-lime 3D hotspot reticle */}
      <mesh ref={ringRef} position={initialChapter.hotspot}>
        <ringGeometry args={[0.036, 0.043, 32]} />
        <meshBasicMaterial
          color={siteConfig.colors.accent}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>
      <mesh ref={dotRef} position={initialChapter.hotspot}>
        <sphereGeometry args={[0.011, 16, 16]} />
        <meshBasicMaterial color={siteConfig.colors.accent} depthTest={false} />
      </mesh>
    </group>
  );
}

export default function PinnedStoryCanvas({
  storyProgressRef,
  active = true,
}: PinnedStoryCanvasProps) {
  const initialCam = siteConfig.storyChapters[0].cameraPos;

  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 2]}
      shadows="soft"
      camera={{ position: initialCam, fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="h-full w-full"
    >
      <ambientLight intensity={0.62} />
      <directionalLight
        position={[3.5, 4.8, 3.8]}
        intensity={2.45}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#F2F0EB"
      />
      <directionalLight position={[-4.2, 2.2, 2]} intensity={1.35} color="#CBD5E1" />
      <directionalLight position={[0, 2.5, -4.5]} intensity={1.8} color="#DCE4EE" />
      <spotLight position={[0, 3.5, -4.2]} intensity={2.2} angle={0.75} penumbra={1} color="#C8FF3D" />

      <Environment resolution={256} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer
            form="rect"
            intensity={3.6}
            color="#F2F0EB"
            scale={[6, 2.5, 1]}
            position={[0, 4, 2.5]}
          />
          <Lightformer
            form="rect"
            intensity={2.7}
            color="#ffffff"
            scale={[4, 6, 1]}
            position={[-4, 0, 2]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#e2e8f0"
            scale={[4, 6, 1]}
            position={[4, 0, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="ring"
            intensity={1.5}
            color="#C8FF3D"
            scale={3.5}
            position={[0, 0, -5]}
            target={[0, 0, 0]}
          />
        </group>
      </Environment>

      <StoryRig storyProgressRef={storyProgressRef} />

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.45}
        scale={4.2}
        blur={2.4}
        far={2.4}
        color="#000000"
      />
    </Canvas>
  );
}
