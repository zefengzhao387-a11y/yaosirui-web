"use client";

import { motion } from "framer-motion";
import { 
  Image as ImageIcon, 
  PenTool, 
  Lock, 
  MessageCircle, 
  Clock, 
  Sparkles 
} from "lucide-react";

const features = [
  {
    id: 1,
    title: "多维时空轴",
    description: "星云式或螺旋式的 3D 时间轴。在星空中航行，进入不同的年份星团。",
    icon: <Clock size={24} />,
    color: "bg-morandi-sage/20",
    accent: "text-morandi-sage",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    title: "情感气泡",
    description: "日记不再是枯燥的文字块，而是呈现出不同颜色和跳动频率的动态气泡。",
    icon: <Sparkles size={24} />,
    color: "bg-morandi-dustyPink/20",
    accent: "text-morandi-dustyPink",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 3,
    title: "AI 叙事辅助",
    description: "AI 自动提取照片颜色和元素，生成极具诗意的引言或背景音乐。",
    icon: <ImageIcon size={24} />,
    color: "bg-morandi-coolGray/20",
    accent: "text-morandi-coolGray",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    title: "数字遗产锁",
    description: "设定未来信件，在特定的日期才允许开启，实现跨越时空的情感寄托。",
    icon: <Lock size={24} />,
    color: "bg-morandi-midnightBlue/20",
    accent: "text-white",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    id: 5,
    title: "心语瓶",
    description: "支持 Markdown 排版，可添加实时天气和地理位置印章。",
    icon: <PenTool size={24} />,
    color: "bg-morandi-warmBeige/20",
    accent: "text-morandi-warmBeige",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 6,
    title: "访客留言墙",
    description: "亲友可以留言并投递老照片，共同构建生命的回忆桥梁。",
    icon: <MessageCircle size={24} />,
    color: "bg-white/5",
    accent: "text-white/60",
    className: "md:col-span-1 md:row-span-1",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
          核心模块
        </h2>
        <p className="text-morandi-sage max-w-xl mx-auto opacity-80">
          每一处细节，都为了更完美地记录与展示你珍贵的生命印记。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-8 rounded-[2rem] overflow-hidden group border border-white/5
              ${feature.color} backdrop-blur-xl text-white
              ${feature.className}
              hover:border-white/20 transition-all duration-500 cursor-default shadow-2xl
            `}
          >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${feature.accent}`}>
              {feature.icon}
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className={`mb-6 bg-white/5 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 ${feature.accent}`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-serif mb-3 tracking-wide">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-[280px] font-sans">
                {feature.description}
              </p>
            </div>
            
            {/* Hover decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
