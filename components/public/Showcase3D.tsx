'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, Layers, RefreshCw } from 'lucide-react';

function InteractiveMesh({ mode }: { mode: 'solid' | 'wireframe' | 'hybrid' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.35;
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x -= delta * 0.4;
      coreRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group>
      {/* Outer abstract geometric polyhedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial
          color="#183D32"
          metalness={0.4}
          roughness={0.2}
          transmission={mode === 'solid' ? 0.4 : 0.8}
          thickness={1.2}
          wireframe={mode === 'wireframe' || mode === 'hybrid'}
          transparent={mode === 'hybrid'}
          opacity={mode === 'hybrid' ? 0.85 : 1}
        />
      </mesh>

      {/* Internal champagne golden core */}
      {(mode === 'hybrid' || mode === 'solid') && (
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            color="#B49A68"
            emissive="#998150"
            emissiveIntensity={0.25}
            metalness={0.85}
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
    <div className="relative rounded-2xl border border-cream-300 bg-ivory shadow-lg p-6 sm:p-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <span className="text-xs font-mono text-forest-500 uppercase tracking-wider">
            Interactive Architecture
          </span>
          <h3 className="text-xl font-bold text-forest">Geometric Model Inspector</h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cream-200 border border-cream-300 text-xs font-medium">
          {(['hybrid', 'wireframe', 'solid'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                mode === m
                  ? 'bg-forest text-ivory shadow-sm font-semibold'
                  : 'text-forest-600 hover:text-forest hover:bg-cream-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 sm:h-80 relative rounded-xl overflow-hidden bg-cream-100/60 border border-cream-200">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
          <ambientLight intensity={0.9} color="#FFFDF7" />
          <directionalLight position={[4, 5, 4]} intensity={2.0} color="#FFFDF7" />
          <directionalLight position={[-4, -3, -3]} intensity={1.0} color="#A8B9A0" />
          <pointLight position={[0, 2, 2]} intensity={0.8} color="#B49A68" />
          <InteractiveMesh mode={mode} />
        </Canvas>
      </div>

      <p className="text-xs text-forest-600/80 mt-3 text-center font-mono">
        Drag to inspect • Three-phase geometric state
      </p>
    </div>
  );
}
