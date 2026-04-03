import Link from "next/link";
import { Search, Building2, Home, MapPin, TrendingUp, ShieldCheck, Zap, ArrowRight, Heart } from "lucide-react";
import StartChatEmptyState from "@/components/StartChatEmptyState";
import CarouselEmbla from "@/components/CarouselEmbla";
import PromotionBento from "@/components/PromotionBento";
import PropertyCards from "@/components/PropertyCards";

export default async function HomePage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      
      <section className="relative overflow-hidden mb-20">        
        <CarouselEmbla />
      </section>

      {/* Promotion Bento Grid */}
      <PromotionBento />

      {/* Featured Grid */}
      <PropertyCards />

      

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">มั่งใจได้ 100%</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">ทุกประกาศผ่านการตรวจสอบข้อมูลและความถูกต้องก่อนแสดงผล</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 text-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">ราคาดีที่สุด</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">เปรียบเทียบราคาที่คุ้มค่าที่สุดบนทำเลที่คุณสนใจได้ทันที</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">ครบทุกโครงการ</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">รวบรวมกว่าพันโครงการทั่วประเทศไทย ครอบคลุมทุกความต้องการ</p>
          </div>
        </div>
      </section>
    </div>
  );
}
