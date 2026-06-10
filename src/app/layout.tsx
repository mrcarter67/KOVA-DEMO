import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOVA — AI-Native CRM",
  description: "AI-powered business intelligence for every vertical",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
