import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Time Capsule: 永恒交响 (Eternal Symphony)",
  description: "基于 Next.js 15 + React 19 的交互式数字化回忆博物馆。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${playfair.variable} antialiased min-h-screen relative`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
