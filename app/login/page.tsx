"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!isMounted) return;
        if (res.ok) setAlreadyLoggedIn(true);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setCheckingAuth(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAlreadyLoggedIn(false);
      router.refresh();
    } catch {
      setError("退出失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { email, password, name };

    console.log("Fetching endpoint:", endpoint);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      console.log("Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        if (text.includes("<!DOCTYPE html>")) {
          throw new Error("服务器返回了 HTML 错误页面。这通常是因为开发服务器需要重启或缓存过时，请尝试重启 npm run dev 并强制刷新浏览器 (Ctrl+F5)。");
        }
        throw new Error("服务器返回了非 JSON 响应，请检查控制台或后端日志");
      }

      if (!res.ok) {
        throw new Error(data.error || "操作失败");
      }

      if (isLogin) {
        // 登录成功
        router.push("/timeline");
        router.refresh();
      } else {
        // 注册成功
        router.push("/timeline");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl border border-white/10 z-10 bg-white/5 backdrop-blur-xl"
      >
        {checkingAuth ? (
          <div className="text-center py-8 text-gray-400">正在检查登录状态...</div>
        ) : alreadyLoggedIn ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-serif text-white mb-2">您已登录</h1>
              <p className="text-gray-400">可前往时空轴或退出后使用其他账号</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push("/timeline")}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                前往时空轴
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 border border-white/20 text-gray-300 rounded-2xl font-medium hover:bg-white/5 transition-all"
              >
                退出登录
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-white mb-2">
            {isLogin ? "欢迎回来" : "创建空间"}
          </h1>
          <p className="text-gray-400">
            {isLogin ? "进入你的永恒交响" : "开启你的记忆博物馆之旅"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
              error.includes("成功") 
                ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300 ml-1">
                  你的昵称
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                    placeholder="例如：时光旅人"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              访问密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 mt-8"
          >
            {isPending ? "正在同步..." : (isLogin ? "开启时空旅程" : "创建记忆空间")}
            {!isPending && <ArrowRight size={20} />}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            {isLogin ? "还没有账号？" : "已有账号？"}{" "}
            <span 
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 font-bold cursor-pointer hover:underline"
            >
              {isLogin ? "创建记忆空间" : "立即登录"}
            </span>
          </p>
        </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
