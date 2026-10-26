'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Procedural Burgundy Glass Ribbon with Rose Gold Metallic Edge Piping
// ---------------------------------------------------------------------------
function BurgundyGlassRibbon({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const glassMeshRef = useRef<THREE.Mesh>(null);

  // Generate an organic, asymmetrical continuous 3D ribbon path
  const { ribbonGeometry, edgeCurve1, edgeCurve2 } = useMemo(() => {
    // 16 asymmetrical sculptural control points through 3D space
    const points = [
      new THREE.Vector3(0.0, 1.35, 0.25),
      new THREE.Vector3(0.75, 1.05, -0.4),
      new THREE.Vector3(1.3, 0.35, -0.2),
      new THREE.Vector3(1.05, -0.5, 0.35),
      new THREE.Vector3(0.4, -1.25, 0.5),
      new THREE.Vector3(-0.45, -1.35, 0.15),
      new THREE.Vector3(-1.15, -0.85, -0.35),
      new THREE.Vector3(-1.25, -0.05, -0.5),
      new THREE.Vector3(-0.9, 0.7, -0.15),
      new THREE.Vector3(-0.3, 1.2, 0.4),
      new THREE.Vector3(0.5, 0.85, 0.6),
      new THREE.Vector3(0.9, 0.1, 0.35),
      new THREE.Vector3(0.65, -0.65, -0.25),
      new THREE.Vector3(0.0, -1.05, -0.45),
      new THREE.Vector3(-0.7, -0.75, -0.15),
      new THREE.Vector3(-0.85, -0.1, 0.3),
    ];

    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    const segments = 180;
    const width = 0.22;
    const thickness = 0.035;

    // Build ribbon vertices, normals, and uvs
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const edge1Points: THREE.Vector3[] = [];
    const edge2Points: THREE.Vector3[] = [];

    // Parallel transport frame approximation with continuous artistic twist
    const tangents: THREE.Vector3[] = [];
    const normalsVec: THREE.Vector3[] = [];
    const binormalsVec: THREE.Vector3[] = [];

    let up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      tangents.push(tangent);

      let normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      if (normal.lengthSq() < 0.001) {
        up = new THREE.Vector3(1, 0, 0);
        normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      }
      up = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      // Apply sculptural smooth twist angle
      const twist = t * Math.PI * 3.5;
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const rotNormal = new THREE.Vector3()
        .copy(normal)
        .multiplyScalar(Math.cos(twist))
        .add(binormal.clone().multiplyScalar(Math.sin(twist)))
        .normalize();

      const rotBinormal = new THREE.Vector3().crossVectors(tangent, rotNormal).normalize();

      normalsVec.push(rotNormal);
      binormalsVec.push(rotBinormal);

      // Corner 0: Left-Top
      const c0 = pt.clone().addScaledVector(rotNormal, width).addScaledVector(rotBinormal, thickness);
      // Corner 1: Right-Top
      const c1 = pt.clone().addScaledVector(rotNormal, -width).addScaledVector(rotBinormal, thickness);
      // Corner 2: Right-Bottom
      const c2 = pt.clone().addScaledVector(rotNormal, -width).addScaledVector(rotBinormal, -thickness);
      // Corner 3: Left-Bottom
      const c3 = pt.clone().addScaledVector(rotNormal, width).addScaledVector(rotBinormal, -thickness);

      vertices.push(c0.x, c0.y, c0.z, c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, c3.x, c3.y, c3.z);

      // Midpoints for rose-gold edge piping
      edge1Points.push(pt.clone().addScaledVector(rotNormal, width));
      edge2Points.push(pt.clone().addScaledVector(rotNormal, -width));

      // Normals facing outwards
      normals.push(
        rotBinormal.x, rotBinormal.y, rotBinormal.z,
        rotBinormal.x, rotBinormal.y, rotBinormal.z,
        -rotBinormal.x, -rotBinormal.y, -rotBinormal.z,
        -rotBinormal.x, -rotBinormal.y, -rotBinormal.z
      );

      uvs.push(0, t, 1, t, 1, t, 0, t);
    }

    // Connect faces into triangles
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const baseCurr = i * 4;
      const baseNext = next * 4;

      // Top face (c0 -> c1)
      indices.push(baseCurr + 0, baseCurr + 1, baseNext + 1);
      indices.push(baseCurr + 0, baseNext + 1, baseNext + 0);

      // Bottom face (c2 -> c3)
      indices.push(baseCurr + 2, baseCurr + 3, baseNext + 3);
      indices.push(baseCurr + 2, baseNext + 3, baseNext + 2);

      // Left edge face (c3 -> c0)
      indices.push(baseCurr + 3, baseCurr + 0, baseNext + 0);
      indices.push(baseCurr + 3, baseNext + 0, baseNext + 3);

      // Right edge face (c1 -> c2)
      indices.push(baseCurr + 1, baseCurr + 2, baseNext + 2);
      indices.push(baseCurr + 1, baseNext + 2, baseNext + 1);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const curve1 = new THREE.CatmullRomCurve3(edge1Points, true, 'centripetal');
    const curve2 = new THREE.CatmullRomCurve3(edge2Points, true, 'centripetal');

    return {
      ribbonGeometry: geom,
      edgeCurve1: curve1,
      edgeCurve2: curve2,
    };
  }, []);

  // Frame update: natural, elegant studio movement with mouse parallax
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      if (reducedMotion) {
        groupRef.current.rotation.x = 0.18;
        groupRef.current.rotation.y = 0.45;
        groupRef.current.position.y = 0;
      } else {
        // Slow smooth artistic rotation
        const targetRotX = (state.pointer.y * -0.22) + Math.sin(time * 0.28) * 0.08 + 0.12;
        const targetRotY = (state.pointer.x * 0.28) + (time * 0.11);
        groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 2.5, delta);
        groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 2.5, delta);

        // Gentle breathing floating elevation
        groupRef.current.position.y = Math.sin(time * 0.35) * 0.06;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Main Translucent Burgundy Glass Ribbon Sculpture */}
      <mesh ref={glassMeshRef} geometry={ribbonGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#572633"
          roughness={0.1}
          metalness={0.06}
          transmission={0.88}
          thickness={1.6}
          ior={1.54}
          reflectivity={0.7}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          attenuationColor="#572633"
          attenuationDistance={1.4}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* 2. Rose Gold Edge Accent Trim — Left Rim */}
      <mesh>
        <tubeGeometry args={[edgeCurve1, 140, 0.0075, 8, true]} />
        <meshStandardMaterial
          color="#C18E83"
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>

      {/* 3. Rose Gold Edge Accent Trim — Right Rim */}
      <mesh>
        <tubeGeometry args={[edgeCurve2, 140, 0.0075, 8, true]} />
        <meshStandardMaterial
          color="#C18E83"
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Canvas Wrapper with Professional Studio Lighting & Shadow
// ---------------------------------------------------------------------------
export function Hero3DScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return null;
  }

  return (
    <div className="w-full h-full relative select-none pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.1, 4.8], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Warm Studio Ambient Light */}
        <ambientLight intensity={1.15} color="#F7F2EA" />

        {/* Primary Crisp Key Light */}
        <directionalLight position={[4.5, 6, 5]} intensity={2.8} color="#FFFFFF" />

        {/* Soft Muted Blush Fill Light */}
        <directionalLight position={[-4.5, 2.5, -2.5]} intensity={1.4} color="#E7D5D2" />

        {/* Subtle Rose Gold Back/Rim Light */}
        <directionalLight position={[0, -3.5, 3.5]} intensity={1.1} color="#C18E83" />

        {/* The Burgundy Glass Ribbon Art Sculpture */}
        <BurgundyGlassRibbon reducedMotion={reducedMotion} />
      </Canvas>

      {/* Gentle Studio Floor Contact Shadow against Cream Background */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 max-w-[320px] h-6 bg-charcoal/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
}
