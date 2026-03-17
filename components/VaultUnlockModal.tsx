"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useVault } from "./VaultContext";

type Mode = "pin" | "pattern";

interface VaultUnlockModalProps {
  open: boolean;
  onClose: () => void;
}

export function VaultUnlockModal({ open, onClose }: VaultUnlockModalProps) {
  const { unlock } = useVault();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pin");
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [firstPwd, setFirstPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingFirst, setSavingFirst] = useState(false);

  useEffect(() => {
    if (!open) return;
    setChecking(true);
    setError(null);
    fetch("/api/vault/password")
      .then((res) => res.json().catch(() => ({ hasPassword: false })))
      .then((data) => {
        setHasPassword(!!data?.hasPassword);
      })
      .catch(() => {
        setHasPassword(false);
      })
      .finally(() => setChecking(false));
  }, [open]);

  if (!open) return null;

  const pinValue = pin.join("");

  const handleChangePin = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const next = [...pin];
    next[index] = value.replace(/\s/g, "");
    setPin(next);
    setError(null);
    if (value && index < pin.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    // 首次设置密码
    if (hasPassword === false) {
      if (!firstPwd || firstPwd.length < 4) {
        setError("新阁楼密码至少 4 位。");
        return;
      }
      if (firstPwd !== confirmPwd) {
        setError("两次输入的密码不一致。");
        return;
      }
      setSavingFirst(true);
      try {
        const res = await fetch("/api/vault/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: firstPwd }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          setError(data?.error || "设置阁楼密码失败，请稍后重试。");
          return;
        }
        const ok = await unlock(firstPwd);
        if (ok) {
          onClose();
          router.push("/vault");
        } else {
          setError("密码已设置，但解锁失败，请重新尝试进入阁楼。");
        }
      } finally {
        setSavingFirst(false);
      }
      return;
    }

    // 已有密码，走 PIN 解锁
    if (mode === "pin") {
      if (pinValue.length < 4) {
        setError("请输入至少 4 位数字密码。");
        return;
      }
      setSubmitting(true);
      try {
        const ok = await unlock(pinValue);
        if (!ok) {
          setError("阁楼密码错误，请重试。");
          setPin(["", "", "", "", "", ""]);
          inputsRef.current[0]?.focus();
          return;
        }
        onClose();
        router.push("/vault");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-white/12 bg-gradient-to-b from-zinc-900/95 to-black/95 shadow-[0_0_60px_rgba(0,0,0,0.9)] px-6 py-7 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif text-white">
              {hasPassword === false ? "设置阁楼密码" : "解锁密闭阁楼"}
            </h2>
            <p className="text-[11px] text-white/50 mt-1">
              记忆已被 256 位加密保护，只有你能开启这段旋律。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white"
          >
            关闭
          </button>
        </div>

        {hasPassword && (
          <div className="flex items-center gap-2 text-[11px] bg-white/5 rounded-full p-1 w-fit">
            <button
              type="button"
              onClick={() => setMode("pin")}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === "pin"
                  ? "bg-white text-black font-medium"
                  : "text-white/70 hover:text-white"
              }`}
            >
              数字 PIN 码
            </button>
            <button
              type="button"
              onClick={() => setMode("pattern")}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === "pattern"
                  ? "bg-white text-black font-medium"
                  : "text-white/60 hover:text-white"
              }`}
            >
              手势密码
            </button>
          </div>
        )}

        {hasPassword === null && (
          <p className="text-[11px] text-white/50 mt-2">正在检查阁楼状态...</p>
        )}

        {hasPassword === false && (
          <motion.div
            key="first-set"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-[11px] text-white/60">
              第一次进入密闭阁楼，请先为它设置一把专属密码。忘记后将无法找回。
            </p>
            <input
              type="password"
              placeholder="新阁楼密码（至少 4 位）"
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder:text-white/30"
              value={firstPwd}
              onChange={(e) => {
                setFirstPwd(e.target.value);
                setError(null);
              }}
            />
            <input
              type="password"
              placeholder="确认阁楼密码"
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder:text-white/30"
              value={confirmPwd}
              onChange={(e) => {
                setConfirmPwd(e.target.value);
                setError(null);
              }}
            />
            {error && <p className="text-[11px] text-red-400">{error}</p>}
          </motion.div>
        )}

        {hasPassword && mode === "pin" && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <motion.div
              animate={
                error
                  ? { x: [0, -8, 8, -8, 8, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              className="flex justify-between gap-2"
            >
              {pin.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 h-10 rounded-2xl bg-black/60 border border-white/15 text-center text-lg text-white focus:outline-none focus:border-morandi-sage"
                  value={v}
                  onChange={(e) => handleChangePin(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </motion.div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
          </motion.div>
        )}

        {hasPassword && mode === "pattern" && (
          <motion.div
            key="pattern"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-white/60"
          >
            手势密码将在后续版本中加入。目前请使用数字 PIN 码解锁。
          </motion.div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-full text-xs text-white/60 hover:bg-white/5"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || savingFirst || checking}
            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-morandi-cream disabled:opacity-60"
          >
            {hasPassword === false
              ? savingFirst
                ? "设置中…"
                : "设置并进入"
              : submitting
              ? "解锁中…"
              : "解锁阁楼"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

