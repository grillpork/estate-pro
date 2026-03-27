"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  MessageCircle,
  User,
  Calendar,
  Home as HomeIcon,
  Maximize,
  Layers,
  ArrowLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleStartChat = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/sign-in");
      return;
    }
    const user = JSON.parse(userStr);

    if (user.id === property.userId) {
      alert("คุณเป็นเจ้าของรายการนี้ ไม่สามารถแชทกับตัวเองได้");
      return;
    }

    try {
      const res = await api.post("/conversations", {
        user1Id: user.id,
        user2Id: property.userId,
        propertyId: property.id,
      });

      if (res.data) {
        router.push(`/conversations/${res.data.id}`);
      }
    } catch (error: any) {
        // หากคุยอยู่แล้ว หรือเปิดไปแล้ว ก็ให้พาไปหน้าแชทเลย
        if (error.response?.status === 409 || error.response?.status === 400) {
            // ค้นหาคลาสที่คุณอาจจะใช้ดึง conv เก่า
            router.push('/conversations');
        } else {
            console.error("Failed to start chat:", error);
            alert("ไม่สามารถเริ่มการแชทได้ในขณะนี้");
        }
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูลอสังหาริมทรัพย์</h1>
        <Link href="/" className="text-amber-500 hover:text-amber-400 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  const allImages = property.images?.length > 0
    ? property.images.map((img: any) => `http://localhost:4000/${img.imagePath}`)
    : property.mainImage ? [`http://localhost:4000/${property.mainImage.imagePath}`] : [];

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pb-20 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-6 uppercase tracking-widest font-bold">
          <Link href="/" className="hover:text-amber-500 transition-colors">หน้าหลัก</Link>
          <ChevronRight className="w-3 h-3" />
          <span>อสังหาริมทรัพย์</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/60 truncate max-w-[150px]">{property.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visuals Area */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden group bg-[#111118] border border-white/5 shadow-2xl">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImage]}
                  alt={property.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/5 bg-[#1a1a24]">
                  <Building2 size={120} />
                </div>
              )}
              
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <div className="bg-amber-500 text-black px-4 py-1.5 rounded-xl text-xs font-black shadow-2xl">
                    {property.listingType === 'RENT' ? 'เช่า' : 'ขาย'}
                 </div>
                 <span className="bg-[#0a0a0f]/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black border border-white/10 uppercase tracking-tighter">
                   #{property.id}
                 </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3 mt-6 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-amber-500' : 'border-transparent opacity-30 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Content Details */}
            <div className="mt-10">
              <h1 className="text-4xl font-black mb-6 leading-[1.1]">{property.name}</h1>
              
              <div className="flex flex-wrap gap-4 mb-10">
                 <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm">
                    <Maximize className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-bold">พื้นที่ใช้สอย</p>
                      <span className="font-bold">{property.usableArea} ตร.ม.</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm">
                    <Layers className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-bold">ตำแหน่งชั้น</p>
                      <span className="font-bold">ชั้น {property.floor}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm">
                    <HomeIcon className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-bold">ประเภท</p>
                      <span className="font-bold">{property.listingType}</span>
                    </div>
                 </div>
              </div>

              <div className="p-8 rounded-[40px] bg-linear-to-b from-[#111118] to-transparent border border-white/5">
                 <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                   <div className="w-2 h-6 bg-amber-500 rounded-full" />
                   รายละเอียดทรัพย์
                 </h3>
                 <p className="text-white/60 leading-relaxed whitespace-pre-line text-lg mb-10">
                    {property.description || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติมสำหรับอสังหาริมทรัพย์ชิ้นนี้'}
                 </p>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                    <div className="space-y-1">
                       <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">ห้องนอน</p>
                       <p className="text-2xl font-black">{property.bedrooms || '-'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">ห้องน้ำ</p>
                       <p className="text-2xl font-black">{property.bathrooms || '-'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">ที่จอดรถ</p>
                       <p className="text-2xl font-black">{property.parkingSpaces || '-'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">สถานะ</p>
                       <p className="text-lg font-black text-amber-500">{property.isActive ? 'เปิดขาย' : 'ปิดประกาศ'}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Sidebar CTA Card */}
          <div className="lg:col-span-12 xl:col-span-4 sticky top-24">
            <div className="bg-[#111118] border border-white/10 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] -mr-16 -mt-16" />
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-black">
                    <Zap className="w-7 h-7" />
                 </div>
                 <div>
                    <p className="text-white/30 text-xs font-black uppercase tracking-widest">ราคาเสนอขาย</p>
                    <h2 className="text-3xl font-black text-white">
                      {Intl.NumberFormat("th-TH").format(property.startingPrice || 0)} <span className="text-sm font-normal text-white/30">THB</span>
                    </h2>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-white/30" />
                      <span className="text-sm text-white/60">ลงประกาศโดย</span>
                    </div>
                    <span className="text-sm font-bold">{property.ownerName || 'ไม่ระบุ'}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-white/30" />
                      <span className="text-sm text-white/60">ทำเลที่ตั้ง</span>
                    </div>
                    <span className="text-sm font-bold">{property.province || 'กรุงเทพฯ'}</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <button
                   onClick={handleStartChat}
                   className="w-full py-5 rounded-2xl bg-linear-to-r from-amber-400 to-amber-600 hover:scale-[1.02] active:scale-[0.98] text-black font-black text-lg transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
                 >
                   <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                   เริ่มการสนทนา
                 </button>
                 <p className="text-center text-[10px] text-white/20 pt-2 font-bold uppercase tracking-widest italic">
                   Direct connection with owner
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
