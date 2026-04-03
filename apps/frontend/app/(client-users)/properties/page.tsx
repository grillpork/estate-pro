"use client";

import { useEffect, useState } from "react";
import { getAllPropertiesService } from "@/services/client/property";
import { 
  Building2, 
  MapPin, 
  Search, 
  Filter, 
  Loader2, 
  Bed, 
  Bath, 
  Maximize2, 
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PropertyCards from "@/components/PropertyCards";

interface PropertyListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  address: string;
  image: string | null;
  category: string;
  floor: string;
}

import { AnimatePresence, motion } from "framer-motion";

const bgImages = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
  "https://images.squarespace-cdn.com/content/v1/5f8ea039556db03ceb7abacc/1603213068847-AQ0FNGH7JM1Y0LN4M7ZM/AIHouse_View_02.jpg",
  "https://cdn3.pixelcut.app/pixa_cms/media/d089e45a-09e0-42ec-aa87-2ab1cba8bdc6_hero_image_7fa558c5.webp",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
];

export default function PropertiesListingPage() {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBg, setCurrentBg] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
    
    // Auto-play background every 3 seconds
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 7000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getAllPropertiesService();
      if (Array.isArray(data)) {
        const mapped = data.map((p: any) => ({
            id: p.id.toString(),
            title: p.name || "โครงการคุณภาพ",
            description: p.description,
            floor: p.floor?.toString() || "-",
            price: Number(p.startingPrice) || 0,
            address: [p.district, p.province].filter(Boolean).join(", ") || "กรุงเทพมหานคร",
            image: p.mainImage ? `http://localhost:4000/${p.mainImage}` : null,
            category: p.listingType
        }));
        setProperties(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Curating the finest properties for you...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pt-24 pb-32 font-sans selection:bg-amber-500/30">
        <section className="relative w-full h-screen mx-auto flex items-center justify-center">
             {/* Animated Background Images */}
             <div className="absolute inset-0 z-0">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentBg}
                   initial={{ opacity: 0, }}
                   animate={{ opacity: 1, }}
                   exit={{ opacity: 0, }}
                   transition={{ duration: 1.5, ease: "easeInOut" }}
                   className="absolute inset-0 bg-cover bg-center"
                   style={{ backgroundImage: `url('${bgImages[currentBg]}')` }}
                 />
               </AnimatePresence>
               {/* Gradients Overlay */}
               <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/40 to-[#0a0a0f] z-0" />
             </div>

             <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl px-6"> 
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                
              >
                
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-8xl font-black text-white text-center leading-[0.9] tracking-tighter"
              >
                EXPERIENCE <br />
                BEYOND <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">LUXURY</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/40 text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-center max-w-2xl px-6"
              >
                "Curating Masterpiece Residences that Reflect Your Success"
              </motion.p>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-2xl border w-full border-white/10 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-4 p-2"
              >
                  <div className="flex-1 flex items-center gap-4 px-6 py-4 group transition-all">
                    <Search className="w-6 h-6 text-white/30 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      placeholder="Search by location, project, or keywords..." 
                      className="bg-transparent border-none outline-none text-white text-lg w-full font-medium placeholder:text-white/20"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto pr-4">
                    <div className="h-10 w-px bg-white/10 hidden md:block mx-4" />
                    <div className="flex-1 md:flex-none flex items-center gap-3 text-white/30 text-xs font-black uppercase tracking-widest whitespace-nowrap">
                      FOUND <span className="text-white text-xl">{properties.length}</span> LISTINGS
                    </div>
                  </div>
              </motion.div>
            </div>
        </section>

        {/* Properties Grid */}
        <div className="relative -mt-20 z-20">
          <PropertyCards 
            data={properties} 
            title={null} 
            subtitle={null} 
            showViewAll={false} 
          />
        </div>

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 bg-white/3 rounded-[3rem] border border-white/5 border-dashed">
             <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-8">
                <Building2 size={48} strokeWidth={1} />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">No Listings Found</h3>
             <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">Try adjusting your search or filters</p>
          </div>
        )}

      {/* Modern Decoration elements */}
      <div className="absolute top-[30%] right-[-5%] w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}