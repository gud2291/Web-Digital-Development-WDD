"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";

/**
 * Animated distorted sphere. Renders inside a transparent Canvas so the
 * underlying hero gradient remains visible. Cursor influence is applied as a
 * rotation lerp on the mesh — never on the camera — so the sphere "looks at"
 * the cursor without disorienting parallax.
 *
 * Perf notes:
 *  - 64×64 sphere segments (~8k triangles) — fine on mid-range mobile GPUs.
 *  - DPR clamped to [1, 2] so high-density retina screens don't pay 4×.
 *  - frameloop stays "always" because we lerp rotation every frame; switching
 *    to "demand" would freeze the idle Float wobble.
 */
function Sphere() {
  const meshRef = React.useRef<Mesh>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Normalise to [-1, 1] relative to viewport centre.
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Lerp rotation toward mouse position — slow factor (0.05) keeps motion calm.
    const targetY = mouseRef.current.x * 0.45;
    const targetX = -mouseRef.current.y * 0.35;
    mesh.rotation.y += (targetY - mesh.rotation.y) * 0.05;
    mesh.rotation.x += (targetX - mesh.rotation.x) * 0.05;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.55, 64, 64]} />
        <MeshDistortMaterial
          color="#2563EB"
          distort={0.45}
          speed={2.2}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 3, 5]} intensity={1.3} color="#1B4DA8" />
      <directionalLight position={[-3, -2, 2]} intensity={0.7} color="#2563EB" />
      <Sphere />
    </Canvas>
  );
}
