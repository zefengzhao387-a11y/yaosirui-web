"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    // Simulating login - would call Server Action or API
    setTimeout(() => {
      window.location.href = "/timeline";
      setIsPending(false);
    }, 1500);
  };

  return (
    <main className="relative min-h-screen bg-morandi-cream dark:bg-morandi-midnightBlue flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl border border-morandi-sage/20"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-morandi-midnightBlue dark:text-morandi-cream mb-2">
            欢迎回来
          </h1>
          <p className="text-morandi-sage">进入你的永恒交响</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-morandi-midnightBlue dark:text-morandi-cream/80 ml-1">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-morandi-sage" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-morandi-sage/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-morandi-sage transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-morandi-midnightBlue dark:text-morandi-cream/80 ml-1">
              访问密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-morandi-sage" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-morandi-sage/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-morandi-sage transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            className="w-full py-4 bg-morandi-midnightBlue text-morandi-cream rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg mt-8"
          >
            {isPending ? "正在同步记忆..." : "开启时空旅程"}
            {!isPending && <ArrowRight size={20} />}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-morandi-sage">
          <p>
            还没有账号？{" "}
            <span className="text-morandi-midnightBlue dark:text-morandi-cream font-bold cursor-pointer hover:underline">
              创建记忆空间
            </span>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
