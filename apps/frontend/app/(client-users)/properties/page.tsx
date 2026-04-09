"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  MapPin, 
  Building2, 
  Filter, 
  ChevronDown, 
  ArrowRight,
  Zap,
  LayoutGrid,
  List
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all"); // all, SALE, RENT
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get("/properties");
        setProperties(response.data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = activeType === "all" 
    ? properties 
    : properties.filter(p => p.listingType === activeType);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pb-32">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Zap size={12} /> Premier Collections
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
                DISCOVER<br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">LUXURY ESTATES</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xl font-medium">
                Explore our curated selection of high-end properties designed for those who seek excellence in every detail.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-amber-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
               >
                 <LayoutGrid size={20} />
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-amber-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
               >
                 <List size={20} />
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 py-6 bg-[#0a0a0f]/80 backdrop-blur-xl border-y border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setActiveType("all")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeType === "all" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}
              >
                All Listings
              </button>
              <button 
                onClick={() => setActiveType("SALE")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeType === "SALE" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}
              >
                For Sale
              </button>
              <button 
                onClick={() => setActiveType("RENT")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeType === "RENT" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}
              >
                For Rent
              </button>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  placeholder="Seach by location or project..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-white/10"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold">
                <Filter size={18} /> <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Display */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/5] bg-white/5 rounded-[2rem] animate-pulse" />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                : "flex flex-col gap-8"
              }
            >
              {filteredProperties.map((property, idx) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  idx={idx} 
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filteredProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-white/10">
               <Building2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-white/80">No matches found</h3>
            <p className="text-white/30 max-w-xs mt-2">Try adjusting your filters or search keywords to find what you're looking for.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function PropertyCard({ property, idx, viewMode }: { property: any, idx: number, viewMode: "grid" | "list" }) {
  const imageUrl = property.mainImage 
    ? `http://localhost:4000/${property.mainImage.imagePath || property.mainImage}` 
    : null;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group flex flex-col md:flex-row bg-[#111118] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all"
      >
        <div className="md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={property.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10">
              <Building2 size={48} />
            </div>
          )}
          <div className="absolute top-6 left-6 bg-amber-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            {property.listingType}
          </div>
        </div>
        <div className="flex-1 p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-3xl font-black tracking-tight group-hover:text-amber-500 transition-colors uppercase italic">{property.name}</h3>
              <div className="text-3xl font-black text-amber-500">
                ฿{Intl.NumberFormat("th-TH").format(property.startingPrice || 0)}
              </div>
            </div>
            <p className="text-white/40 text-sm flex items-center gap-2 mb-6">
              <MapPin size={16} /> {property.district}, {property.province}
            </p>
            <p className="text-white/30 line-clamp-2 mb-8 leading-relaxed italic">
              "{property.description || 'Luxury residence with modern amenities and prime location.'}"
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-8">
            <div className="flex gap-8">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Area</p>
                  <p className="text-sm font-bold">{property.usableArea} sqm</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Floors</p>
                  <p className="text-sm font-bold">{property.floor || '-'}</p>
               </div>
            </div>
            <Link href={`/properties/${property.id}`} className="bg-white text-black px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center gap-2">
              View Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group"
    >
      <Link href={`/properties/${property.id}`}>
        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#111118] border border-white/5 group-hover:border-amber-500/30 transition-all duration-500">
          {/* Image */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={property.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10">
              <Building2 size={64} />
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute inset-x-0 bottom-0 p-8 bg-linear-to-t from-black via-black/40 to-transparent">
             <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                   <div className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                      {property.listingType}
                   </div>
                   <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                      {property.brand?.category || 'Estate'}
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white italic group-hover:text-amber-500 transition-colors uppercase leading-[0.9]">
                  {property.name}
                </h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} className="text-amber-500" /> {property.district}, {property.province}
                </p>
             </div>
             
             <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-xl font-black text-amber-500">
                  ฿{Intl.NumberFormat("th-TH").format(property.startingPrice || 0)}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black transition-all group-hover:rotate-45">
                   <ArrowRight size={20} />
                </div>
             </div>
          </div>

          {/* Hover Glow */}
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/0 via-amber-500/0 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}