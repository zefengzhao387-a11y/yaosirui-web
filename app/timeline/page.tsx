"use client";

import Timeline3D from "@/components/Timeline3D";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function TimelinePage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="w-full h-screen"
      >
        <Timeline3D />
      </motion.div>
    </main>
  );
}
