import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeHeroCanvasProps {
  className?: string;
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000
    );

    const updateCameraDistance = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      const aspect = width / height;
      camera.aspect = aspect;
      // If width is narrower than height, adjust camera distance so the horizontal bounds never clip
      if (aspect < 1) {
        camera.position.z = Math.min(360, 260 / aspect);
      } else {
        camera.position.z = 260;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateCameraDistance(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Group for all rotating elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Central Wireframe Icosahedron Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(52, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.IcosahedronGeometry(30, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // 3. Orbiting Holographic Rings
    const ringGeo1 = new THREE.TorusGeometry(72, 0.6, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(82, 0.4, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    globeGroup.add(ring2);

    // 4. Floating Particle Cloud
    const particleCount = 260;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0x38bdf8); // Sky blue
    const colorB = new THREE.Color(0x6366f1); // Indigo
    const colorC = new THREE.Color(0x10b981); // Emerald
    const colorD = new THREE.Color(0xf59e0b); // Amber

    const colors = [colorA, colorB, colorC, colorD];

    for (let i = 0; i < particleCount; i++) {
      const radius = 56 + Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const c = colors[Math.floor(Math.random() * colors.length)];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    globeGroup.add(particles);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Autonomous continuous rotation
      globeGroup.rotation.y = elapsedTime * 0.18;
      globeGroup.rotation.x = Math.sin(elapsedTime * 0.12) * 0.14;

      ring1.rotation.z = elapsedTime * 0.22;
      ring2.rotation.z = -elapsedTime * 0.26;

      innerSphere.rotation.y = -elapsedTime * 0.32;
      particles.rotation.y = -elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler with ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          updateCameraDistance(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};
