"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllPropertiesService } from "@/services/client/property";
import { getAllBrandsService } from "@/services/client/brand";
import { 
  Building2, 
  Search, 
  Loader2, 
  ChevronDown,
  X,
  SlidersHorizontal,
  Home,
  Building,
  Hotel,
  Warehouse
} from "lucide-react";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { AnimatePresence, motion } from "framer-motion";

interface PropertyListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  address: string;
  image: string | null;
  category: string;
  floor: string;
  brandId?: number;
}

interface Brand {
  id: number;
  name: string;
  category: string;
}

const bgImages = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
  "https://images.squarespace-cdn.com/content/v1/5f8ea039556db03ceb7abacc/1603213068847-AQ0FNGH7JM1Y0LN4M7ZM/AIHouse_View_02.jpg",
  "https://cdn3.pixelcut.app/pixa_cms/media/d089e45a-09e0-42ec-aa87-2ab1cba8bdc6_hero_image_7fa558c5.webp",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
];

const categories = [
  { id: 'all', name: 'All Types', icon: Home, value: 'all' },
  { id: 'CONDOMINIUM', name: 'Condo', icon: Building, value: 'CONDOMINIUM' },
  { id: 'DETACHED_HOUSE', name: 'House', icon: Hotel, value: 'DETACHED_HOUSE' },
  { id: 'TOWNHOME', name: 'Townhome', icon: Warehouse, value: 'TOWNHOME' },
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
}

