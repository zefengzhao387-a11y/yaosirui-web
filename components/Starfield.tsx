"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import React from "react";
import * as random from "maath/random";

function Stars(props: any) {
  const ref = React.useRef<any>();
  const [sphere] = React.useState(() => {
    const s = random.inSphere(new Float32Array(6000), { radius: 1.5 });
    // Check for NaN and filter them out if they exist
    for (let i = 0; i < s.length; i++) {
      if (isNaN(s[i])) s[i] = 0;
    }
    return s as Float32Array;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#fdf5e6"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function Starfield() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
      </Canvas>
    </div>
  );
}
