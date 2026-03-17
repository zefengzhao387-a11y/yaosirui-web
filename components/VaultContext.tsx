"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface VaultContextValue {
  isUnlocked: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  getPassword: () => string | null;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  // 自动上锁：15 分钟后清除
  useEffect(() => {
    if (!isUnlocked) return;
    const id = setTimeout(() => {
      setIsUnlocked(false);
      setPassword(null);
    }, 15 * 60 * 1000);
    return () => clearTimeout(id);
  }, [isUnlocked]);

  const unlock = useCallback(async (pwd: string) => {
    try {
      const res = await fetch("/api/vault/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        return false;
      }
      setIsUnlocked(true);
      setPassword(pwd);
      return true;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setPassword(null);
  }, []);

  const getPassword = useCallback(() => password, [password]);

  return (
    <VaultContext.Provider value={{ isUnlocked, unlock, lock, getPassword }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}

