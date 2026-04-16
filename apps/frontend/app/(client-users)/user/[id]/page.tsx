"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/services/client/users";
import PropertyCard from "@/components/PropertyCard";
import { motion } from "framer-motion";
import { User, Phone, CheckCircle, ArrowLeft, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await userService.getPublicProfile(Number(id));
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch public profile", error);
        toast.error("ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <User size={64} className="text-neutral-700 mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">ไม่พบข้อมูลโปรไฟล์</h2>
        <p className="text-neutral-500 mb-6">บัญชีผู้ใช้นี้อาจถูกลบหรือไม่มีอยู่จริง</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} /> ย้อนกลับ
        </button>
      </div>
    );
  }

  const { user, properties } = profileData;
  const isVerified = user.verification === 'verified';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "ผู้ใช้ไม่ระบุชื่อ";
  const userImage = user.imagePath ? `http://localhost:4000/${user.imagePath.replace(/\\/g, '/')}` : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb / Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8 w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>ย้อนกลับ</span>
        </button>

        {/* Hero Profile Section */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A1E] to-[#0F0F12] border border-white/[0.05] shadow-2xl mb-12"
        >
           {/* Abstract Background Decoration */}
           <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

           <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#202024] shadow-2xl overflow-hidden bg-[#202024] flex items-center justify-center relative z-10">
                    <img 
                      src={userImage || "/images/userIcon.png"} 
                      alt={fullName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/userIcon.png";
                      }}
                    />
                 </div>
                 {/* Verification Badge */}
                 {isVerified && (
                   <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center border-4 border-[#1A1A1E] z-20 shadow-lg text-white" title="ยืนยันตัวตนแล้ว">
                     <CheckCircle size={16} />
                   </div>
                 )}
              </div>

              {/* User Details */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-2 md:mt-4">
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
                   {fullName}
                 </h1>
                 
                 {user.username && fullName !== user.username && (
                   <p className="text-neutral-400 font-medium mb-4">@{user.username}</p>
                 )}

                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-neutral-300">
                       <Building2 size={16} className="text-neutral-500" />
                       <span className="font-semibold text-white">{properties?.length || 0}</span> ประกาศ
                    </div>
                    {user.phoneNumber && (
                       <a href={`tel:${user.phoneNumber}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400 hover:bg-orange-500/20 transition-colors">
                          <Phone size={16} />
                          <span>{user.phoneNumber}</span>
                       </a>
                    )}
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Listings Section */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">รายการประกาศทั้งหมดของ {fullName.split(' ')[0]}</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2A2A35] to-transparent ml-4" />
           </div>

           {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {properties.map((property: any) => (
                    <motion.div
                       key={property.id}
                       initial={{ opacity: 0, y: 10 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                    >
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
              </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-24 bg-[#1A1A1E]/30 rounded-3xl border border-dashed border-neutral-800">
               <Building2 size={48} className="text-neutral-700 mb-4" />
               <p className="text-neutral-400 font-medium">ยังไม่มีรายการประกาศอสังหาฯ ในขณะนี้</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
