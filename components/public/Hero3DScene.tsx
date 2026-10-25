'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Central metallic sphere + orbiting geometric elements
function SphereAndOrbits({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const node1Ref = useRef<THREE.Mesh>(null);
  const node2Ref = useRef<THREE.Mesh>(null);
  const node3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // Rotate outer group subtly with mouse influence
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.15;
      groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }

    // Individual counter-rotations for orbital rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.25;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.35;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.18;
    }

    // Orbiting AI geometric nodes
    if (node1Ref.current) {
      const radius = 2.4;
      node1Ref.current.position.x = Math.cos(time * 0.6) * radius;
      node1Ref.current.position.z = Math.sin(time * 0.6) * radius;
      node1Ref.current.position.y = Math.sin(time * 1.2) * 0.5;
      node1Ref.current.rotation.x += delta * 1.2;
      node1Ref.current.rotation.y += delta * 1.5;
    }

    if (node2Ref.current) {
      const radius = 3.0;
      node2Ref.current.position.x = Math.cos(-time * 0.45 + 2) * radius;
      node2Ref.current.position.z = Math.sin(-time * 0.45 + 2) * radius;
      node2Ref.current.position.y = Math.cos(time * 0.8) * 0.8;
      node2Ref.current.rotation.y += delta * 1.0;
    }

    if (node3Ref.current) {
      const radius = 2.1;
      node3Ref.current.position.x = Math.cos(time * 0.8 + 4) * radius;
      node3Ref.current.position.y = Math.sin(time * 0.8 + 4) * radius;
      node3Ref.current.position.z = Math.cos(time * 0.5) * 0.6;
      node3Ref.current.rotation.z += delta * 1.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Metallic Core Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshStandardMaterial
          color="#d1d5db"
          metalness={0.92}
          roughness={0.18}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Internal wireframe glow sphere */}
      <mesh>
        <sphereGeometry args={[1.18, 24, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Orbital Ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, Math.PI / 8, 0]}>
        <torusGeometry args={[1.9, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.95}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Orbital Ring 2 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3.5, Math.PI / 4, 0]}>
        <torusGeometry args={[2.3, 0.018, 16, 100]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.9}
          roughness={0.2}
          emissive="#cbd5e1"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Orbital Ring 3 */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 3, 0]}>
        <torusGeometry args={[2.7, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.85}
          roughness={0.25}
          emissive="#94a3b8"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Satellite AI Geometric Node 1: Icosahedron */}
      <mesh ref={node1Ref}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* Satellite AI Geometric Node 2: Octahedron */}
      <mesh ref={node2Ref}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Satellite AI Geometric Node 3: Dodecahedron */}
      <mesh ref={node3Ref}>
        <dodecahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// Subtle ambient particle field
function ParticleField({ count = 280 }: { count?: number }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      coords[i * 3 + 2] = radius * Math.cos(phi);
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#cbd5e1"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

export function Hero3DScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    // Check WebGL support
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
    <div className="w-full h-full absolute inset-0 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        dpr={[1, 1.8]} // Restrained DPR for high performance on Retina screens
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-5, -4, -4]} intensity={0.9} color="#94a3b8" />
        <pointLight position={[0, 3, 2]} intensity={1.5} color="#e2e8f0" distance={10} />

        <SphereAndOrbits reducedMotion={reducedMotion} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
