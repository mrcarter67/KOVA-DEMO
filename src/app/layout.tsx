import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "KOVA — AI-Native CRM",
  description: "AI-powered business intelligence for every vertical",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning><Providers>{children}</Providers></body>
    </html>
  );
}
