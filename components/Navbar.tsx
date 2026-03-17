"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { VaultUnlockModal } from "./VaultUnlockModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null);
  const router = useRouter();
  const [showVaultUnlock, setShowVaultUnlock] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as { user: { id: string; email: string; name: string | null } };
        setUser(data.user);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass px-8 py-3 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
        <Link href="/" className="text-2xl font-serif text-white hover:opacity-80 transition-opacity">
          永恒交响
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link 
            href="/timeline" 
            className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide"
          >
            多维时空轴
          </Link>
          <Link href="/gallery" className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide">
            影廊
          </Link>
          <Link href="/journal" className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide">
            心语瓶
          </Link>
          <button
            type="button"
            onClick={() => setShowVaultUnlock(true)}
            className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide"
          >
            阁楼
          </button>
          <Link 
            href="#留言" 
            className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide"
          >
            留言
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white/70 text-sm">
                {user.name || user.email}
              </span>
              <Link
                href="/dashboard"
                className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-morandi-cream transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                个人主页
              </Link>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-white text-black px-8 py-2.5 rounded-full text-sm font-bold hover:bg-morandi-cream transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              开始使用
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-28 left-6 right-6 glass p-10 rounded-[2rem] md:hidden flex flex-col gap-8 bg-black/60 backdrop-blur-2xl border border-white/10 shadow-3xl"
        >
          <Link href="/timeline" className="text-2xl font-serif text-white hover:text-morandi-sage transition-colors" onClick={() => setIsOpen(false)}>
            多维时空轴
          </Link>
          <Link href="/gallery" className="text-2xl font-serif text-white hover:text-morandi-sage transition-colors" onClick={() => setIsOpen(false)}>
            影廊
          </Link>
          <Link href="/journal" className="text-2xl font-serif text-white hover:text-morandi-sage transition-colors" onClick={() => setIsOpen(false)}>
            心语瓶
          </Link>
          <button
            type="button"
            className="text-2xl font-serif text-white hover:text-morandi-sage transition-colors text-left"
            onClick={() => {
              setIsOpen(false);
              setShowVaultUnlock(true);
            }}
          >
            阁楼
          </button>
          <Link href="#留言" className="text-2xl font-serif text白 hover:text-morandi-sage transition-colors" onClick={() => setIsOpen(false)}>
            留言
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="w-full py-4 bg-white text-black text-center rounded-2xl font-bold text-lg mb-2"
                onClick={() => setIsOpen(false)}
              >
                个人主页
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 border border-white/30 text-white text-center rounded-2xl font-medium text-base"
              >
                退出登录
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="w-full py-4 bg-white text-black text-center rounded-2xl font-bold text-lg"
              onClick={() => setIsOpen(false)}
            >
              开始使用
            </Link>
          )}
        </motion.div>
      )}
      <VaultUnlockModal open={showVaultUnlock} onClose={() => setShowVaultUnlock(false)} />
    </nav>
  );
}
