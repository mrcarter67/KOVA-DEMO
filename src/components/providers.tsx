"use client";
import { IconModeProvider } from "@/lib/icon-mode";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <IconModeProvider>{children}</IconModeProvider>;
}
