"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  MapPin, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Zap,
  Building2,
  TrendingUp,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMyProperties = async () => {
    try {
      const response = await api.get("/properties/my");
      setProperties(response.data);
    } catch (error) {
      console.error("Failed to fetch my properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/properties/${id}`);
      fetchMyProperties();
    } catch (error) {
       console.error("Failed to delete property:", error);
       alert("Error deleting property");
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pb-32">
      <Navbar />

      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-linear-to-b from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Zap size={12} /> Dashboard
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-4">
                MY <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600 uppercase italic">LISTINGS</span>
              </h1>
              <p className="text-white/40 text-sm font-medium">Manage and monitor the performance of your real estate portfolio.</p>
            </div>
            
            <Link 
              href="/properties/create"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-amber-500 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-2xl shadow-white/5"
            >
              <Plus size={20} /> ลงประกาศใหม่
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
             <div className="p-8 rounded-[2rem] bg-white/3 border border-white/5 backdrop-blur-xl">
                <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Total Listings</div>
                <div className="text-4xl font-black text-white italic">{properties.length}</div>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                   <TrendingUp size={14} /> Active now
                </div>
             </div>
             <div className="p-8 rounded-[2rem] bg-white/3 border border-white/5 backdrop-blur-xl">
                <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Total Views</div>
                <div className="text-4xl font-black text-white italic">1.2K</div>
                <div className="mt-4 flex items-center gap-2 text-amber-500 text-[10px] font-bold">
                   <Zap size={14} /> Top performing
                </div>
             </div>
             <div className="p-8 rounded-[2rem] bg-white/3 border border-white/5 backdrop-blur-xl">
                <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Verified Status</div>
                <div className="text-4xl font-black text-white italic">PRO</div>
                <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-bold">
                   <ShieldCheck size={14} /> Security check ok
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Property List Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 mt-12">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse w-full" />
              ))
            ) : properties.length > 0 ? (
              properties.map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex flex-col md:flex-row items-center bg-white/3 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all"
                >
                  <div className="w-full md:w-32 aspect-square rounded-2xl bg-white/5 overflow-hidden border border-white/5 shrink-0">
                    {property.mainImage ? (
                      <img 
                        src={`http://localhost:4000/${property.mainImage}`} 
                        alt={property.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/5">
                        <Building2 size={32} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 px-8 py-4 md:py-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                          {property.listingType}
                       </span>
                       <span className="text-white/20 text-[9px] font-bold">• {new Date(property.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-4 text-white/30 text-xs mt-2 uppercase font-black tracking-widest">
                       <span className="flex items-center gap-1.5"><MapPin size={14} className="text-amber-500" /> {property.district}</span>
                       <span className="text-amber-500 font-black">฿{Intl.NumberFormat("th-TH").format(property.startingPrice || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pr-2">
                     <button 
                       onClick={() => router.push(`/properties/${property.id}`)}
                       className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                       title="View public page"
                     >
                        <ExternalLink size={18} />
                     </button>
                     <button 
                       onClick={() => router.push(`/properties/${property.id}/edit`)}
                       className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                       title="Edit listing"
                     >
                        <Edit3 size={18} />
                     </button>
                     <button 
                       onClick={() => handleDelete(property.id)}
                       className="p-3 rounded-xl bg-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                       title="Delete listing"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white/3 border border-dashed border-white/10 rounded-[3rem] text-center">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 mb-6">
                    <Building2 size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-white/80">คุณยังไม่เคยลงประกาศ</h2>
                 <p className="text-white/30 max-w-xs mt-2 mb-8">เริ่มสร้างพอร์ตอสังหาริมทรัพย์ของคุณวันนี้ เพื่อส่งต่อความสุขให้ผู้อยู่อาศัย</p>
                 <Link 
                   href="/properties/create" 
                   className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-amber-500 transition-all"
                 >
                   ลงประกาศครั้งแรก
                 </Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
