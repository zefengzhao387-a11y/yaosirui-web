"use client";

import React, { use, useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Music, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Stars, Html, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { getEmotionFromText, getTheme } from "@/lib/emotion";

const INITIAL_MEMORIES = [
  { id: 1, type: "image", url: "/photo1.jpg", title: "春日漫步", date: "04-12", location: "中央公园", text: "那是我们第一次一起看樱花。" },
  { id: 2, type: "image", url: "/photo2.jpg", title: "生日派对", date: "06-25", location: "秘密花园", text: "吹灭蜡烛那一刻，许下的愿望现在实现了吗？" },
  { id: 3, type: "image", url: "/photo3.jpg", title: "海边日落", date: "08-15", location: "黄金海岸", text: "夕阳把海面染成了金色。" },
  { id: 4, type: "image", url: "/photo4.jpg", title: "冬日暖阳", date: "12-24", location: "书店一角", text: "一杯热咖啡，一本书，和你。" },
  { id: 5, type: "text", title: "深夜随笔", date: "11-02", text: "时间过得好快，转眼又是一年。这一年的成长，比过去十年都要多。" },
  { id: 6, type: "image", url: "/photo1.jpg", title: "老照片", date: "02-14", location: "家中", text: "翻出了以前的照片，感触良多。" },
  { id: 7, type: "image", url: "/photo2.jpg", title: "樱花祭", date: "04-12", location: "京都", text: "漫天的樱花雨。" },
  { id: 8, type: "image", url: "/photo3.jpg", title: "海边烧烤", date: "08-15", location: "黄金海岸", text: "味道棒极了！" },
];

// 模拟相机移动组件
function CameraRig({ targetPos, onComplete, controlsRef }: { targetPos: [number, number, number] | null, onComplete: () => void, controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const targetVec = new THREE.Vector3();
  const targetCameraPos = new THREE.Vector3();

  useFrame(() => {
    if (targetPos && controlsRef.current) {
      // 目标看向点：即照片团中心
      targetVec.set(targetPos[0], targetPos[1], targetPos[2]);
      
      // 目标相机位置：计算从原点出发经过目标点的向量，并极大幅度延伸距离
      const dir = targetVec.clone().normalize();
      if (targetVec.length() < 0.1) {
        targetCameraPos.set(0, 0, 100);
      } else {
        // 延伸 100 个单位，提供极致的远距离全景质感
        targetCameraPos.copy(targetVec).add(dir.multiplyScalar(100));
      }
      
      // 平滑移动相机位置
      camera.position.lerp(targetCameraPos, 0.05);
      
      // 平滑移动 OrbitControls 的目标点
      controlsRef.current.target.lerp(targetVec, 0.05);
      controlsRef.current.update();

      // 如果非常接近目标位置，则完成飞跃并释放控制权
      if (camera.position.distanceTo(targetCameraPos) < 0.1) {
        onComplete();
      }
    }
  });
  return null;
}

function FloatingMemory({
  memory,
  position,
  onClick,
  flyTargetMemoryId,
  onTargetPosition,
}: {
  memory: any;
  position: [number, number, number];
  onClick: () => void;
  flyTargetMemoryId: string | null;
  onTargetPosition: ((x: number, y: number) => void) | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const reportedRef = useRef(false);
  const { camera, gl } = useThree();

  useFrame(() => {
    if (!flyTargetMemoryId || memory.id !== flyTargetMemoryId || !onTargetPosition || reportedRef.current) return;
    const group = groupRef.current;
    if (!group) return;
    const worldPos = new THREE.Vector3();
    group.getWorldPosition(worldPos);
    worldPos.project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    const x = rect.left + (worldPos.x + 1) * 0.5 * rect.width;
    const y = rect.top + (1 - worldPos.y) * 0.5 * rect.height;
    reportedRef.current = true;
    onTargetPosition(x, y);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        <Html transform distanceFactor={40} occlude>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-48 glass rounded-2xl overflow-hidden border border-white/20 cursor-pointer shadow-2xl"
            onClick={onClick}
          >
            {memory.type === "image" && (
              <div className="aspect-[4/3] overflow-hidden">
                <img src={memory.url} alt={memory.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3 bg-black/40 backdrop-blur-md">
              <h3 className="text-white font-serif text-sm truncate">{memory.title}</h3>
              <p className="text-white/60 text-[10px] line-clamp-1 italic">"{memory.text}"</p>
            </div>
          </motion.div>
        </Html>
      </group>
    </Float>
  );
}

// 日期星团组件
function DateCluster({
  date,
  memories,
  clusterPos,
  angle,
  onMemoryClick,
  flyTargetMemoryId,
  onTargetPosition,
}: {
  date: string;
  memories: any[];
  clusterPos: [number, number, number];
  angle: number;
  onMemoryClick: (m: any) => void;
  flyTargetMemoryId: string | null;
  onTargetPosition: ((x: number, y: number) => void) | null;
}) {
  const points = useMemo(() => {
    const count = memories.length;
    const radius = 3;
    return memories.map((_, i) => {
      // 球面坐标分布逻辑
      if (count === 1) return [0, 0, 0];
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      return [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      ];
    });
  }, [memories]);

  return (
    <group position={clusterPos} rotation={[0, Math.PI / 2 - angle, 0]}>
      {/* 日期中心标签 - 显著向上平移以避开照片球 */}
      <Html position={[0, 8, 0]} center transform distanceFactor={40}>
        <div className="bg-morandi-sage/30 backdrop-blur-xl px-6 py-2 rounded-full border border-white/20 text-white text-lg font-serif whitespace-nowrap select-none shadow-[0_0_20px_rgba(155,176,165,0.5)]">
          {date}
        </div>
      </Html>
      
      {memories.map((memory, i) => (
        <FloatingMemory
          key={memory.id}
          memory={memory}
          position={points[i] as [number, number, number]}
          onClick={() => onMemoryClick(memory)}
          flyTargetMemoryId={flyTargetMemoryId}
          onTargetPosition={onTargetPosition}
        />
      ))}
    </group>
  );
}

// Canvas 内场景：接收 flyTargetMemoryId / onTargetPosition，传给 DateCluster 以报告新卡片屏幕坐标
function TimelineScene({
  groupedMemories,
  setSelectedMemory,
  targetClusterPos,
  setTargetClusterPos,
  controlsRef,
  flyTargetMemoryId,
  onTargetPosition,
}: {
  groupedMemories: { date: string; memories: any[]; pos: [number, number, number]; angle: number }[];
  setSelectedMemory: (m: any) => void;
  targetClusterPos: [number, number, number] | null;
  setTargetClusterPos: (v: [number, number, number] | null) => void;
  controlsRef: React.RefObject<any>;
  flyTargetMemoryId: string | null;
  onTargetPosition: (x: number, y: number) => void;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={50} />
      <CameraRig targetPos={targetClusterPos} onComplete={() => setTargetClusterPos(null)} controlsRef={controlsRef} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      {groupedMemories.map((group) => (
        <DateCluster
          key={group.date}
          date={group.date}
          memories={group.memories}
          clusterPos={group.pos}
          angle={group.angle}
          onMemoryClick={setSelectedMemory}
          flyTargetMemoryId={flyTargetMemoryId}
          onTargetPosition={onTargetPosition}
        />
      ))}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={true}
        enableZoom={true}
        maxDistance={100}
        minDistance={2}
      />
    </>
  );
}

export default function ClusterPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = use(params);
  const router = useRouter();
  const [memories, setMemories] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [targetClusterPos, setTargetClusterPos] = useState<[number, number, number] | null>(null);
  const controlsRef = useRef<any>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const createImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [flyState, setFlyState] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [flyPhase, setFlyPhase] = useState<"fly" | "explode" | "cardFade" | null>(null);
  const [flyTargetMemoryId, setFlyTargetMemoryId] = useState<string | null>(null);
  const [flyStart, setFlyStart] = useState<{ startX: number; startY: number } | null>(null);
  const [flyEmotionColor, setFlyEmotionColor] = useState<string>("rgba(255,255,255,0.9)");
  const [flyEmotionGlow, setFlyEmotionGlow] = useState<string>("rgba(255,255,255,0.6)");
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const flyPositionReportedRef = useRef(false);
  const explosionParticles = useMemo(
    () =>
      Array.from({ length: 22 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
      }),
    [flyState]
  );

  useEffect(() => {
    if (flyPhase !== "explode") return;
    const t = setTimeout(() => setFlyPhase("cardFade"), 580);
    return () => clearTimeout(t);
  }, [flyPhase]);

  // 若 Canvas 未及时报告新卡片位置，超时后回退到容器中心并开始飞行
  useEffect(() => {
    if (!flyTargetMemoryId || !flyStart) return;
    const canvasRect = canvasContainerRef.current?.getBoundingClientRect();
    const fallback = () => {
      if (flyPositionReportedRef.current) return;
      setFlyState({
        ...flyStart,
        endX: canvasRect ? canvasRect.left + canvasRect.width / 2 : window.innerWidth / 2,
        endY: canvasRect ? canvasRect.top + canvasRect.height / 2 : window.innerHeight / 2,
      });
      setFlyPhase("fly");
      setFlyTargetMemoryId(null);
      setFlyStart(null);
    };
    const t = setTimeout(fallback, 800);
    return () => clearTimeout(t);
  }, [flyTargetMemoryId, flyStart]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<{
    type: "image" | "text";
    date: string;
    title: string;
    location: string;
    text: string;
    url: string;
  }>({
    type: "image",
    date: "",
    title: "",
    location: "",
    text: "",
    url: "",
  });

  const fileToDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("READ_FAILED"));
      reader.readAsDataURL(file);
    });
  };

  // 按日期分组
  const groupedMemories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    memories.forEach(m => {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });
    // 为每个日期分配一个空间位置（环形排列）
    const dates = Object.keys(groups).sort();
    const count = dates.length;
    // 动态半径：根据日期数量自动扩大环，最少 30，每增加一个日期增加约 5 个单位空间
    const ringRadius = Math.max(30, count * 8); 
    
    return dates.map((date, i) => {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      return {
        date,
        memories: groups[date],
        pos: [x, 0, z] as [number, number, number],
        angle: angle
      };
    });
  }, [memories]);

  const handleDateClick = (pos: [number, number, number]) => {
    setTargetClusterPos(pos);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ ...selectedMemory });
    setIsEditing(true);
  };

  const setEditImageUrl = (url: string) => {
    setEditForm((prev: any) => ({ ...prev, url }));
  };

  const handlePickImage = () => {
    imageFileInputRef.current?.click();
  };

  const handleImageFileChange = (file: File | null) => {
    if (!file) return;
    fileToDataUrl(file)
      .then((url) => setEditImageUrl(url))
      .catch(() => {});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handlePickCreateImage = () => {
    createImageFileInputRef.current?.click();
  };

  const handleCreateImageFileChange = (file: File | null) => {
    if (!file) return;
    fileToDataUrl(file)
      .then((url) => setCreateForm((p) => ({ ...p, url })))
      .catch(() => {});
  };

  const handleCreateMemory = async () => {
    const date = createForm.date.trim();
    const title = createForm.title.trim();
    if (!/^\d{2}-\d{2}$/.test(date)) {
      alert("日期格式应为 MM-DD");
      return;
    }
    if (!title) {
      alert("标题不能为空");
      return;
    }

    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          date,
          title,
          text: createForm.text,
          location: createForm.location,
          url: createForm.type === "image" ? createForm.url : "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error || "创建失败");
        return;
      }
      const created = data?.memory;
      if (created) {
        setMemories((prev) => [...prev, created]);
        const btnRect = createButtonRef.current?.getBoundingClientRect();
        if (btnRect) {
          flyPositionReportedRef.current = false;
          const theme = getTheme(getEmotionFromText((created.title || "") + " " + (created.text || "")));
          setFlyEmotionColor(theme.color);
          setFlyEmotionGlow(theme.glowColor);
          setFlyStart({ startX: btnRect.left + btnRect.width / 2, startY: btnRect.top + btnRect.height / 2 });
          setFlyTargetMemoryId(created.id);
        }
        setIsCreating(false);
        setCreateForm({ type: "image", date: "", title: "", location: "", text: "", url: "" });
        setToastMessage("已化作情感气泡，可在首页情感场域查看");
        setTimeout(() => setToastMessage(null), 3200);
      } else {
        setIsCreating(false);
        setCreateForm({ type: "image", date: "", title: "", location: "", text: "", url: "" });
      }
    } catch {
      alert("创建失败");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/memories/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          text: editForm.text,
          location: editForm.location,
          url: editForm.url,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error || "保存失败");
        return;
      }

      setMemories((prev) => prev.map((m) => (m.id === editForm.id ? editForm : m)));
      setSelectedMemory(editForm);
      setIsEditing(false);
    } catch {
      alert("保存失败");
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/memories?year=${year}`)
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          setMemories([]);
          return;
        }
        const data = (await res.json()) as { memories: any[] };
        setMemories(data.memories || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setMemories([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="w-full h-screen bg-[#050505] overflow-hidden relative">
      {/* 3D Space - 降低 z-index 确保 UI 在上 */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]} gl={{ antialias: true }} style={{ pointerEvents: 'auto' }}>
          <TimelineScene
            groupedMemories={groupedMemories}
            setSelectedMemory={setSelectedMemory}
            targetClusterPos={targetClusterPos}
            setTargetClusterPos={setTargetClusterPos}
            controlsRef={controlsRef}
            flyTargetMemoryId={flyTargetMemoryId}
            onTargetPosition={(x, y) => {
              flyPositionReportedRef.current = true;
              if (flyStart) {
                setFlyState({ ...flyStart, endX: x, endY: y });
                setFlyPhase("fly");
                setFlyTargetMemoryId(null);
                setFlyStart(null);
              }
            }}
          />
        </Canvas>
      </div>

      <div className="fixed top-8 left-8 z-[9999] pointer-events-auto">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push("/timeline");
          }}
          className="cursor-pointer flex items-center gap-2 text-morandi-sage hover:text-white transition-colors group bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          返回星空
        </button>
      </div>

      {/* UI Overlay - 提高 z-index 并确保点击区域正确 */}
      <div className="absolute inset-0 z-50 pointer-events-none p-8 flex flex-col">
        <div className="flex items-center justify-between pointer-events-none">
          <div className="text-right">
            <h1 className="text-7xl font-serif text-white opacity-20">{year}</h1>
            <p className="text-morandi-sage uppercase tracking-[0.3em] text-xs">Memory Cluster Spheres</p>
          </div>
        </div>

        {/* 右侧日期导航 */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-50">
          <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold text-right">Navigate Dates</div>
          {groupedMemories.map((group) => (
            <motion.button
              key={group.date}
              whileHover={{ x: -5, backgroundColor: "rgba(255,255,255,0.2)" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateClick(group.pos);
              }}
              className="flex items-center justify-end gap-3 px-5 py-2.5 rounded-full border border-white/20 glass text-white/70 hover:text-white transition-all group shadow-lg"
            >
              <span className="text-xs font-serif">{group.date}</span>
              <div className="w-2 h-2 rounded-full bg-morandi-sage group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(155,176,165,0.8)]" />
            </motion.button>
          ))}
        </div>

        {memories.length === 0 && !isCreating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="glass px-10 py-8 rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur-xl text-center">
              <div className="text-white text-2xl font-serif mb-2">这个年份还没有记忆</div>
              <div className="text-white/60 text-sm mb-6">添加第一条记忆，让星团亮起来</div>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-morandi-cream transition-all"
              >
                添加记忆
              </button>
            </div>
          </div>
        )}

        {!isCreating && (
          <div className="absolute bottom-10 right-10 pointer-events-auto z-50">
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="glass px-6 py-3 rounded-full text-white/80 hover:text-white border border-white/10 bg-black/30 backdrop-blur-xl transition-all"
            >
              + 添加记忆
            </button>
          </div>
        )}

        <div className="mt-auto flex justify-between items-end">
          <div className="glass px-6 py-3 rounded-2xl text-white/40 text-[10px] max-w-xs border-white/5">
            同一天的记忆在星空中凝聚成星团。点击右侧日期，快速穿梭于不同的时光节点。
          </div>
        </div>
      </div>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && !isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900/50 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Area */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[400px]">
                {selectedMemory.type === "image" ? (
                  <img 
                    src={selectedMemory.url} 
                    alt={selectedMemory.title} 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-morandi-sage/40 font-serif text-4xl italic p-12 text-center">
                    "{selectedMemory.text}"
                  </div>
                )}
                <button 
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all md:hidden"
                >
                  <X />
                </button>
              </div>

              {/* Info Area */}
              <div className="w-full md:w-96 p-8 md:p-12 flex flex-col justify-between bg-zinc-900 text-white">
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-morandi-sage mb-2">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">{year}-{selectedMemory.date}</span>
                      </div>
                      <h2 className="text-3xl font-serif text-white">{selectedMemory.title}</h2>
                    </div>
                    <button 
                      onClick={() => setSelectedMemory(null)}
                      className="hidden md:flex w-10 h-10 bg-white/5 rounded-full items-center justify-center text-white hover:bg-white/10 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-morandi-sage/60">
                    <MapPin size={16} />
                    <span className="text-sm">{selectedMemory.location || "未知地点"}</span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-morandi-sage">Memory Story</h4>
                    <p className="text-white/80 leading-relaxed italic text-lg">
                      {selectedMemory.text}
                    </p>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <button className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-morandi-cream transition-all">
                    <Music size={20} /> 聆听当时的声音
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleEditClick}
                      className="py-3 border border-white/10 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 transition-all"
                    >
                      编辑信息
                    </button>
                    <button className="py-3 border border-white/10 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 transition-all">
                      分享记忆
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Memory Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 w-full max-w-xl max-h-[85vh] rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
            >
              <h2 className="text-xl font-serif py-4 px-6 text-white border-b border-white/10 flex-shrink-0">编辑记忆笔记</h2>
              <div className="overflow-y-auto flex-1 min-h-0 p-6 space-y-4">
                {editForm?.type === "image" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">照片</label>
                    <div className="aspect-[3/4] max-h-44 w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                      {editForm.url ? (
                        <img
                          src={editForm.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-white/60">
                          暂无照片
                        </div>
                      )}
                    </div>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e.target.files?.[0] ?? null)}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePickImage}
                        className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-morandi-cream transition-all"
                      >
                        选择照片
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditImageUrl("")}
                        className="px-5 py-3 border border-white/10 rounded-xl font-medium text-white/60 hover:bg-white/5 transition-all"
                      >
                        清空
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="也可以粘贴图片 URL"
                      value={editForm.url || ""}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">标题</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">日期</label>
                    <input 
                      type="text" 
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">地点</label>
                    <input 
                      type="text" 
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">记忆故事</label>
                  <textarea 
                    rows={4}
                    value={editForm.text}
                    onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-4 p-6 border-t border-white/10 flex-shrink-0">
                <button 
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 border border-white/10 rounded-xl font-medium text-white/60 hover:bg-white/5 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-morandi-cream transition-all"
                >
                  确认保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-zinc-900 w-full max-w-xl max-h-[85vh] rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
            >
              <h2 className="text-xl font-serif py-4 px-6 text-white border-b border-white/10 flex-shrink-0">添加记忆</h2>
              <div className="overflow-y-auto flex-1 min-h-0 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateForm((p) => ({ ...p, type: "image" }))}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      createForm.type === "image"
                        ? "bg-white text-black"
                        : "border border-white/10 text-white/60 hover:bg-white/5"
                    }`}
                  >
                    图片记忆
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm((p) => ({ ...p, type: "text", url: "" }))}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      createForm.type === "text"
                        ? "bg-white text-black"
                        : "border border-white/10 text-white/60 hover:bg-white/5"
                    }`}
                  >
                    文本记忆
                  </button>
                </div>

                {createForm.type === "image" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">照片</label>
                    <div className="aspect-[3/4] max-h-44 w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                      {createForm.url ? (
                        <img src={createForm.url} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-white/60">
                          暂无照片
                        </div>
                      )}
                    </div>
                    <input
                      ref={createImageFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCreateImageFileChange(e.target.files?.[0] ?? null)}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePickCreateImage}
                        className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-morandi-cream transition-all"
                      >
                        选择照片
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateForm((p) => ({ ...p, url: "" }))}
                        className="px-5 py-3 border border-white/10 rounded-xl font-medium text-white/60 hover:bg-white/5 transition-all"
                      >
                        清空
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="也可以粘贴图片 URL"
                      value={createForm.url}
                      onChange={(e) => setCreateForm((p) => ({ ...p, url: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">日期 (MM-DD)</label>
                    <input
                      type="text"
                      value={createForm.date}
                      onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">地点</label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">标题</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-morandi-sage uppercase tracking-widest mb-2">记忆故事</label>
                  <textarea
                    rows={4}
                    value={createForm.text}
                    onChange={(e) => setCreateForm((p) => ({ ...p, text: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-morandi-sage/50"
                  />
                </div>
              </div>
              <div className="flex gap-4 p-6 border-t border-white/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl font-medium text-white/60 hover:bg-white/5 transition-all"
                >
                  取消
                </button>
                <button
                  ref={createButtonRef}
                  type="button"
                  onClick={handleCreateMemory}
                  className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-morandi-cream transition-all"
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 创建后：从按钮飞向星空 + 拖尾 + 终点爆炸粒子 + 卡片淡出 */}
      <AnimatePresence>
        {flyState && flyPhase && (
          <div className="fixed inset-0 z-[115] pointer-events-none">
            {/* 阶段一：飞行 — 拖尾 + 主圆点（终点更大） */}
            {flyPhase === "fly" && (
              <>
                {[0.06, 0.12, 0.18, 0.24, 0.3].map((delay, i) => {
                  const size = 12 + i * 2;
                  return (
                    <motion.div
                      key={`tail-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: size,
                        height: size,
                        marginLeft: -size / 2,
                        marginTop: -size / 2,
                        backgroundColor: flyEmotionColor,
                        boxShadow: `0 0 12px ${flyEmotionGlow}`,
                      }}
                      initial={{ left: flyState.startX, top: flyState.startY, scale: 0.3, opacity: 0.8 - i * 0.12 }}
                      animate={{
                        left: flyState.endX,
                        top: flyState.endY,
                        scale: 0.6 + i * 0.1,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 1.15,
                        delay,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    />
                  );
                })}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 36,
                    height: 36,
                    marginLeft: -18,
                    marginTop: -18,
                    backgroundColor: flyEmotionColor,
                    boxShadow: `0 0 32px ${flyEmotionGlow}`,
                  }}
                  initial={{ left: flyState.startX, top: flyState.startY, scale: 0.4, opacity: 1 }}
                  animate={{
                    left: flyState.endX,
                    top: flyState.endY,
                    scale: 1.6,
                    opacity: 1,
                  }}
                  transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                  onAnimationComplete={() => setFlyPhase("explode")}
                />
              </>
            )}

            {/* 阶段二：到达终点 — 爆炸粒子 */}
            {flyPhase === "explode" && (
              <>
                {explosionParticles.map((p, i) => (
                  <motion.div
                    key={`exp-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      marginLeft: -4,
                      marginTop: -4,
                      left: flyState.endX,
                      top: flyState.endY,
                      backgroundColor: flyEmotionColor,
                      boxShadow: `0 0 8px ${flyEmotionGlow}`,
                    }}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 0.95 }}
                    animate={{
                      x: p.dx,
                      y: p.dy,
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.52,
                      delay: i * 0.012,
                      ease: [0.2, 0.8, 0.2, 1],
                    }}
                  />
                ))}
              </>
            )}

            {/* 阶段三：粒子消失后 — 卡片形状淡出 */}
            {flyPhase === "cardFade" && (
              <motion.div
                className="absolute rounded-2xl backdrop-blur-sm border border-white/30"
                style={{
                  width: 120,
                  height: 80,
                  left: flyState.endX,
                  top: flyState.endY,
                  marginLeft: -60,
                  marginTop: -40,
                  backgroundColor: flyEmotionColor,
                  boxShadow: `0 0 40px ${flyEmotionGlow}`,
                }}
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onAnimationComplete={() => {
                  setFlyState(null);
                  setFlyPhase(null);
                  setFlyEmotionColor("rgba(255,255,255,0.9)");
                  setFlyEmotionGlow("rgba(255,255,255,0.6)");
                }}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 保存成功：已化作情感气泡 提示 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-white text-sm shadow-xl"
          >
            {toastMessage}
            <a
              href="/#emotion"
              className="ml-2 text-morandi-sage hover:underline"
            >
              前往情感场域 →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
