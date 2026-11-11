'use client';

import React, { Component, type ReactNode } from 'react';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

export class GarmentWebGLErrorBoundary extends Component<
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

export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    typeof window.WebGL2RenderingContext !== 'undefined' ||
    typeof window.WebGLRenderingContext !== 'undefined'
  );
}

let neutralWhiteTex: THREE.DataTexture | null = null;
let neutralNormalTex: THREE.DataTexture | null = null;
let neutralLinearOneTex: THREE.DataTexture | null = null;

function getSharedNeutralMaps() {
  if (!neutralWhiteTex) {
    neutralWhiteTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
    neutralWhiteTex.colorSpace = THREE.SRGBColorSpace;
    neutralWhiteTex.needsUpdate = true;
  }
  if (!neutralNormalTex) {
    neutralNormalTex = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1, THREE.RGBAFormat);
    neutralNormalTex.colorSpace = THREE.NoColorSpace;
    neutralNormalTex.needsUpdate = true;
  }
  if (!neutralLinearOneTex) {
    neutralLinearOneTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
    neutralLinearOneTex.colorSpace = THREE.NoColorSpace;
    neutralLinearOneTex.needsUpdate = true;
  }
  return {
    whiteMap: neutralWhiteTex,
    flatNormalMap: neutralNormalTex,
    oneMap: neutralLinearOneTex,
  };
}

/**
 * Clones the cached GLTF scene, normalizes scale/origin cleanly, and upgrades
 * each named material group while keeping shared GLTF textures intact.
 * Assigning neutral 1x1 normal/MR/albedo maps aligns shader defines across all
 * garment parts so Three.js compiles a single shared PBR program.
 */
export function prepareDetailedGarment(
  scene: THREE.Group,
  options?: { enableEnvironment?: boolean }
): THREE.Group {
  const withEnv = options?.enableEnvironment ?? true;
  const { whiteMap, flatNormalMap, oneMap } = getSharedNeutralMaps();
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
    if (!srcMat || !srcMat.isMeshStandardMaterial) return;

    const matName = srcMat.name || '';

    if (matName.includes('obsidian_cloth')) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        map: srcMat.map ?? whiteMap,
        normalMap: srcMat.normalMap ?? flatNormalMap,
        normalScale: new THREE.Vector2(1.12, 1.12),
        roughnessMap: srcMat.roughnessMap ?? oneMap,
        metalnessMap: srcMat.metalnessMap ?? oneMap,
        roughness: 0.88,
        metalness: 0.02,
        envMapIntensity: withEnv ? 0.65 : 0.0,
        side: THREE.DoubleSide,
      });
      return;
    }

    if (matName.includes('anodized_gunmetal')) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(withEnv ? '#343840' : '#585F6B'),
        map: whiteMap,
        normalMap: flatNormalMap,
        normalScale: new THREE.Vector2(0, 0),
        roughnessMap: oneMap,
        metalnessMap: oneMap,
        metalness: withEnv ? 0.92 : 0.56,
        roughness: withEnv ? 0.22 : 0.24,
        envMapIntensity: withEnv ? 1.55 : 0.0,
        side: THREE.DoubleSide,
      });
      return;
    }

    if (matName.includes('seam_tape')) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#131418'),
        map: whiteMap,
        normalMap: flatNormalMap,
        normalScale: new THREE.Vector2(0, 0),
        roughnessMap: oneMap,
        metalnessMap: oneMap,
        metalness: 0.08,
        roughness: 0.36,
        envMapIntensity: withEnv ? 0.92 : 0.0,
        side: THREE.DoubleSide,
      });
      return;
    }

    if (matName.includes('woven_label')) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        map: srcMat.map ?? whiteMap,
        normalMap: flatNormalMap,
        normalScale: new THREE.Vector2(0, 0),
        roughnessMap: oneMap,
        metalnessMap: oneMap,
        metalness: 0.0,
        roughness: 0.86,
        envMapIntensity: withEnv ? 0.46 : 0.0,
        side: THREE.DoubleSide,
      });
      return;
    }

    if (matName.includes('accent_thread')) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#C8FF3D'),
        map: whiteMap,
        normalMap: flatNormalMap,
        normalScale: new THREE.Vector2(0, 0),
        roughnessMap: oneMap,
        metalnessMap: oneMap,
        metalness: 0.0,
        roughness: 0.36,
        emissive: new THREE.Color('#1D2905'),
        emissiveIntensity: 0.32,
        envMapIntensity: withEnv ? 0.65 : 0.0,
        side: THREE.DoubleSide,
      });
      return;
    }

    const clonedMat = srcMat.clone();
    clonedMat.side = THREE.DoubleSide;
    child.material = clonedMat;
  });

  return clone;
}

/**
 * Disposes only locally-instantiated Material wrappers on unmount so shared
 * textures in drei's useGLTF cache remain intact across sibling canvases.
 */
export function disposeGarmentMaterials(group: THREE.Group) {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => m.dispose());
    }
  });
}

export function GarmentStudioLighting({ enableEnvironment = true }: { enableEnvironment?: boolean }) {
  return (
    <>
      <ambientLight intensity={enableEnvironment ? 0.34 : 0.46} />
      <hemisphereLight args={['#ECECEF', '#16171B', enableEnvironment ? 0.25 : 0.72]} />
      {enableEnvironment ? (
        <>
          <directionalLight position={[2.4, 2.8, 3.6]} intensity={2.75} color="#F5F3EE" />
          <directionalLight position={[-3.6, 2.0, -2.4]} intensity={2.25} color="#EAECEF" />
          <directionalLight position={[3.5, 1.4, -2.4]} intensity={1.75} color="#F0EEE9" />
          <directionalLight position={[-0.6, -1.8, 2.8]} intensity={0.68} color="#DCDAD4" />
        </>
      ) : (
        <>
          <directionalLight position={[2.4, 3.0, 3.6]} intensity={2.95} color="#F5F3EE" />
          <directionalLight position={[-3.4, 2.0, -2.5]} intensity={2.55} color="#EAECEF" />
        </>
      )}

      {enableEnvironment && (
        <Environment resolution={64}>
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
      )}
    </>
  );
}
