"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass px-8 py-3 rounded-full border border-morandi-sage/20">
        <Link href="/" className="text-2xl font-serif text-morandi-midnightBlue dark:text-morandi-cream">
          永恒交响
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/timeline" 
            className="text-morandi-midnightBlue dark:text-morandi-cream hover:text-morandi-sage transition-colors text-sm font-medium"
          >
            多维时空轴
          </Link>
          {["影廊", "心语", "阁楼", "留言"].map((item) => (
            <Link 
              key={item} 
              href={`#${item}`} 
              className="text-morandi-midnightBlue dark:text-morandi-cream hover:text-morandi-sage transition-colors text-sm font-medium"
            >
              {item}
            </Link>
          ))}
          <Link 
            href="/login" 
            className="bg-morandi-midnightBlue text-morandi-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all"
          >
            开始使用
          </Link>
        </div>

        {/* Mobile Nav */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-6 right-6 glass p-8 rounded-3xl md:hidden flex flex-col gap-6"
        >
          {["影廊", "心语", "阁楼", "留言"].map((item) => (
            <Link 
              key={item} 
              href={`#${item}`} 
              className="text-xl font-serif text-morandi-midnightBlue dark:text-morandi-cream"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
