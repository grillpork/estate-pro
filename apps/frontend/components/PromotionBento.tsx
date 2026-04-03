"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Crown, ArrowUpRight, Gift, Star, ShieldCheck } from "lucide-react";

const promotions = [
  {
    id: 1,
    title: "โปรโมชั่นสุดพิเศษ ผ่อนต่ำเพียง 9,900.-",
    description: "โครงการคุณภาพบนทำเลศักยภาพ พร้อมส่วนลดสูงสุด 500,000 บาท*",
    image: "/promo-1.png",
    category: "HOT DEAL",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-amber-500/20 to-black/40",
  },
  {
    id: 2,
    title: "โครงการใหม่ ติด MRT",
    description: "เริ่มเพียง 2.99 ล้านบาท* ใกล้รถไฟฟ้าสายสีน้ำเงินและส้ม",
    image: "https://reroom.ai/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FFV8miKNd3yFQsUZdiZHNqQ%2F940f8c5e-3a14-4ed1-b4f0-dc66f2b34700%2Fpublic&w=1920&q=75",
    category: "NEW LAUNCH",
    icon: <Crown className="w-5 h-5 text-purple-500" />,
    className: "md:col-span-2 md:row-span-1 bg-gradient-to-br from-purple-500/10 to-black/40",
  },
  {
    id: 3,
    title: "Verified Partner",
    description: "มั่นใจได้ 100% กับโครงการที่ผ่านการรับรอง",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    className: "md:col-span-1 md:row-span-1 bg-gradient-to-br from-emerald-500/10 to-black/40 flex flex-col justify-center items-center text-center p-6",
  },
  {
    id: 4,
    title: "Exclusive Gift",
    description: "จองเลย! รับ iPhone 16 Pro Max ทุกยูนิต*",
    icon: <Gift className="w-5 h-5 text-rose-500" />,
    className: "md:col-span-1 md:row-span-1 bg-gradient-to-br from-rose-500/10 to-black/40 flex flex-col justify-center items-center text-center p-6",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

export default function PromotionBento() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 bg-amber-500 rounded-full" />
        <h2 className="text-2xl font-bold text-white tracking-tight">แคมเปญพิเศษประจำเดือน</h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full md:h-[600px]"
      >
        {promotions.map((promo) => (
          <motion.div
            key={promo.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border border-white/5 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60 ${promo.className}`}
          >
            {/* Background Image (if exists) */}
            {promo.image && (
              <div className="absolute inset-0 z-0">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 mix-blend-overlay grayscale group-hover:grayscale-0 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
              </div>
            )}

            {/* Content Area */}
            <div className="relative z-10 h-full p-8 flex flex-col justify-end">
              {/* Category Badge */}
              {promo.category && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md w-fit">
                  {promo.icon}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                    {promo.category}
                  </span>
                </div>
              )}

              {/* Just Icon for small cards */}
              {!promo.category && (
                <div className="mb-6 h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                  {promo.icon}
                </div>
              )}

              <h3 className={`font-bold text-white mb-2 leading-tight ${promo.id === 1 ? 'text-3xl lg:text-4xl' : 'text-xl'}`}>
                {promo.title}
              </h3>
              
              <p className="text-white/40 text-sm max-w-sm font-medium leading-relaxed group-hover:text-white/60 transition-colors">
                {promo.description}
              </p>

              {/* Hover Action */}
              <div className="mt-6 flex items-center gap-2 text-white/0 group-hover:text-amber-500 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                <span className="text-xs font-bold uppercase tracking-widest">Explore More</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Glowing Border effect */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] ring-1 ring-inset ring-white/5 group-hover:ring-white/20 transition-all duration-500" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
