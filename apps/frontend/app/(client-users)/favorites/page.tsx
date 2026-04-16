"use client";

import { useEffect, useState } from "react";
import { favoritesService } from "@/services/client/favorites";
import { 
  Heart, 
  Loader2, 
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Building2,
  X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCards from "@/components/PropertyCards";

const CATEGORY_FILTERS = [
  { id: 'ALL', label: 'ทั้งหมด' },
  { id: 'CONDOMINIUM', label: 'คอนโดมิเนียม', values: ['CONDOMINIUM'] },
  { id: 'DETACHED_HOUSE', label: 'บ้านเดี่ยว', values: ['DETACHED_HOUSE'] },
  { id: 'TWIN_HOUSE', label: 'บ้านแฝด', values: ['TWIN_HOUSE'] },
  { id: 'TOWNHOME', label: 'ทาวน์โฮม', values: ['TOWNHOME'] },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    let result = favorites;

    // Filter by category
    if (activeFilter !== 'ALL') {
      const filter = CATEGORY_FILTERS.find(f => f.id === activeFilter);
      if (filter && filter.values) {
        result = result.filter(fav => filter.values!.includes(fav.category));
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(fav => 
        fav.property.name?.toLowerCase().includes(query) ||
        fav.property.description?.toLowerCase().includes(query) ||
        fav.property.district?.toLowerCase().includes(query) ||
        fav.property.province?.toLowerCase().includes(query)
      );
    }

    setFilteredFavorites(result);
  }, [activeFilter, favorites, searchQuery]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesService.getMyFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavorite = async (propertyId: string) => {
    try {
        const favRecord = favorites.find(f => f.propertyId.toString() === propertyId.toString());
        if (favRecord) {
            await favoritesService.deleteFavorite(favRecord.id);
            setFavorites(prev => prev.filter(f => f.id !== favRecord.id));
        }
    } catch (error) {
        console.error("Failed to unfavorite:", error);
        alert("Failed to remove from favorites");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Curating your favorites...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen pt-24 pb-32 px-4 md:px-12 selection:bg-amber-500/30">
        {/* Glow Effects */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          {/* Header Section */}
          <div className="flex flex-col gap-10 mb-12">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                อสังหาที่คุณ<span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">ถูกใจ</span>
              </h1>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">"Your Curated Selection of Premium Living"</p>
            </motion.div>

            <div className="flex flex-col gap-4">
              {/* DASHBOARD ACTIONS (Matches Screenshot & My Properties) */}
          
            <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 group focus-within:border-amber-500/30 transition-all">
                <Search className="w-5 h-5 text-white/20 group-focus-within:text-amber-500" />
                <input 
                  type="text" 
                  placeholder="ค้นหาประกาศที่คุณสนใจ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/20"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="text-white/20 text-xs ml-0 md:ml-4 whitespace-nowrap">
                  แสดงทั้งหมด <span className="text-white font-bold">{filteredFavorites.length}</span> รายการ
                </div>
              </div>

            </div>
            

            {/* CATEGORY FILTERS (Permanent) */}
             <div className="flex flex-wrap items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/5 p-2 rounded-2xl">
                {CATEGORY_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      activeFilter === filter.id
                        ? "bg-amber-500 text-[#0a0a0f] shadow-lg shadow-amber-500/20"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFavorites.map((fav) => (
                  <FavoriteCard 
                    key={fav.id} 
                    fav={fav} 
                    onUnfavorite={handleUnfavorite} 
                  />
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 rounded-[3rem] border border-white/5 border-dashed"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-8">
                  <Heart size={48} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">ไม่พบรายการที่ต้องการ</h3>
                <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ใหม่</p>
                <Link 
                    href="/properties"
                    className="mt-8 bg-amber-500 text-[#0a0a0f] font-black px-8 py-3 rounded-xl hover:bg-amber-400 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                    กลับไปที่โครงการทั้งหมด
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
}

// Custom Favorite Dashboard Card (Matches My Properties Style)
function FavoriteCard({ fav, onUnfavorite }: { fav: any, onUnfavorite: (id: string) => void }) {
  const property = fav.property;
  const imageUrl = property.mainImage ? `http://localhost:4000/${property.mainImage}` : null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-[#111118] border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col shadow-2xl shadow-black/50"
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10 group-hover:bg-white/10 transition-colors">
            <Building2 className="w-12 h-12" />
          </div>
        )}

        {/* Status Badges (Left) */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-[#0a0a0f]/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-amber-500 border border-amber-500/20 uppercase tracking-widest">
            {property.listingType || "Sale"}
          </div>
        </div>

        {/* Remove Favorite Toggle (Right) */}
        <button 
          onClick={() => onUnfavorite(property.id)}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-[#0a0a0f]/60 backdrop-blur-md border border-white/10 text-white/60 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg group/close"
        >
          <X size={18} className="group-hover/close:scale-110 transition-transform" />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors tracking-tight uppercase">
          {property.name || "โครงการไม่มีชื่อ"}
        </h3>
        <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-wider mb-4">
          <MapPin className="w-3.5 h-3.5 text-amber-500/50" />
          <span className="line-clamp-1">{[property.district, property.province].filter(Boolean).join(", ") || "ไม่ได้ระบุทำเล"}</span>
        </div>
        <p className="text-sm text-white/30 line-clamp-2 mb-6 leading-relaxed flex-1 italic">
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
              <Link 
                href={`/properties/${property.id}`}
                className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20 shadow-xl"
                title="ดูรายละเอียด"
              >
                <Eye size={18} />
              </Link>
              <button 
                onClick={() => onUnfavorite(property.id)}
                className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 shadow-xl"
                title="ลบจากรายการโปรด"
              >
                <Trash2 size={18} />
              </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
