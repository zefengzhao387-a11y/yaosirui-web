"use client";

import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float, Stars, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

interface MemoryNodeProps {
  position: [number, number, number];
  year: string;
  title: string;
  color: string;
  key?: React.Key;
}

function MemoryNode({ position, year, title, color }: MemoryNodeProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      // Hover effect
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      </Float>
      
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/serif.woff" // Placeholder if needed
      >
        {year}
      </Text>
      
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="#9bb0a5"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
      >
        {title}
      </Text>
    </group>
  );
}

const memoryData = [
  { year: "2020", title: "初遇：在春天的午后", color: "#9bb0a5", pos: [0, 0, 0] as [number, number, number] },
  { year: "2021", title: "旅行：海边的篝火", color: "#d4a5a5", pos: [2, 1, -5] as [number, number, number] },
  { year: "2022", title: "奋斗：深夜的台灯", color: "#dcd0c0", pos: [-3, -1, -10] as [number, number, number] },
  { year: "2023", title: "收获：第一份成功的喜悦", color: "#d1d5db", pos: [4, 2, -15] as [number, number, number] },
  { year: "2024", title: "展望：星辰大海的征程", color: "#fdf5e6", pos: [-1, 0, -20] as [number, number, number] },
];

function TimelineScene() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {memoryData.map((node, i) => (
        <MemoryNode 
          key={i} 
          position={node.pos} 
          year={node.year} 
          title={node.title} 
          color={node.color} 
        />
      ))}
      
      {/* Connector lines (optional) */}
      {/* You could add a TubeGeometry connecting nodes */}
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={50}
        minDistance={2}
      />
    </>
  );
}

export default function Timeline3D() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <div className="absolute top-24 left-10 z-10 text-white max-w-md pointer-events-none">
        <h1 className="text-4xl font-serif mb-4">多维时空轴</h1>
        <p className="text-morandi-sage opacity-80">
          滑动鼠标或滚轮，在记忆的星云中航行。每个发光的节点都是一段珍藏的时光。
        </p>
      </div>
      
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <TimelineScene />
      </Canvas>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="glass px-6 py-2 rounded-full text-white/60 text-sm animate-pulse">
          拖拽旋转 · 滚轮缩放 · 点击节点查看详情
        </div>
      </div>
    </div>
  );
}
