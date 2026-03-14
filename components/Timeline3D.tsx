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
  { 
    year: "2020", 
    title: "初遇：在春天的午后", 
    color: "#9bb0a5", 
    pos: [0, 0, 0] as [number, number, number],
    highlights: ["/photo1.jpg", "/photo2.jpg"],
    summary: "那一年，我们在春天的午后初次相遇。樱花飘落，微风不燥。那是所有故事的开始，每一张照片都记录着当时羞涩的笑容。"
  },
  { 
    year: "2021", 
    title: "旅行：海边的篝火", 
    color: "#d4a5a5", 
    pos: [5, 2, -5] as [number, number, number],
    highlights: ["/photo3.jpg", "/photo4.jpg"],
    summary: "2021年的夏天，我们去了向往已久的海边。夜晚的篝火映照着彼此的面孔，海浪声成了我们谈话的背景音乐。"
  },
  { 
    year: "2022", 
    title: "奋斗：深夜的台灯", 
    color: "#dcd0c0", 
    pos: [-5, -2, -10] as [number, number, number],
    highlights: ["/photo1.jpg", "/photo3.jpg"],
    summary: "这一年是忙碌而充实的。无数个深夜，只有那一盏台灯陪伴着我们。虽然辛苦，但每一步都走得异常坚定。"
  },
  { 
    year: "2023", 
    title: "收获：第一份成功的喜悦", 
    color: "#d1d5db", 
    pos: [8, 4, -15] as [number, number, number],
    highlights: ["/photo2.jpg", "/photo4.jpg"],
    summary: "努力终于迎来了回报。那一刻的欢呼与泪水，都凝聚在这些珍贵的影像中。这是属于我们的高光时刻。"
  },
  { 
    year: "2024", 
    title: "展望：星辰大海的征程", 
    color: "#fdf5e6", 
    pos: [-3, 1, -20] as [number, number, number],
    highlights: ["/photo1.jpg", "/photo4.jpg"],
    summary: "2024，我们站在新的起点。未来的路还很长，但只要心中有光，脚下就有力量。我们将继续编织这段永恒的交响。"
  },
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
                    "{selectedNode.summary}"
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => window.location.href = `/timeline/${selectedNode.year}`}
                      className="w-full py-4 bg-morandi-midnightBlue text-morandi-cream rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg"
                    >
                      深入记忆星团 <ArrowRight size={20} />
                    </button>
                    <div className="flex gap-4">
                      <button className="flex-1 py-3 border border-morandi-sage/30 rounded-2xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all">
                        播放语音旁白
                      </button>
                      <button className="flex-1 py-3 border border-morandi-sage/30 rounded-2xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all">
                        编辑记忆
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedNode.highlights.map((img: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={`aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 transform ${idx === 1 ? 'mt-12' : ''} hover:rotate-2 transition-transform duration-500`}
                    >
                      <img 
                        src={img} 
                        alt={`Highlight ${idx}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
