"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LS_KEY = "kova-icon-mode";

interface IconModeCtx { emojiMode: boolean; toggle: () => void; }
const Ctx = createContext<IconModeCtx>({ emojiMode: true, toggle: () => {} });

export function IconModeProvider({ children }: { children: React.ReactNode }) {
  const [emojiMode, setEmojiMode] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "icon") setEmojiMode(false);
  }, []);
  const toggle = () => setEmojiMode(p => {
    const next = !p;
    localStorage.setItem(LS_KEY, next ? "emoji" : "icon");
    return next;
  });
  return <Ctx.Provider value={{ emojiMode, toggle }}>{children}</Ctx.Provider>;
}

export function useIconMode() { return useContext(Ctx); }

interface IEProps {
  emoji: string;
  Icon: React.ComponentType<any>;
  size?: number;
  color?: string;
  className?: string;
}

export function IE({ emoji, Icon, size = 16, color, className }: IEProps) {
  const { emojiMode } = useIconMode();
  if (emojiMode) return <span style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center" }}>{emoji}</span>;
  return <Icon size={size} color={color} className={className} />;
}
