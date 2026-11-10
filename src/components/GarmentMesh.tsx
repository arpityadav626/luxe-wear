'use client';

import React, { Suspense, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { siteConfig } from '@/config/site';
import { assetPath } from '@/lib/assets';

/**
 * Generates paired 512x512 diagonal 3L technical twill weave bump & roughness maps
 * procedurally so macro close-ups in Stage 2 reveal tactile weave relief and grazing sheen.
 */
function createTwillTextures() {
  const size = 512;
  const bumpCanvas = document.createElement('canvas');
  const roughCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  roughCanvas.width = size;
  roughCanvas.height = size;

  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');

  if (bCtx && rCtx) {
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#909090';
    rCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const diag = ((x + y) / 4) % 4;
        const bumpShade = diag === 0 ? 204 : diag === 1 ? 156 : diag === 2 ? 84 : 118;
        const roughShade = diag === 0 ? 110 : diag === 1 ? 132 : diag === 2 ? 178 : 155;

        bCtx.fillStyle = `rgb(${bumpShade},${bumpShade},${bumpShade})`;
        bCtx.fillRect(x, y, 4, 2);

        rCtx.fillStyle = `rgb(${roughShade},${roughShade},${roughShade})`;
        rCtx.fillRect(x, y, 4, 2);
      }
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(28, 28);
  bumpMap.anisotropy = 8;
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(28, 28);
  roughnessMap.anisotropy = 8;
  roughnessMap.needsUpdate = true;

  return { bumpMap, roughnessMap };
}

function createTorsoGeometry(): THREE.BufferGeometry {
  const rings = 48;
  const radial = 64;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const v = i / rings;
    const y = -0.82 + v * 1.56;

    let rx = 0.455;
    let rz = 0.245;

    if (v < 0.36) {
      const t = v / 0.36;
      rx = 0.46 - Math.sin(t * Math.PI) * 0.028;
      rz = 0.245 - Math.sin(t * Math.PI) * 0.014;
    } else if (v < 0.8) {
      const t = (v - 0.36) / 0.44;
      const eased = t * t * (3 - 2 * t);
      rx = 0.448 + eased * 0.125;
      rz = 0.24 + Math.sin(t * Math.PI * 0.85) * 0.045;
    } else {
      const t = (v - 0.8) / 0.2;
      const eased = Math.pow(t, 1.35);
      rx = 0.573 - eased * 0.385;
      rz = 0.242 - eased * 0.095;
    }

    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const squircle = 1 + 0.075 * Math.pow(Math.abs(cosT * sinT), 1.4);
      const chestLift = sinT > 0 ? Math.pow(sinT, 1.8) * 0.032 * Math.sin(v * Math.PI) : 0;
      const spineDip = sinT < -0.45 && v > 0.25 ? -0.015 * Math.abs(sinT) : 0;
      const subtleDrape = Math.sin(theta * 6) * 0.004 * (1 - v);

      const x = cosT * (rx * squircle + subtleDrape);
      const z = sinT * (rz + chestLift + spineDip);

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = radial + 1;
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, d, b);
      indices.push(d, c, b);
    }
  }

  const bottomCenterIdx = positions.length / 3;
  positions.push(0, -0.77, 0);
  uvs.push(0.5, 0);
  for (let j = 0; j < radial; j++) {
    indices.push(bottomCenterIdx, j, j + 1);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Parametric folded outer shirt collar leaf that rolls downward from the inner
 * stand band and tapers cleanly toward the front placket tips (eliminating blunt ends).
 */
function createCollarShellGeometry(): THREE.BufferGeometry {
  const segsU = 56;
  const segsV = 10;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const thetaStart = Math.PI * 0.11;
  const thetaSpan = Math.PI * 1.78;

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV; // 0 = top folded crest, 1 = outer collar hem
    const rollAngle = v * Math.PI * 0.55;

    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      const theta = thetaStart + u * thetaSpan;

      // Smoothly taper front collar tips instead of abrupt cylinder cut ends
      const edgeDist = Math.min(u, 1 - u);
      const tipBlend = Math.min(1, edgeDist / 0.12);
      const tipSmooth = tipBlend * tipBlend * (3 - 2 * tipBlend);

      const leafDrop = 0.088 * (0.42 + 0.58 * tipSmooth);
      const baseRadius = 0.188 + Math.sin(rollAngle) * (0.056 * (0.35 + 0.65 * tipSmooth));
      const y = 0.806 - Math.pow(v, 1.15) * leafDrop;

      const x = Math.sin(theta) * baseRadius;
      const z = Math.cos(theta) * (baseRadius * 0.94) - 0.008;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = segsU + 1;
  for (let iv = 0; iv < segsV; iv++) {
    for (let iu = 0; iu < segsU; iu++) {
      const a = iv * stride + iu;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d);
      indices.push(d, b, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createSleeveGeometry(side: 1 | -1): THREE.BufferGeometry {
  const rings = 32;
  const radial = 36;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.25, 0.47, 0.0),
    new THREE.Vector3(side * 0.44, 0.37, 0.02),
    new THREE.Vector3(side * 0.62, 0.14, 0.05),
    new THREE.Vector3(side * 0.78, -0.15, 0.08),
    new THREE.Vector3(side * 0.89, -0.44, 0.06),
  ]);

  const points = curve.getPoints(rings);

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const center = points[i];
    const tangent = curve.getTangent(t).normalize();

    let r = 0.14 * (1 - t * 0.3);
    if (t < 0.18) {
      r *= 0.8 + (t / 0.18) * 0.2;
    } else if (t > 0.9) {
      r += 0.007;
    }

    const upRef = new THREE.Vector3(0, 0, 1);
    const binormal = new THREE.Vector3().crossVectors(tangent, upRef).normalize();
    const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const px = center.x + (binormal.x * cosT + normal.x * sinT) * r;
      const py = center.y + (binormal.y * cosT + normal.y * sinT) * r;
      const pz = center.z + (binormal.z * cosT + normal.z * sinT) * r * 0.92;

      positions.push(px, py, pz);
      uvs.push(u, t);
    }
  }

  const stride = radial + 1;
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d);
      indices.push(d, b, c);
    }
  }

  const cuffStart = rings * stride;
  const capIdx = positions.length / 3;
  const endPt = points[rings];
  positions.push(endPt.x * 0.985, endPt.y + 0.03, endPt.z);
  uvs.push(0.5, 1);
  for (let j = 0; j < radial; j++) {
    indices.push(capIdx, cuffStart + j + 1, cuffStart + j);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function CustomGlbGarment({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [cloned]);

  return <primitive object={cloned} scale={1.1} position={[0, -0.2, 0]} />;
}

/**
 * Built-in sculptural 3D Technical Twill Overshirt with fine lockstitch runs,
 * Fidlock hardware snap, concealed placket, contoured chest pocket, and electric-lime bar-tacks.
 * Origin sits squarely at [0, 0, 0] so Stage 2 hotspots align identically with 3D geometry.
 */
export function ProceduralTechOvershirt() {
  const { bumpMap, roughnessMap } = useMemo(() => createTwillTextures(), []);
  const torsoGeo = useMemo(() => createTorsoGeometry(), []);
  const collarShellGeo = useMemo(() => createCollarShellGeometry(), []);
  const leftSleeveGeo = useMemo(() => createSleeveGeometry(-1), []);
  const rightSleeveGeo = useMemo(() => createSleeveGeometry(1), []);

  useEffect(() => {
    return () => {
      bumpMap.dispose();
      roughnessMap.dispose();
      torsoGeo.dispose();
      collarShellGeo.dispose();
      leftSleeveGeo.dispose();
      rightSleeveGeo.dispose();
    };
  }, [bumpMap, roughnessMap, torsoGeo, collarShellGeo, leftSleeveGeo, rightSleeveGeo]);

  const clothMaterialProps = {
    color: '#26282e',
    roughness: 0.62,
    roughnessMap,
    metalness: 0.08,
    bumpMap,
    bumpScale: 0.02,
    sheen: 0.85,
    sheenRoughness: 0.44,
    sheenColor: new THREE.Color('#959dad'),
  };

  const tapeMaterialProps = {
    color: '#30333a',
    roughness: 0.36,
    metalness: 0.22,
  };

  // Finer lockstitch spacing along the front concealed placket
  const placketStitches = useMemo(
    () => Array.from({ length: 20 }, (_, idx) => -0.64 + idx * 0.068),
    []
  );

  // Side-panel dual-needle seam ticks running directly down to the electric-lime bar-tack vent
  const gussetStitches = useMemo(
    () => Array.from({ length: 7 }, (_, idx) => -0.51 + idx * 0.048),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={torsoGeo} castShadow receiveShadow>
        <meshPhysicalMaterial {...clothMaterialProps} />
      </mesh>

      <mesh geometry={leftSleeveGeo} castShadow receiveShadow>
        <meshPhysicalMaterial {...clothMaterialProps} />
      </mesh>
      <mesh geometry={rightSleeveGeo} castShadow receiveShadow>
        <meshPhysicalMaterial {...clothMaterialProps} />
      </mesh>

      {/* Closed Inner Architectural Neckband */}
      <mesh position={[0, 0.758, -0.006]} rotation={[0.04, 0, 0]} castShadow>
        <cylinderGeometry args={[0.178, 0.194, 0.104, 48, 1, true]} />
        <meshPhysicalMaterial {...clothMaterialProps} side={THREE.DoubleSide} />
      </mesh>

      {/* Tapered Parametric Outer Folded Collar Shell */}
      <mesh geometry={collarShellGeo} castShadow receiveShadow>
        <meshPhysicalMaterial {...clothMaterialProps} side={THREE.DoubleSide} />
      </mesh>

      {/* Concealed Front Placket Strip extending cleanly up to neckband base */}
      <mesh position={[0, -0.005, 0.244]} castShadow>
        <boxGeometry args={[0.064, 1.42, 0.018]} />
        <meshStandardMaterial {...tapeMaterialProps} />
      </mesh>

      {/* Placket Lockstitch Ticks */}
      {placketStitches.map((sy) => (
        <mesh key={`pl-${sy}`} position={[0.035, sy, 0.249]}>
          <boxGeometry args={[0.0035, 0.018, 0.005]} />
          <meshStandardMaterial color="#676b76" roughness={0.4} metalness={0.2} />
        </mesh>
      ))}

      {/* Lower-Right Gusset Seam Lockstitch Run terminating into Bar-Tack */}
      {gussetStitches.map((gy, idx) => (
        <mesh
          key={`gs-${gy}`}
          position={[0.286, gy, 0.192 - idx * 0.001]}
          rotation={[0, 0.68, 0]}
        >
          <boxGeometry args={[0.0035, 0.018, 0.005]} />
          <meshStandardMaterial color="#6e7380" roughness={0.38} metalness={0.22} />
        </mesh>
      ))}

      {/* Contoured Technical Chest Pocket + Bevel Flap */}
      <group position={[0.215, 0.225, 0.236]} rotation={[0.05, 0.34, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.185, 0.21, 0.01]} />
          <meshPhysicalMaterial {...clothMaterialProps} />
        </mesh>
        <mesh position={[0, 0.088, 0.008]} rotation={[-0.06, 0, -0.025]} castShadow>
          <boxGeometry args={[0.194, 0.056, 0.01]} />
          <meshStandardMaterial {...tapeMaterialProps} />
        </mesh>
        {/* Pocket topstitch accent */}
        <mesh position={[0, 0.054, 0.008]}>
          <boxGeometry args={[0.165, 0.003, 0.004]} />
          <meshStandardMaterial color="#676b76" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>

      {/* Anodized Collar Fidlock Snap Button squarely anchored on upper placket */}
      <group position={[0, 0.64, 0.252]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 0.014, 28]} />
          <meshStandardMaterial color="#878d98" roughness={0.2} metalness={0.92} />
        </mesh>
        <mesh position={[0, 0.0075, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.005, 24]} />
          <meshStandardMaterial color="#23252b" roughness={0.35} metalness={0.75} />
        </mesh>
      </group>

      {/* Signature LUXE WEAR Electric-Lime Bar-Tack Stress Vents */}
      <mesh position={[0.285, -0.56, 0.192]} rotation={[0, 0.68, 0]}>
        <boxGeometry args={[0.056, 0.013, 0.01]} />
        <meshStandardMaterial
          color={siteConfig.colors.accent}
          emissive={siteConfig.colors.accent}
          emissiveIntensity={0.68}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 0.705, -0.214]}>
        <boxGeometry args={[0.076, 0.013, 0.01]} />
        <meshStandardMaterial
          color={siteConfig.colors.accent}
          emissive={siteConfig.colors.accent}
          emissiveIntensity={0.55}
          roughness={0.28}
        />
      </mesh>
    </group>
  );
}

/**
 * Shared 3D Garment Model component used by both HeroSection and PinnedStorySection.
 * Automatically switches between `/public/models/garment.glb` and the procedural
 * technical overshirt based on `siteConfig.heroGarment.useCustomGlb`.
 */
export function GarmentModel() {
  return siteConfig.heroGarment.useCustomGlb ? (
    <Suspense fallback={<ProceduralTechOvershirt />}>
      <CustomGlbGarment url={assetPath(siteConfig.heroGarment.modelPath)} />
    </Suspense>
  ) : (
    <ProceduralTechOvershirt />
  );
}
