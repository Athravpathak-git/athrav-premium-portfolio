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
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x -= delta * 0.5;
      coreRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Outer abstract geometric polyhedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.9}
          roughness={0.15}
          wireframe={mode === 'wireframe' || mode === 'hybrid'}
          transparent={mode === 'hybrid'}
          opacity={mode === 'hybrid' ? 0.75 : 1}
        />
      </mesh>

      {/* Internal energetic core */}
      {(mode === 'hybrid' || mode === 'solid') && (
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#cbd5e1"
            emissiveIntensity={0.6}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
      )}
    </group>
  );
}

export function Showcase3D() {
  const [mode, setMode] = useState<'solid' | 'wireframe' | 'hybrid'>('hybrid');
  const [renderError, setRenderError] = useState(false);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-6 sm:p-8 overflow-hidden shadow-2xl">
      {/* Background radial gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-silver-400/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:max-w-md space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
            <Sparkles className="w-3.5 h-3.5 text-silver-300" />
            <span>WebGL Real-Time Geometry</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Spatial 3D & Mathematical Rendering
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Exploring multi-dimensional geometry, shader materials, and real-time GPU computation.
            Interact with the geometry below by toggling rendering modes.
          </p>

          {/* Interactive Mode Switcher */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('hybrid')}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all ${
                mode === 'hybrid'
                  ? 'border-silver-400 bg-white/15 text-white font-medium'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
            >
              Hybrid Wireframe
            </button>
            <button
              type="button"
              onClick={() => setMode('solid')}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all ${
                mode === 'solid'
                  ? 'border-silver-400 bg-white/15 text-white font-medium'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
            >
              Metallic Solid
            </button>
            <button
              type="button"
              onClick={() => setMode('wireframe')}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all ${
                mode === 'wireframe'
                  ? 'border-silver-400 bg-white/15 text-white font-medium'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
            >
              Lattice Only
            </button>
          </div>
        </div>

        {/* 3D Canvas Box */}
        <div className="w-full lg:w-96 h-72 sm:h-80 rounded-xl bg-black/60 border border-white/10 relative overflow-hidden flex items-center justify-center">
          {!renderError ? (
            <Canvas
              camera={{ position: [0, 0, 4.5], fov: 45 }}
              dpr={[1, 1.5]}
              onError={() => setRenderError(true)}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[4, 5, 4]} intensity={2.0} color="#ffffff" />
              <pointLight position={[-3, -3, -2]} intensity={1.2} color="#94a3b8" />
              <InteractiveMesh mode={mode} />
            </Canvas>
          ) : (
            <div className="text-center p-6 space-y-2">
              <Layers className="w-8 h-8 text-silver-400 mx-auto opacity-60" />
              <p className="text-xs text-zinc-400 font-mono">
                Hardware WebGL disabled. Fallback vector preview rendered.
              </p>
            </div>
          )}

          <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>Interactive GPU Shaders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
