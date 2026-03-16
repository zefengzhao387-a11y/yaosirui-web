"use client";

import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, Stars, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface MemoryNodeProps {
  position: [number, number, number];
  year: string;
  title: string;
  color: string;
  onClick: () => void;
}

function MemoryNode({ position, year, title, color, onClick }: MemoryNodeProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const groupRef = React.useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 整个星球（含光晕）一起上下浮动 & 呼吸缩放，保证始终对齐
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(t + position[0]) * 0.25;
      const targetScale = hovered ? 1.55 : 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.12
      );
    }

    // 仅实体球自转
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 发光星球本体 */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.5 : 1.2}
          roughness={0.12}
          metalness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* 柔和外发光晕（更梦幻） */}
      <mesh>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.38 : 0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 年份标签 */}
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.42}
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

type TimelineNode = {
  year: string;
  title: string;
  summary: string;
  highlights: string[];
  color: string;
  pos: [number, number, number];
};

type YearSummaryDTO = {
  year: string;
  title: string;
  summary: string;
  highlights: string[];
};

const COLOR_PALETTE = ["#9bb0a5", "#d4a5a5", "#dcd0c0", "#d1d5db", "#fdf5e6"];

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function computePos(index: number, total: number): [number, number, number] {
  const angle = total <= 1 ? 0 : (index / total) * Math.PI * 2;
  const radius = Math.max(2, 4 + total * 0.8);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius * 0.8 - index * 1.5;
  const y = ((index % 3) - 1) * 1.6;
  return [x, y, z];
}

function buildNodes(years: YearSummaryDTO[]): TimelineNode[] {
  const sorted = [...years].sort((a, b) => a.year.localeCompare(b.year));
  return sorted.map((y, idx) => {
    const color = COLOR_PALETTE[hashString(y.year) % COLOR_PALETTE.length];
    return {
      year: y.year,
      title: y.title,
      summary: y.summary,
      highlights: Array.isArray(y.highlights) ? y.highlights.slice(0, 2) : [],
      color,
      pos: computePos(idx, sorted.length),
    };
  });
}

const MAX_IMAGE_PX = 1200;
const JPEG_QUALITY = 0.78;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= MAX_IMAGE_PX && h <= MAX_IMAGE_PX && file.size < 400_000) {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("READ_FAILED"));
        reader.readAsDataURL(file);
        return;
      }
      const scale = Math.min(MAX_IMAGE_PX / w, MAX_IMAGE_PX / h, 1);
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("READ_FAILED"));
        reader.readAsDataURL(file);
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      } catch {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("READ_FAILED"));
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("READ_FAILED"));
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

type FlyToRequest = {
  target: [number, number, number];
  cameraPos: [number, number, number];
};

function CameraFlyTo({
  flyToRequest,
  setFlyToRequest,
  controlsRef,
}: {
  flyToRequest: FlyToRequest | null;
  setFlyToRequest: (v: FlyToRequest | null) => void;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetVec = React.useMemo(() => new THREE.Vector3(), []);
  const cameraVec = React.useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!flyToRequest || !controlsRef.current) return;
    targetVec.set(...flyToRequest.target);
    cameraVec.set(...flyToRequest.cameraPos);
    controlsRef.current.target.lerp(targetVec, Math.min(1, delta * 4));
    camera.position.lerp(cameraVec, Math.min(1, delta * 4));
    if (camera.position.distanceTo(cameraVec) < 0.05) {
      controlsRef.current.target.copy(targetVec);
      camera.position.copy(cameraVec);
      setFlyToRequest(null);
    }
  });
  return null;
}

/** 缓慢旋转的星空（比主页更慢） */
function SlowRotatingStars() {
  const groupRef = React.useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x -= delta / 50;
      groupRef.current.rotation.y -= delta / 70;
    }
  });
  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

function TimelineScene({
  nodes,
  onNodeClick,
  flyToRequest,
  setFlyToRequest,
  controlsRef,
}: {
  nodes: TimelineNode[];
  onNodeClick: (data: TimelineNode) => void;
  flyToRequest: FlyToRequest | null;
  setFlyToRequest: (v: FlyToRequest | null) => void;
  controlsRef: React.RefObject<any>;
}) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <SlowRotatingStars />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={5} />
      
      {nodes.map((node, i) => (
        <MemoryNode 
          key={`${node.year}-${i}`} 
          position={node.pos} 
          year={node.year} 
          title={node.title} 
          color={node.color} 
          onClick={() => onNodeClick(node)}
        />
      ))}
      
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={50}
        minDistance={2}
      />
      <CameraFlyTo flyToRequest={flyToRequest} setFlyToRequest={setFlyToRequest} controlsRef={controlsRef} />
    </>
  );
}

