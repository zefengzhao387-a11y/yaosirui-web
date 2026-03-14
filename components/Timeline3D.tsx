"use client";

import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, Stars, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

interface MemoryNodeProps {
  position: [number, number, number];
  year: string;
  title: string;
  color: string;
  onClick: () => void;
}

function MemoryNode({ position, year, title, color, onClick }: MemoryNodeProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
      
      // 动态缩放
      const targetScale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={hovered ? 5 : 2} 
        />
      </mesh>

      {/* 年份标签 */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000"
      >
        {year}
      </Text>

      {/* 悬浮标题 (仅在鼠标悬停时显示) */}
      {hovered && (
        <Html distanceFactor={10} position={[0, -1.2, 0]}>
          <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 whitespace-nowrap text-white text-xs pointer-events-none">
            {title}
          </div>
        </Html>
      )}
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

function TimelineScene({ onNodeClick }: { onNodeClick: (data: any) => void }) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={5} />
      
      {memoryData.map((node, i) => (
        <MemoryNode 
          key={i} 
          position={node.pos} 
          year={node.year} 
          title={node.title} 
          color={node.color} 
          onClick={() => onNodeClick(node)}
        />
      ))}
      
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
  const [selectedNode, setSelectedNode] = React.useState<any>(null);

  return (
    <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative">
      <div className="absolute top-24 left-10 z-10 text-white max-w-md pointer-events-none">
        <h1 className="text-4xl font-serif mb-4">多维时空轴</h1>
        <p className="text-morandi-sage opacity-80">
          滑动鼠标或滚轮，在记忆的星云中航行。每个发光的节点都是一段珍藏的时光。
        </p>
      </div>
      
      <Canvas gl={{ alpha: false, antialias: true }} style={{ height: "100%", width: "100%" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <TimelineScene onNodeClick={setSelectedNode} />
      </Canvas>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="glass px-6 py-2 rounded-full text-white/60 text-sm animate-pulse">
          拖拽旋转 · 滚轮缩放 · 点击节点查看详情
        </div>
      </div>

      {/* 记忆详情弹窗 */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div 
              className="bg-white/90 dark:bg-slate-900/90 w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-[2rem] shadow-2xl border border-white/20 p-8 md:p-12 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <span className="text-morandi-sage font-medium tracking-widest text-sm uppercase">Year {selectedNode.year}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-morandi-midnightBlue dark:text-morandi-cream mt-2">
                      {selectedNode.title}
                    </h2>
                  </div>
                  
                  <div className="p-6 bg-morandi-sage/10 rounded-3xl border border-morandi-sage/20 italic text-morandi-midnightBlue/70 dark:text-morandi-cream/70 leading-relaxed">
                    "那是一个阳光明媚的下午，空气中弥漫着泥土和草木的香气。我们走在熟悉的小路上，仿佛时间在那一刻停滞了..."
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-morandi-midnightBlue text-morandi-cream rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all">
                      播放语音旁白
                    </button>
                    <button className="flex-1 py-3 border border-morandi-sage/30 rounded-2xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all">
                      编辑记忆
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[3/4] bg-slate-200 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center text-slate-400 font-serif">
                    Photo 1
                  </div>
                  <div className="aspect-[3/4] bg-slate-200 rounded-3xl overflow-hidden shadow-inner mt-8 flex items-center justify-center text-slate-400 font-serif">
                    Photo 2
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
