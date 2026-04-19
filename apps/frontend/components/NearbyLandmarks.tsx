"use client";

import { useState, useEffect } from "react";
import { 
  Train, 
  Hospital, 
  GraduationCap, 
  Plane, 
  ShoppingBag, 
  ChevronDown, 
  MapPin, 
  Search,
  Building2
} from "lucide-react";
import { api } from "@/lib/api";

interface Landmark {
  id: number;
  name: string;
  type: string;
  distance: number;
  latitude: number;
  longitude: number;
  color?: string;
  line?: string;
}

const categories = [
  { id: "all", label: "สถานที่ทั้งหมด", icon: null },
  { id: "transport", label: "สถานีรถไฟฟ้า", icon: <Train size={18} /> },
  { id: "university", label: "มหาวิทยาลัย", icon: <GraduationCap size={18} /> },
  { id: "airport", label: "สนามบิน", icon: <Plane size={18} /> },
  { id: "shopping", label: "ห้างสรรพสินค้า", icon: <ShoppingBag size={18} /> },
  { id: "hospital", label: "โรงพยาบาล", icon: <Hospital size={18} /> },
];

export default function NearbyLandmarks({ lat, lng }: { lat: any; lng: any }) {
  const [activeTab, setActiveTab] = useState("all");
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandmarks = async () => {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // รัศมี 3 กิโลเมตร
        const response = await api.get(`/landmarks/nearby?lat=${latitude}&lng=${longitude}&radius=3000`);
        setLandmarks(response.data.stations || []);
      } catch (error) {
        console.error("Failed to fetch landmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLandmarks();
  }, [lat, lng]);

  const getIcon = (item: Landmark) => {
    const type = item.type?.toUpperCase();
    if (type === "BTS" || type === "MRT") return <Train size={20} />;
    if (type?.includes("HOSPITAL") || item.name?.includes("โรงพยาบาล")) return <Hospital size={20} />;
    if (item.name?.includes("มหาวิทยาลัย")) return <GraduationCap size={20} />;
    if (item.name?.includes("สนามบิน")) return <Plane size={20} />;
    if (item.name?.includes("ห้าง") || item.name?.includes("เซ็นทรัล") || item.name?.includes("เดอะมอลล์")) return <ShoppingBag size={20} />;
    return <MapPin size={20} />;
  };

  const getIconBgColor = (item: Landmark) => {
    const type = item.type?.toUpperCase();
    if (type === "BTS" || type === "MRT") return "bg-emerald-500/10 text-emerald-500";
    if (type?.includes("HOSPITAL") || item.name?.includes("โรงพยาบาล")) return "bg-rose-500/10 text-rose-500";
    if (item.name?.includes("ห้าง")) return "bg-cyan-500/10 text-cyan-500";
    return "bg-amber-500/10 text-amber-500";
  };

  const filteredLandmarks = landmarks.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "transport") return item.type === "BTS" || item.type === "MRT";
    if (activeTab === "hospital") return item.name?.includes("โรงพยาบาล");
    if (activeTab === "university") return item.name?.includes("มหาวิทยาลัย");
    if (activeTab === "shopping") return item.name?.includes("ห้าง") || item.name?.includes("เซ็นทรัล");
    if (activeTab === "airport") return item.name?.includes("สนามบิน");
    return true;
  });

  // Deduplicate by name and type to avoid showing the same station multiple times
  const uniqueLandmarks = filteredLandmarks.filter((item, index, self) =>
    index === self.findIndex((t) => t.name === item.name && t.type === item.type)
  );

  const handleLandmarkClick = (landmark: Landmark) => {
    if (!lat || !lng || !landmark.latitude || !landmark.longitude) return;
    
    const origin = `${lat},${lng}`;
    const destination = `${landmark.latitude},${landmark.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <section className="pt-16 border-t border-white/5 space-y-10">
      <div className="flex items-center justify-between">
         <h3 className="text-xs font-black uppercase tracking-[.3em] text-white/20">Neighborhood</h3>
         <div className="flex items-center gap-2 text-amber-500/50 text-[10px] font-black uppercase tracking-widest">
            <Search size={12} />
            Explore Area
         </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-4xl font-black tracking-tight text-white">สถานที่ใกล้เคียงอื่นๆ</h2>
        
        {/* Chips Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`whitespace-nowrap px-6 py-3.5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeTab === cat.id
                  ? "bg-white text-black border-white shadow-xl shadow-white/5"
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of Landmarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-10 h-10 border-4 border-white/5 border-t-amber-500 rounded-full animate-spin"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Searching nearby places...</span>
             </div>
          ) : uniqueLandmarks.length > 0 ? (
            uniqueLandmarks.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleLandmarkClick(item)}
                className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${getIconBgColor(item)}`}>
                    {getIcon(item)}
                  </div>
                  <div className="space-y-1">
                    <span className="block font-black text-white text-lg tracking-tight group-hover:text-amber-500 transition-colors">
                      {item.name}
                    </span>
                    {item.line && (
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/20">
                        {item.type} • {item.line} Line
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-lg font-black text-white/80">
                      {(item.distance / 1000).toFixed(1)}
                    </span>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-white/20">กม.</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                    <ChevronDown size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.01]">
              <Building2 className="text-white/10 mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">ไม่พบสถานที่ใกล้เคียงในหมวดนี้</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
