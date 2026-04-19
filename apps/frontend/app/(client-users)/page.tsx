import React from "react";
import Link from "next/link";
import { Search, Building2, Home, MapPin, TrendingUp, ShieldCheck, Zap, ArrowRight, Heart } from "lucide-react";
import StartChatEmptyState from "@/components/StartChatEmptyState";
import CarouselEmbla from "@/components/CarouselEmbla";
import PromotionBento from "@/components/PromotionBento";
import PropertyCards from "@/components/PropertyCards";
import NearbyStations from "@/components/NearbyStations";
import RecentlyListed from "@/components/RecentlyListed";

export default async function HomePage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen overflow-x-hidden pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-20">        
        <CarouselEmbla />
      </section>

      {/* Promotion Bento Grid */}
      <PromotionBento />

      {/* Featured Grid */}
      <PropertyCards />

      {/* Interactive Discover Sections */}
      <React.Suspense fallback={<div className="h-20" />}>
        <NearbyStations />
      </React.Suspense>
      <RecentlyListed />

      

      {/* Services Section */}
      <section className="w-full px-6 md:px-12 lg:px-16 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center ">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">มั่งใจได้ 100%</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">ทุกประกาศผ่านการตรวจสอบข้อมูลและความถูกต้องก่อนแสดงผล</p>
          </div>
          <div className="flex flex-col items-center text-center ">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 text-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">ราคาดีที่สุด</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">เปรียบเทียบราคาที่คุ้มค่าที่สุดบนทำเลที่คุณสนใจได้ทันที</p>
          </div>
          <div className="flex flex-col items-center text-center ">
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
