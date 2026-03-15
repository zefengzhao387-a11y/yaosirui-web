"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function SlowStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 40;
      ref.current.rotation.y -= delta / 55;
    }
  });
  return (
    <group ref={ref}>
      <Stars radius={80} depth={40} count={2000} factor={3} saturation={0} fade speed={0.5} />
    </group>
  );
}

export default function NebulaPreview() {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[#0a0a0f]">
      <Canvas camera={{ position: [0, 0, 50], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#050508"]} />
        <Suspense fallback={null}>
          <SlowStars />
        </Suspense>
      </Canvas>
      {/* 中心光晕 */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/60" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(253,245,230,0.03) 40%, rgba(0,0,0,0.5) 100%)" }} />
    </div>
  );
}
