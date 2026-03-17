"use client";

import { useEffect, useState } from "react";
import { useVault } from "@/components/VaultContext";
import { decryptText } from "@/lib/vaultCrypto";
import { motion } from "framer-motion";

interface VaultMemory {
  id: string;
  title: string;
  date: string;
  ciphertext: string;
  iv: string;
  salt: string;
}

export default function VaultPage() {
  const { getPassword } = useVault();
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<VaultMemory[]>([]);
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});

  useEffect(() => {
    const run = async () => {
      const pwd = getPassword();
      if (!pwd) return;

      setLoading(true);
      try {
        const res = await fetch("/api/memories?all=1&vault=1");
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.memories) return;
        const vaultList: VaultMemory[] = (data.memories as any[])
          .filter((m) => m.encrypted && m.ciphertext && m.iv && m.salt)
          .map((m) => ({
            id: m.id,
            title: m.title,
            date: m.date,
            ciphertext: m.ciphertext,
            iv: m.iv,
            salt: m.salt,
          }));
        setMemories(vaultList);

        const map: Record<string, string> = {};
        for (const m of vaultList) {
          try {
            map[m.id] = await decryptText(m.ciphertext, pwd, m.iv, m.salt);
          } catch {
            map[m.id] = "[解密失败，可能阁楼密码已修改后保存的数据]";
          }
        }
        setDecrypted(map);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [getPassword]);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif mb-2">密闭阁楼</h1>
        <p className="text-morandi-sage/80 text-sm mb-8">
          只有使用你的阁楼密码才能解锁这里的记忆。内容已在浏览器本地解密，服务器和数据库看不到明文。
        </p>

        {loading && <p className="text-sm text-white/60 mb-4">正在解锁你的密闭阁楼...</p>}

        {memories.length === 0 && !loading ? (
          <p className="text-sm text-white/50">当前还没有存入密闭阁楼的心语。</p>
        ) : (
          <div className="space-y-4">
            {memories.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-serif">{m.title || "无题心语"}</h2>
                  <span className="text-xs text-white/50 tracking-[0.2em]">{m.date}</span>
                </div>
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {decrypted[m.id] ?? "正在解密..."}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

