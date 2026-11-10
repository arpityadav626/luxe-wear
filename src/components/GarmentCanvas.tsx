'use client';

import React, { useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GarmentModel } from './GarmentMesh';

interface GarmentCanvasProps {
  heroProgressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  active?: boolean;
}

function GarmentRig({
  heroProgressRef,
  reducedMotion,
}: {
  heroProgressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = heroProgressRef.current;
    const damp = 1 - Math.exp(-delta * 6.5);

    if (reducedMotion) {
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, p * Math.PI * 0.7, damp);
      group.scale.setScalar(1.0);
      group.position.y = 0;
      return;
    }

    const t = state.clock.getElapsedTime();
    const targetRotY = -0.2 + p * Math.PI * 1.2 + pointer.x * 0.28;
    const targetRotX = 0.04 + pointer.y * -0.14 + p * 0.08;
    const targetScale = 0.98 + p * 0.2;
    const targetY = Math.sin(t * 1.15) * 0.036;

    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, damp);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, damp);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, damp);
    const nextScale = THREE.MathUtils.lerp(group.scale.x, targetScale, damp);
    group.scale.setScalar(nextScale);
  });

  return (
    <group ref={groupRef}>
      <group position={[0, 0.06, 0]}>
        <GarmentModel />
      </group>
    </group>
  );
}

export default function GarmentCanvas({
  heroProgressRef,
  reducedMotion,
  active = true,
}: GarmentCanvasProps) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 2]}
      shadows="soft"
      camera={{ position: [0, 0.06, 3.85], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="h-full w-full touch-pan-y"
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3.8, 5, 4.2]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#F2F0EB"
      />
      <directionalLight position={[-4.5, 2.5, 1.5]} intensity={1.3} color="#CBD5E1" />
      <spotLight position={[0, 3.5, -4.5]} intensity={2.5} angle={0.75} penumbra={1} color="#C8FF3D" />

      <Environment resolution={256} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer
            form="rect"
            intensity={3.5}
            color="#F2F0EB"
            scale={[6, 2.5, 1]}
            position={[0, 4, 2.5]}
          />
          <Lightformer
            form="rect"
            intensity={2.6}
            color="#ffffff"
            scale={[4, 6, 1]}
            position={[-4, 0, 2]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={2.1}
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

      <GarmentRig heroProgressRef={heroProgressRef} reducedMotion={reducedMotion} />

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.55}
        scale={4.8}
        blur={2.5}
        far={2.6}
        color="#000000"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        minPolarAngle={Math.PI * 0.32}
        maxPolarAngle={Math.PI * 0.64}
      />
    </Canvas>
  );
}
