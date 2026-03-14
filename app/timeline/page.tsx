"use client";

import Timeline3D from "@/components/Timeline3D";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function TimelinePage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* Navbar will handle fixed positioning */}
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="w-full h-screen"
      >
        <Timeline3D />
      </motion.div>
      
      {/* Side Detail Overlay (Hidden by default, could show when node clicked) */}
      {/* This is a placeholder for the future detail panel */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="flex flex-col gap-4">
          {["2020", "2021", "2022", "2023", "2024"].map((year) => (
            <div key={year} className="group flex items-center gap-4 cursor-pointer pointer-events-auto">
              <span className="text-xs text-white/20 group-hover:text-morandi-sage transition-colors">{year}</span>
              <div className="w-1 h-1 bg-white/20 group-hover:bg-morandi-sage rounded-full transition-all group-hover:w-2 group-hover:h-2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
