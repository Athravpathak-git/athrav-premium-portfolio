'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function InteractiveMesh({ mode }: { mode: 'solid' | 'wireframe' | 'hybrid' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.45;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x -= delta * 0.35;
      coreRef.current.rotation.z += delta * 0.35;
    }
  });

  return (
    <group>
      {/* Outer abstract geometric polyhedron in Deep Burgundy */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshPhysicalMaterial
          color="#572633"
          metalness={0.15}
          roughness={0.16}
          transmission={mode === 'solid' ? 0.35 : 0.85}
          thickness={1.3}
          wireframe={mode === 'wireframe' || mode === 'hybrid'}
          transparent={mode === 'hybrid'}
          opacity={mode === 'hybrid' ? 0.88 : 1}
        />
      </mesh>

      {/* Internal Rose Gold metallic faceted core */}
      {(mode === 'hybrid' || mode === 'solid') && (
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.82, 0]} />
          <meshStandardMaterial
            color="#C18E83"
            emissive="#8A5348"
            emissiveIntensity={0.2}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

export function Showcase3D() {
  const [mode, setMode] = useState<'solid' | 'wireframe' | 'hybrid'>('hybrid');

  return (
    <div className="relative rounded-2xl border border-border-soft bg-white p-6 sm:p-8 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <span className="text-xs font-mono font-medium text-rosegold uppercase tracking-wider">
            Interactive Architecture
          </span>
          <h3 className="text-xl font-serif font-bold text-burgundy">Geometric Model Inspector</h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cream-100 border border-border-soft text-xs font-medium">
          {(['hybrid', 'wireframe', 'solid'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                mode === m
                  ? 'bg-burgundy text-white shadow-sm font-semibold'
                  : 'text-charcoal/70 hover:text-burgundy hover:bg-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 sm:h-80 relative rounded-xl overflow-hidden bg-cream-50 border border-border-soft">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
          <ambientLight intensity={1.1} color="#F7F2EA" />
          <directionalLight position={[4, 5, 4]} intensity={2.5} color="#FFFFFF" />
          <directionalLight position={[-4, -3, -3]} intensity={1.2} color="#E7D5D2" />
          <pointLight position={[0, 2, 2]} intensity={0.9} color="#C18E83" />
          <InteractiveMesh mode={mode} />
        </Canvas>
      </div>

      <p className="text-xs text-charcoal/60 mt-3 text-center font-mono">
        Drag to inspect • Multi-phase geometric renderer
      </p>
    </div>
  );
}