export default function CategoryPropertiesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentCategory = (params?.category as string) || 'all';
  
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBg, setCurrentBg] = useState(0);
  
  // URL States
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const selectedBrandId = searchParams.get('brandId') || '';
  const searchQuery = searchParams.get('q') || '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const radiusParam = searchParams.get('radius');
  const stationParam = searchParams.get('station');
  
  const displaySearchQuery = stationParam ? stationParam : searchQuery;

  const [localMinPrice, setLocalMinPrice] = useState(Number(minPrice) || 0);
  const [localMaxPrice, setLocalMaxPrice] = useState(Number(maxPrice) || 50000000);
  
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const selectedBrandName = useMemo(() => {
    return brands.find(b => b.id.toString() === selectedBrandId)?.name || 'All Developers';
  }, [brands, selectedBrandId]);

  useEffect(() => {
    fetchInitialData();
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Sync local price states with URL params when they change externally
  useEffect(() => {
    setLocalMinPrice(Number(minPrice) || 0);
    setLocalMaxPrice(Number(maxPrice) || 50000000);
  }, [minPrice, maxPrice]);

  // Fetch properties whenever category or query params change
  useEffect(() => {
    fetchProperties();
  }, [currentCategory, searchParams]);


  const fetchInitialData = async () => {
    try {
      const brandsData = await getAllBrandsService();
      setBrands(brandsData);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Build filters for API
      const apiFilters: any = {};
      if (currentCategory !== 'all') apiFilters.category = currentCategory;
      if (selectedBrandId) apiFilters.brandId = selectedBrandId;
      if (minPrice) apiFilters.minPrice = minPrice;
      if (maxPrice) apiFilters.maxPrice = maxPrice;
      if (searchQuery) apiFilters.q = searchQuery;

      const data = await getAllPropertiesService(apiFilters);
      
      if (Array.isArray(data)) {
        let mapped = data.map((p: any) => ({
            id: p.id.toString(),
            title: p.name || "โครงการคุณภาพ",
            description: p.description,
            floor: p.floor?.toString() || "-",
            price: Number(p.startingPrice) || 0,
            address: [p.district, p.province].filter(Boolean).join(", ") || "กรุงเทพมหานคร",
            image: p.mainImage ? `http://localhost:4000/${p.mainImage}` : null,
            category: p.listingType,
            brandId: p.brandId,
            latitude: p.latitude,
            longitude: p.longitude
        }));

        if (latParam && lngParam && radiusParam) {
            const lat = parseFloat(latParam);
            const lng = parseFloat(lngParam);
            const radius = parseFloat(radiusParam);
            
            mapped = mapped.filter((p: any) => {
                if (!p.latitude || !p.longitude) return false;
                const propLat = parseFloat(p.latitude);
                const propLng = parseFloat(p.longitude);
                const distance = calculateDistance(lat, lng, propLat, propLng);
                return distance <= radius;
            });
        }

        setProperties(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (newFilters: any) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value as string);
      }
    });

    // If changing category, we change the path
    if (newFilters.category) {
        const cat = newFilters.category === 'all' ? 'all' : newFilters.category;
        router.push(`/properties/${cat}?${newSearchParams.toString()}`);
    } else {
        router.push(`${pathname}?${newSearchParams.toString()}`);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('search') as string;
    updateURL({ q });
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pt-0 pb-32 font-sans selection:bg-amber-500/30 overflow-x-hidden">
        <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 z-0">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentBg}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 1.5 }}
                   className="absolute inset-0 bg-cover bg-center"
                   style={{ backgroundImage: `url('${bgImages[currentBg]}')` }}
                 />
               </AnimatePresence>
               <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/40 to-[#0a0a0f] z-0" />
             </div>

             <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-5xl px-6">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-7xl font-black text-white text-center leading-none tracking-tighter"
              >
                FIND YOUR <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">PARADISE</span>
              </motion.h1>
              
              <div className="w-full flex flex-col gap-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex items-center p-2 group transition-all focus-within:border-amber-500/50">
                    <div className="flex-1 flex items-center gap-4 px-4 py-3">
                        <Search className="w-5 h-5 text-white/30 group-focus-within:text-amber-500" />
                        <input 
                            name="search"
                            defaultValue={displaySearchQuery}
                            placeholder="Search by location, project, or brand..." 
                            className="bg-transparent border-none outline-none text-white text-lg w-full font-medium placeholder:text-white/20"
                            readOnly={!!stationParam}
                        />
                    </div>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20">
                        SEARCH
                    </button>
                </form>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateURL({ category: cat.value })}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all text-sm font-bold uppercase tracking-wider ${
                                currentCategory === cat.value 
                                ? "bg-white text-black border-white" 
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                            }`}
                        >
                            <cat.icon size={16} />
                            {cat.name}
                        </button>
                    ))}
                </div>
              </div>
            </div>
        </section>

        {/* Extended Filters Bar */}
        <div className="max-w-[90rem] mx-auto px-6 -mt-8 relative z-30">
            <div className="bg-[#15151e] border border-white/5 rounded-3xl p-6 shadow-3xl flex flex-wrap items-center gap-8">
                {/* Custom Brand Filter */}
                <div className="flex flex-col gap-2 flex-1 min-w-[220px] relative">
                    <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] px-1">Developer / Brand</label>
                    <button 
                        onClick={() => setIsBrandOpen(!isBrandOpen)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between hover:bg-white/10 hover:border-amber-500/30 transition-all text-sm group"
                    >
                        <span className={selectedBrandId ? "text-white" : "text-white/40"}>
                            {selectedBrandName}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-white/20 group-hover:text-amber-500 transition-transform ${isBrandOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isBrandOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a25] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-3xl max-h-[300px] overflow-y-auto"
                            >
                                <button
                                    onClick={() => {
                                        updateURL({ brandId: 'all' });
                                        setIsBrandOpen(false);
                                    }}
                                    className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-amber-500 hover:bg-white/5 transition-colors"
                                >
                                    All Developers
                                </button>
                                {brands.map(brand => (
                                    <button
                                        key={brand.id}
                                        onClick={() => {
                                            updateURL({ brandId: brand.id.toString() });
                                            setIsBrandOpen(false);
                                        }}
                                        className={`w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between ${
                                            selectedBrandId === brand.id.toString() 
                                            ? "text-amber-500 bg-amber-500/5 font-bold" 
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        {brand.name}
                                        {selectedBrandId === brand.id.toString() && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Price Range Slider */}
                <div className="flex flex-col gap-4 min-w-[260px]">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Price Range (THB)</label>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs ring-1 ring-white/5 rounded-lg px-2 py-1 bg-white/2">
                           <span>฿</span>
                           <input 
                              type="number"
                              value={localMinPrice}
                              onChange={(e) => {
                                 const val = Math.min(Number(e.target.value), localMaxPrice - 100000);
                                 setLocalMinPrice(val);
                                 updateURL({ minPrice: val });
                              }}
                              className="bg-transparent border-none outline-none w-20 text-right appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           />
                           <span className="mx-1 text-white/20">-</span>
                           <span>฿</span>
                           <input 
                              type="number"
                              value={localMaxPrice}
                              onChange={(e) => {
                                 const val = Math.max(Number(e.target.value), localMinPrice + 100000);
                                 setLocalMaxPrice(val);
                                 updateURL({ maxPrice: val });
                              }}
                              className="bg-transparent border-none outline-none w-24 text-right appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           />
                           {localMaxPrice >= 50000000 && <span className="ml-0.5 text-white/40">+</span>}
                        </div>
                    </div>
                    
                    <div className="relative h-6 flex items-center group">
                        {/* Custom Slider Track */}
                        <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                        <div 
                           className="absolute h-1 bg-amber-500 rounded-full" 
                           style={{ 
                             left: `${(localMinPrice / 50000000) * 100}%`, 
                             right: `${100 - (localMaxPrice / 50000000) * 100}%` 
                           }}
                        />
                        
                        {/* Dual Range Inputs (Transparent but active) */}
                        <input
                            type="range"
                            min="0"
                            max="50000000"
                            step="100000"
                            value={localMinPrice}
                            onChange={(e) => {
                                const val = Math.min(Number(e.target.value), localMaxPrice - 500000);
                                setLocalMinPrice(val);
                            }}
                            onMouseUp={() => updateURL({ minPrice: localMinPrice })}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,158,11,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500"
                        />
                        <input
                            type="range"
                            min="0"
                            max="50000000"
                            step="100000"
                            value={localMaxPrice}
                            onChange={(e) => {
                                const val = Math.max(Number(e.target.value), localMinPrice + 500000);
                                setLocalMaxPrice(val);
                            }}
                            onMouseUp={() => updateURL({ maxPrice: localMaxPrice })}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,158,11,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500"
                        />
                    </div>
                </div>

                {/* Results Count & Clear */}
                <div className="flex items-center gap-6 ml-auto">
                    <div className="text-right">
                        <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Showing</div>
                        <div className="text-2xl font-black text-amber-500 leading-none">{properties.length} <span className="text-white text-xs opacity-40">RESULTS</span></div>
                    </div>
                    {(selectedBrandId || minPrice || maxPrice || searchQuery || currentCategory !== 'all') && (
                        <button 
                            onClick={() => router.push('/properties/all')}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            title="Clear Filters"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Properties Grid */}
        <div className="max-w-[90rem] mx-auto px-6 py-12">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Searching the collection...</p>
             </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 bg-white/3 rounded-[3rem] border border-white/5 border-dashed">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-8">
                  <Building2 size={48} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Match Not Found</h3>
               <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

      {/* Modern Decoration elements */}
      <div className="fixed top-[30%] right-0 translate-x-1/2 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[20%] left-0 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
