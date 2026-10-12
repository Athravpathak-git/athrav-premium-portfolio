'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Hero3DScene() {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const motionHandler = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // Feature detect WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    let animationFrameId;
    let renderer;
    let scene;
    let camera;
    let sphere;
    let wireSphere;
    let orbitRing1;
    let orbitRing2;
    let orbitRing3;
    let particlesMesh;

    // Dynamically import Three.js client-side
    import('three').then((THREE) => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth || 600;
      const height = containerRef.current.clientHeight || 600;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 7;

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch (e) {
        setWebglSupported(false);
        return;
      }

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      // Core metallic sphere
      const sphereGeo = new THREE.SphereGeometry(1.6, 64, 64);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x1a1c24,
        metalness: 0.92,
        roughness: 0.18,
      });
      sphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(sphere);

      // Subtle wireframe halo
      const wireGeo = new THREE.SphereGeometry(1.68, 24, 24);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      wireSphere = new THREE.Mesh(wireGeo, wireMat);
      scene.add(wireSphere);

      // Orbital Rings
      const ringMat1 = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.1,
        transparent: true,
        opacity: 0.45,
      });
      const ringGeo1 = new THREE.TorusGeometry(2.35, 0.015, 16, 120);
      orbitRing1 = new THREE.Mesh(ringGeo1, ringMat1);
      orbitRing1.rotation.x = Math.PI / 3;
      orbitRing1.rotation.y = Math.PI / 6;
      scene.add(orbitRing1);

      const ringMat2 = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0.35,
      });
      const ringGeo2 = new THREE.TorusGeometry(2.7, 0.012, 16, 120);
      orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
      orbitRing2.rotation.x = -Math.PI / 4;
      orbitRing2.rotation.y = Math.PI / 4;
      scene.add(orbitRing2);

      const ringGeo3 = new THREE.TorusGeometry(3.05, 0.008, 16, 120);
      const ringMat3 = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.25,
      });
      orbitRing3 = new THREE.Mesh(ringGeo3, ringMat3);
      orbitRing3.rotation.x = Math.PI / 2.2;
      scene.add(orbitRing3);

      // Ambient star-like particle field
      const particleCount = 70;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 8;
        posArray[i + 1] = (Math.random() - 0.5) * 8;
        posArray[i + 2] = (Math.random() - 0.5) * 6;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.035,
        color: 0xcfd8dc,
        transparent: true,
        opacity: 0.4,
      });
      particlesMesh = new THREE.Points(particleGeo, particleMat);
      scene.add(particlesMesh);

      // Studio Lighting (Apple aesthetic)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
      keyLight.position.set(5, 5, 4);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
      rimLight.position.set(-5, -3, -2);
      scene.add(rimLight);

      const silverLight = new THREE.DirectionalLight(0xe2e8f0, 1.5);
      silverLight.position.set(0, -4, 4);
      scene.add(silverLight);

      // Mouse Parallax
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const onPointerMove = (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });

      // Resize listener
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const newW = containerRef.current.clientWidth;
        const newH = containerRef.current.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      // Render loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Smooth cursor lerp
        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        if (sphere) {
          sphere.rotation.y += delta * 0.15;
          sphere.rotation.x = targetY * 0.3;
          sphere.rotation.y += targetX * 0.3;
        }

        if (wireSphere) {
          wireSphere.rotation.y -= delta * 0.08;
          wireSphere.rotation.x = targetY * 0.2;
        }

        if (orbitRing1) {
          orbitRing1.rotation.z += delta * 0.2;
          orbitRing1.rotation.y += delta * 0.1;
        }

        if (orbitRing2) {
          orbitRing2.rotation.z -= delta * 0.18;
          orbitRing2.rotation.x += delta * 0.07;
        }

        if (orbitRing3) {
          orbitRing3.rotation.z += delta * 0.25;
        }

        if (particlesMesh) {
          particlesMesh.rotation.y += delta * 0.03;
        }

        camera.position.x = targetX * 0.5;
        camera.position.y = targetY * 0.5;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        if (renderer && renderer.domElement) {
          renderer.dispose();
          renderer.domElement.remove();
        }
        sphereGeo?.dispose();
        sphereMat?.dispose();
        wireGeo?.dispose();
        wireMat?.dispose();
        ringGeo1?.dispose();
        ringMat1?.dispose();
        ringGeo2?.dispose();
        ringMat2?.dispose();
        ringGeo3?.dispose();
        ringMat3?.dispose();
        particleGeo?.dispose();
        particleMat?.dispose();
      };
    });

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Graceful Fallback if WebGL is unavailable or user requests reduced motion
  if (!webglSupported || reducedMotion) {
    return (
      <div
        className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center overflow-hidden"
        aria-label="Athrav Pathak Orbital Graphic"
        role="img"
      >
        {/* Ambient radial glow */}
        <div className="absolute w-72 h-72 rounded-full bg-slate-600/20 blur-3xl" />
        <div className="absolute w-48 h-48 rounded-full bg-sky-500/10 blur-2xl" />

        {/* Fallback metallic CSS sphere with subtle specular highlights */}
        <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full border border-white/20 shadow-2xl flex items-center justify-center bg-gradient-to-br from-slate-200/20 via-slate-900 to-black backdrop-blur-xl">
          <div className="absolute inset-2 rounded-full border border-white/10 bg-radial from-slate-400/10 via-transparent to-black/80" />
          <div className="absolute top-6 left-8 w-16 h-10 rounded-full bg-white/20 blur-md transform -rotate-45" />

          {/* Orbital rings */}
          <div className="absolute w-72 h-72 md:w-88 md:h-88 rounded-full border border-slate-400/30 transform rotate-45 scale-y-50" />
          <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full border border-sky-400/20 transform -rotate-12 scale-y-45" />

          {/* Core monogram */}
          <span className="text-3xl font-extralight tracking-widest text-slate-300 select-none">
            AP
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Metallic Sphere & Orbital Scene"
      role="img"
    />
  );
}
