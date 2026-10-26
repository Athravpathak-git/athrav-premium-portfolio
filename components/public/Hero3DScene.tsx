'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Emerald glass orb with delicate brushed metal orbital rings
function EmeraldOrbAndOrbits({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Subtle mouse-responsive tilt with smooth damping
      const targetRotX = reducedMotion ? 0.05 : (state.pointer.y * -0.2) + Math.sin(time * 0.3) * 0.06;
      const targetRotY = reducedMotion ? 0.1 : (state.pointer.x * 0.25) + time * 0.12;
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 3, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 3, delta);
    }

    if (!reducedMotion) {
      if (innerRef.current) {
        innerRef.current.rotation.y -= delta * 0.2;
        innerRef.current.rotation.x += delta * 0.15;
      }
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z = time * 0.18;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z = -time * 0.22;
      }
      if (ring3Ref.current) {
        ring3Ref.current.rotation.z = time * 0.14;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Sophisticated Translucent Emerald Glass Sphere */}
      <mesh ref={orbRef} castShadow receiveShadow>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshPhysicalMaterial
          color="#183D32"
          roughness={0.12}
          transmission={0.88}
          thickness={1.3}
          ior={1.52}
          reflectivity={0.65}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          attenuationColor="#183D32"
          attenuationDistance={1.1}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* 2. Delicate Internal Core Facet (adds realistic optical depth) */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#B49A68"
          metalness={0.8}
          roughness={0.3}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 3. Primary Orbital Ring — Brushed Champagne Gold */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.95, 0.016, 20, 120]} />
        <meshStandardMaterial
          color="#B49A68"
          metalness={0.88}
          roughness={0.22}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* 4. Secondary Orbital Ring — Muted Sage Metal */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3.2, Math.PI / 4, 0]}>
        <torusGeometry args={[2.32, 0.014, 20, 120]} />
        <meshStandardMaterial
          color="#A8B9A0"
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>

      {/* 5. Tertiary Delicate Ring — Muted Champagne Metal */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 5, -Math.PI / 3, 0]}>
        <torusGeometry args={[2.68, 0.012, 16, 120]} />
        <meshStandardMaterial
          color="#CDB78C"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

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
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Soft Studio Lighting Rig */}
        <ambientLight intensity={0.9} color="#FFFDF7" />
        {/* Warm key light */}
        <directionalLight position={[4, 6, 5]} intensity={2.4} color="#FFFDF7" />
        {/* Soft sage rim light */}
        <directionalLight position={[-4, 2, -3]} intensity={1.4} color="#A8B9A0" />
        {/* Champagne floor fill */}
        <pointLight position={[0, -3, 3]} intensity={1.0} color="#B49A68" distance={8} />

        <EmeraldOrbAndOrbits reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