export default function Timeline3D() {
  const [nodes, setNodes] = React.useState<TimelineNode[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<string | null>(null);
  const [flyToRequest, setFlyToRequest] = React.useState<FlyToRequest | null>(null);
  const controlsRef = React.useRef<any>(null);
  const selectedNode = React.useMemo(
    () => (selectedYear ? nodes.find((n) => n.year === selectedYear) ?? null : null),
    [nodes, selectedYear]
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isZooming, setIsZooming] = React.useState(false);
  const [editForm, setEditForm] = React.useState<{
    title: string;
    summary: string;
    highlights: string[];
  }>({ title: "", summary: "", highlights: [] });
  const fileInputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const [createForm, setCreateForm] = React.useState<{
    year: string;
    title: string;
    summary: string;
    highlights: string[];
  }>({ year: "", title: "", summary: "", highlights: [] });
  const createFileInputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const refreshYears = React.useCallback(() => {
    fetch("/api/year-summaries")
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { years: YearSummaryDTO[] };
        setNodes(buildNodes(data.years || []));
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    refreshYears();
  }, [refreshYears]);

  const handleDeepDive = () => {
    if (!selectedNode) return;
    const year = selectedNode.year;
    setIsZooming(true);
    // 模拟相机推进效果后跳转
    setTimeout(() => {
      window.location.href = `/timeline/${year}`;
    }, 1000);
  };

  const startEdit = () => {
    if (!selectedNode) return;
    setEditForm({
      title: selectedNode.title,
      summary: selectedNode.summary,
      highlights: [...selectedNode.highlights],
    });
    setIsEditing(true);
  };

  const setHighlight = (index: number, url: string) => {
    setEditForm((prev) => {
      const next = [...prev.highlights];
      while (next.length <= index) next.push("");
      next[index] = url;
      return { ...prev, highlights: next };
    });
  };

  const setCreateHighlight = (index: number, url: string) => {
    setCreateForm((prev) => {
      const next = [...prev.highlights];
      while (next.length <= index) next.push("");
      next[index] = url;
      return { ...prev, highlights: next };
    });
  };

  const handlePickFile = (index: number) => {
    fileInputsRef.current[index]?.click();
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    fileToDataUrl(file)
      .then((url) => setHighlight(index, url))
      .catch(() => {});
  };

  const handlePickCreateFile = (index: number) => {
    createFileInputsRef.current[index]?.click();
  };

  const handleCreateFileChange = (index: number, file: File | null) => {
    if (!file) return;
    fileToDataUrl(file)
      .then((url) => setCreateHighlight(index, url))
      .catch(() => {});
  };

  const handleSaveEdit = () => {
    if (!selectedNode) return;
    const payload = {
      year: selectedNode.year,
      title: editForm.title.trim() || selectedNode.title,
      summary: editForm.summary,
      highlights: editForm.highlights.filter(Boolean).slice(0, 2),
    };

    fetch("/api/year-summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          setIsEditing(false);
          return;
        }
        const data = (await res.json()) as {
          year: { year: string; title: string; summary: string; highlights: string[] };
        };
        setNodes((prev) =>
          prev.map((n) =>
            n.year === data.year.year
              ? {
                  ...n,
                  title: data.year.title,
                  summary: data.year.summary,
                  highlights: data.year.highlights.slice(0, 2),
                }
              : n
          )
        );
        setIsEditing(false);
      })
      .catch(() => setIsEditing(false));
  };

  const handleCreateYear = () => {
    const year = createForm.year.trim();
    if (!/^\d{4}$/.test(year)) {
      alert("年份必须是 4 位数字");
      return;
    }
    // 不允许重复年份星团
    if (nodes.some((n) => n.year === year)) {
      alert("该年份已经有一个记忆星团了，不能重复创建相同年份。");
      return;
    }
    const title = createForm.title.trim();
    if (!title) {
      alert("标题不能为空");
      return;
    }

    fetch("/api/year-summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year,
        title,
        summary: createForm.summary,
        highlights: createForm.highlights.filter(Boolean).slice(0, 2),
      }),
    })
      .then(async (res) => {
        const text = await res.text();
        let data: { year?: { year: string; title: string; summary: string; highlights: string[] }; error?: string } | null = null;
        try {
          if (text) data = JSON.parse(text) as any;
        } catch {
          /* 平台可能返回非 JSON，如 413 时的 HTML */
        }
        if (!res.ok) {
          const reason =
            (data as any)?.error ||
            (res.status === 413
              ? "请求体过大，请使用图片链接或更小的图片（单张建议小于 1MB）"
              : res.status >= 500
                ? "服务器错误，请稍后重试。若使用了图片，请尝试更小图片或粘贴图片链接。"
                : `请求失败 (${res.status})。若使用了图片，可能是图片过大，请尝试更小图片或粘贴图片链接。`);
          alert(reason);
          return;
        }
        setIsCreating(false);
        setCreateForm({ year: "", title: "", summary: "", highlights: [] });
        if (data?.year) {
          setNodes((prev) =>
            buildNodes([
              ...prev.map((n) => ({
                year: n.year,
                title: n.title,
                summary: n.summary,
                highlights: n.highlights,
              })),
              data.year!,
            ])
          );
        } else {
          refreshYears();
        }
      })
      .catch(() => {
        alert(
          "网络或请求异常，创建失败。若使用了图片，请尝试使用更小图片或粘贴图片链接。"
        );
      });
  };

  React.useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className={`w-full h-screen bg-[#0a0a0a] overflow-hidden relative transition-opacity duration-1000 ${isZooming ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
      <div className="absolute top-24 left-10 z-10 text-white max-w-md pointer-events-none">
        <h1 className="text-4xl font-serif mb-4">多维时空轴</h1>
        <p className="text-morandi-sage opacity-80">
          滑动鼠标或滚轮，在记忆的星云中航行。每个发光的节点都是一段珍藏的时光。
        </p>
      </div>
      
      <Canvas dpr={[1, 3]} gl={{ alpha: false, antialias: true }} style={{ height: "100%", width: "100%" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <TimelineScene
          nodes={nodes}
          onNodeClick={(node) => setSelectedYear(node.year)}
          flyToRequest={flyToRequest}
          setFlyToRequest={setFlyToRequest}
          controlsRef={controlsRef}
        />
      </Canvas>

      {/* 右侧：只显示已创建的年份，点击后视角飞向该星团并选中 */}
      {nodes.length > 0 && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          {nodes.map((node, index) => (
            <button
              key={`${node.year}-${index}`}
              type="button"
              onClick={() => {
                setSelectedYear(node.year);
                setFlyToRequest({
                  target: node.pos,
                  cameraPos: [node.pos[0], node.pos[1], node.pos[2] + 8],
                });
              }}
              className={`group flex items-center justify-end gap-3 text-right transition-colors ${
                selectedYear === node.year ? "text-morandi-sage" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-sm font-medium tabular-nums">{node.year}</span>
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  selectedYear === node.year ? "bg-morandi-sage scale-125" : "bg-white/30 group-hover:bg-white/50 group-hover:w-2 group-hover:h-2"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {nodes.length === 0 && !isCreating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="glass px-10 py-8 rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur-xl text-center">
            <div className="text-white text-2xl font-serif mb-2">你的时间轴还是空的</div>
            <div className="text-white/60 text-sm mb-6">先创建一个年份星团开始吧</div>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-morandi-cream transition-all"
            >
              添加年份
            </button>
          </div>
        </div>
      )}

      {!isCreating && (
        <div className="absolute top-28 right-10 z-30">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="glass px-6 py-3 rounded-full text-white/80 hover:text-white border border-white/10 bg-black/30 backdrop-blur-xl transition-all"
          >
            + 添加年份
          </button>
        </div>
      )}
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="glass px-6 py-2 rounded-full text-white/60 text-sm animate-pulse">
          拖拽旋转 · 滚轮缩放 · 点击节点查看详情
        </div>
      </div>

      {/* 记忆详情弹窗 */}
      <AnimatePresence>
        {selectedNode && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedYear(null)}
          >
            <motion.div 
              className="bg-white/90 dark:bg-slate-900/90 w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-[2rem] shadow-2xl border border-white/20 p-8 md:p-12 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedYear(null)}
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
                      onClick={handleDeepDive}
                      className="w-full py-4 bg-morandi-midnightBlue text-morandi-cream rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg"
                    >
                      深入记忆星团 <ArrowRight size={20} />
                    </button>
                    <div className="flex gap-4">
                      <button className="flex-1 py-3 border border-morandi-sage/30 rounded-2xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all">
                        播放语音旁白
                      </button>
                      <button 
                        onClick={startEdit}
                        className="flex-1 py-3 border border-morandi-sage/30 rounded-2xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all"
                      >
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

      {/* 编辑记忆弹窗 */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[300] flex items-center justify-center py-8 px-4 bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[75vh] rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
              <h2 className="text-xl font-serif py-4 px-6 flex-shrink-0 border-b border-morandi-sage/10 text-morandi-midnightBlue dark:text-morandi-cream">编辑 {selectedYear ?? ""} 年度记忆</h2>
              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-1">记忆标题</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-1">年度总结</label>
                  <textarea 
                    rows={4}
                    value={editForm.summary}
                    onChange={(e) => setEditForm((p) => ({ ...p, summary: e.target.value }))}
                    className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-3">年度照片</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-morandi-sage/20 bg-morandi-sage/5">
                          {editForm.highlights[idx] ? (
                            <img
                              src={editForm.highlights[idx]}
                              alt={`highlight-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-morandi-midnightBlue/60 dark:text-morandi-cream/60">
                              暂无照片
                            </div>
                          )}
                        </div>
                        <input
                          ref={(el) => {
                            fileInputsRef.current[idx] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(idx, e.target.files?.[0] ?? null)
                          }
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handlePickFile(idx)}
                            className="flex-1 py-2.5 bg-morandi-midnightBlue text-morandi-cream rounded-xl font-bold hover:bg-opacity-90 transition-all"
                          >
                            选择照片
                          </button>
                          <button
                            type="button"
                            onClick={() => setHighlight(idx, "")}
                            className="px-4 py-2.5 border border-morandi-sage/30 rounded-xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all"
                          >
                            清空
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="也可以粘贴图片 URL"
                          value={editForm.highlights[idx] || ""}
                          onChange={(e) => setHighlight(idx, e.target.value)}
                          className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 p-6 border-t border-morandi-sage/10">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 border border-morandi-sage/30 rounded-xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-morandi-midnightBlue text-morandi-cream rounded-xl font-bold hover:bg-opacity-90 transition-all"
                  >
                    保存修改
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[320] flex items-center justify-center py-8 px-4 bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[75vh] rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
              <h2 className="text-xl font-serif py-4 px-6 flex-shrink-0 border-b border-morandi-sage/10 text-morandi-midnightBlue dark:text-morandi-cream">创建年份星团</h2>
              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-1">年份</label>
                  <input
                    type="text"
                    placeholder="例如 2026"
                    value={createForm.year}
                    onChange={(e) => setCreateForm((p) => ({ ...p, year: e.target.value }))}
                    className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-1">记忆标题</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-1">年度总结</label>
                  <textarea
                    rows={4}
                    value={createForm.summary}
                    onChange={(e) => setCreateForm((p) => ({ ...p, summary: e.target.value }))}
                    className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-morandi-sage mb-3">年度照片</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-morandi-sage/20 bg-morandi-sage/5">
                          {createForm.highlights[idx] ? (
                            <img
                              src={createForm.highlights[idx]}
                              alt={`create-highlight-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-morandi-midnightBlue/60 dark:text-morandi-cream/60">
                              暂无照片
                            </div>
                          )}
                        </div>
                        <input
                          ref={(el) => {
                            createFileInputsRef.current[idx] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleCreateFileChange(idx, e.target.files?.[0] ?? null)
                          }
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handlePickCreateFile(idx)}
                            className="flex-1 py-2.5 bg-morandi-midnightBlue text-morandi-cream rounded-xl font-bold hover:bg-opacity-90 transition-all"
                          >
                            选择照片
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateHighlight(idx, "")}
                            className="px-4 py-2.5 border border-morandi-sage/30 rounded-xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all"
                          >
                            清空
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="也可以粘贴图片 URL"
                          value={createForm.highlights[idx] || ""}
                          onChange={(e) => setCreateHighlight(idx, e.target.value)}
                          className="w-full bg-morandi-sage/5 border border-morandi-sage/20 rounded-xl px-4 py-3 text-morandi-midnightBlue dark:text-morandi-cream focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 p-6 border-t border-morandi-sage/10">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 border border-morandi-sage/30 rounded-xl font-medium text-morandi-midnightBlue dark:text-morandi-cream hover:bg-morandi-sage/5 transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateYear}
                    className="flex-1 py-3 bg-morandi-midnightBlue text-morandi-cream rounded-xl font-bold hover:bg-opacity-90 transition-all"
                  >
                    创建
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
