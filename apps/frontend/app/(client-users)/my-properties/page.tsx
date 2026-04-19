"use client";

import { useEffect, useState } from "react";
import { myPropertiesService, updatePropertyService } from "@/services/client/property";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Edit3, Trash2, PlusCircle, Loader2, Home, Search, Filter } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

type Property = {
  id: string;
  name: string;
  description: string | null;
  floor: number | null;
  startingPrice: string;
  district: string;
  province: string;
  mainImage: string | null;
  listingType: string;
  isActive: boolean;
};

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await myPropertiesService();
      setProperties(data || []);
    } catch (error) {
      console.error("Failed to fetch my properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-white/40 text-sm">กำลังโหลดข้อมูลอสังหาริมทรัพย์ของคุณ...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen pt-24 pb-20 px-4">
      {/* Glow Effects */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
              อสังหาริมทรัพย์ <span className="text-amber-500">ของฉัน</span>
            </h1>
            <p className="text-white/40 font-medium">จัดการรายการประกาศขายและเช่าทั้งหมดของคุณ</p>
          </div>
          
          <Link 
            href="/properties/create"
            className="flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0a0a0f] font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            ลงประกาศใหม่
          </Link>
        </div>

        {/* Filters/Search placeholder */}
        <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl mb-10 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 group focus-within:border-amber-500/30 transition-all">
                <Search className="w-5 h-5 text-white/20 group-focus-within:text-amber-500" />
                <input placeholder="ค้นหาประกาศเดิมของคุณ..." className="bg-transparent border-none outline-none text-white text-sm w-full" />
            </div>
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-white transition-all text-sm">
                    <Filter className="w-4 h-4" />
                    คัดกรอง
                </button>
                <div className="text-white/20 text-xs ml-4">
                    แสดงทั้งหมด <span className="text-white font-bold">{properties.length}</span> รายการ
                </div>
            </div>
        </div>

        {/* Content Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="group bg-[#111118] border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
                {/* Image Section */}
                <div className="relative aspect-video overflow-hidden">
                  {property.mainImage ? (
                    <img 
                      src={`http://localhost:4000/${property.mainImage}`} 
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10 group-hover:bg-white/10 transition-colors">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-amber-500 border border-amber-500/20 uppercase tracking-widest">
                      {property.listingType || "Sale"}
                    </div>
                    {property.isActive ? (
                        <div className="bg-green-500/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-green-500 border border-green-500/20 uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Active
                        </div>
                    ) : (
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white/40 border border-white/10 uppercase tracking-widest">
                            Inactive
                        </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors tracking-tight">
                    {property.name || "โครงการไม่มีชื่อ"}
                  </h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5 text-amber-500/50" />
                    <span className="line-clamp-1">{[property.district, property.province].filter(Boolean).join(", ") || "ไม่ได้ระบุทำเล"}</span>
                  </div>
                  <p className="text-sm text-white/30 line-clamp-2 mb-6 leading-relaxed flex-1">
                    {property.description || "ไม่มีรายละเอียดเพิ่มเติมสำหรับประกาศนี้"}
                  </p>
                  
                  <div className="flex items-end justify-between pt-6 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Starting Price</p>
                      <p className="text-lg font-black text-white">
                        {Intl.NumberFormat("th-TH").format(Number(property.startingPrice) || 0)} <span className="text-xs text-white/40 ml-1">บาท</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={() => router.push(`/properties/listing/${property.id}/edit`)}
                          className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(property.id)}
                          className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-[#111118]/50 rounded-3xl border border-white/5 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
              <Home className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีโครงการของคุณ</h3>
            <p className="text-white/40 text-sm mb-8">เริ่มสร้างรายได้ด้วยการลงประกาศโครงการแรกของคุณเลย!</p>
            <Link 
              href="/properties/create"
              className="bg-amber-500 text-[#0a0a0f] font-bold px-8 py-3 rounded-xl hover:bg-amber-400 transition-all active:scale-95"
            >
              เริ่มลงประกาศ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
