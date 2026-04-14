"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  MessageCircle,
  User,
  Home as HomeIcon,
  Maximize,
  Layers,
  ArrowLeft,
  ChevronRight,
  Zap,
  Bed,
  Bath,
  ArrowRight,
  Share2,
  Heart,
  Star,
  ShieldCheck,
  Utensils,
  Car,
  Waves,
  Dumbbell,
  Wifi
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PropertyGallery from "@/components/PropertyGallery";
import NearbyLandmarks from "@/components/NearbyLandmarks";
import PropertyMap from "@/components/PropertyMap";
import { api } from "@/lib/api";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      });

      if (res.data && res.data.id) {
        router.push(`/conversations?id=${res.data.id}`);
      }
    } catch (error: any) {
      console.error("Failed to start chat:", error);
      router.push('/conversations');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/5 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-4 text-white">ไม่พบข้อมูลอสังหาริมทรัพย์</h1>
        <Link href="/" className="text-amber-500 hover:text-amber-400 flex items-center gap-2 font-bold">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  const allImages = property.images?.length > 0
    ? property.images.map((img: any) => `http://localhost:4000/${img.imagePath}`)
    : property.mainImage ? [`http://localhost:4000/${property.mainImage.imagePath}`] : [];

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pt-32 pb-32 font-sans selection:bg-amber-500/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Header Navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/properties" className="hover:text-amber-500 transition-colors">Listings</Link>
          </nav>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white/80">
                <Share2 size={16} /> 
                <span className="hidden sm:inline uppercase tracking-widest">Share</span>
             </button>
             <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-rose-500">
                <Heart size={16} className="fill-rose-500" />
                <span className="hidden sm:inline uppercase tracking-widest text-white/80">Save</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Information */}
          <div className="lg:col-span-12 xl:col-span-5 order-2 xl:order-1">
            <div className="space-y-12">
              {/* Title & Price Section */}
              <section className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-white">
                  {property.name}
                </h1>
                <p className="text-sm font-bold text-white/40 flex items-center gap-1.5 ">
                   <MapPin size={16} className="text-amber-500" />
                   {property.district}, {property.province}
                </p>
                <div className="pt-6 flex flex-col gap-1">
                   <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-amber-500">฿{Intl.NumberFormat("th-TH").format(property.startingPrice || 0)}</span>
                      <span className="text-white/20 text-xs font-black uppercase tracking-[0.2rem]">Total Price</span>
                   </div>
                </div>
              </section>

              {/* Action Button */}
              <section>
                 <button
                   onClick={handleStartChat}
                   className="w-full md:w-auto min-w-[320px] bg-white text-black hover:bg-amber-500 hover:text-black px-12 py-6 rounded-[2.5rem] font-black text-lg transition-all flex items-center justify-between group shadow-2xl shadow-white/5"
                 >
                   <span>เริ่มการสนทนา</span>
                   <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:rotate-45 transition-transform">
                      <MessageCircle size={24} strokeWidth={2.5} />
                   </div>
                 </button>
              </section>

              {/* Key Specs Pills */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 border-y border-white/5">
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500">
                       <Bed size={22} strokeWidth={2.5} />
                       <span className="text-2xl font-black text-white">{property.bedrooms || 0}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[.25em] text-white/30">Bedrooms</span>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500">
                       <Bath size={22} strokeWidth={2.5} />
                       <span className="text-2xl font-black text-white">{property.bathrooms || 0}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[.25em] text-white/30">Bathrooms</span>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500">
                       <Maximize size={22} strokeWidth={2.5} />
                       <span className="text-2xl font-black text-white">{property.usableArea}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[.25em] text-white/30">Sq.m Area</span>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500">
                       <Layers size={22} strokeWidth={2.5} />
                       <span className="text-2xl font-black text-white">{property.floor}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[.25em] text-white/30">Floor Level</span>
                 </div>
              </section>

              {/* Description Section */}
              <section className="space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[.3em] text-white/20">Information</h3>
                 <p className="text-white/50 leading-relaxed text-lg whitespace-pre-line font-medium ">
                   {property.description || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติมสำหรับอสังหาริมทรัพย์ชิ้นนี้'}
                 </p>
                 <button className="flex items-center gap-2 text-amber-500 font-black text-sm group hover:gap-3 transition-all">
                    VIEW COMPLETE DETAILS <ArrowRight className="w-4 h-4" />
                 </button>
              </section>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-12 xl:col-span-7 order-1 xl:order-2">
            <div className="sticky top-28">
              <PropertyGallery
                images={allImages}
                propertyId={property.id}
                listingType={property.listingType}
                propertyName={property.name}
              />
              
              {/* Information Cards (Compact Style) */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="p-7 rounded-[1.5rem] bg-white/3 border border-white/5 backdrop-blur-2xl transition-all duration-300">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {property.user?.imagePath ? (
                          <img 
                            src={`http://localhost:4000/${property.user.imagePath}`} 
                            alt={property.user.firstName}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                             <User className="text-amber-500" size={24} strokeWidth={2.5} />
                          </div>
                        )}
                        <div className="space-y-0.5">
                           <h4 className="font-black text-white text-lg tracking-tight">
                             {property.user ? `${property.user.firstName} ${property.user.lastName}` : (property.ownerName || 'Verified Agent')}
                           </h4>
                           <p className="text-white/30 text-xs font-semibold">
                             {property.user?.email || 'Authorized Representative'}
                           </p>
                           {property.user?.phoneNumber && (
                             <p className="text-amber-500/60 text-[10px] font-black tracking-widest uppercase mt-1">
                               {property.user.phoneNumber}
                             </p>
                           )}
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-widest">
                         <ShieldCheck className={`w-3.5 h-3.5 ${property.user?.verification === 'verified' ? 'text-emerald-500' : 'text-emerald-500/40'}`} />
                         {property.user?.verification === 'verified' ? 'Verified Member' : 'Pro Verified'}
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-amber-500/50">
                        Agent ID: #00{property.user?.id || '---'}
                      </div>
                   </div>
                </div>

                {/* Card 2 */}
                <div className="p-7 rounded-[1.5rem] bg-white/3 border border-white/5 backdrop-blur-2xl  transition-all duration-300">
                   <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                         <h4 className="font-black text-white text-lg tracking-tight">Property Type</h4>
                         <p className="text-white/30 text-xs font-semibold">{property.brand?.category || 'Condominium'}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                         <HomeIcon className="text-amber-500" size={20} strokeWidth={2.5} />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-widest pt-2 border-t border-white/5">
                      <Star className="w-3.5 h-3.5 text-amber-500/40" />
                      Prime Listing
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="mt-24 space-y-24">
           {/* Amenities Grid */}
           <section className="pt-16 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[.3em] text-white/20 mb-12">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                 <div className="flex items-center gap-4 text-white font-black text-lg py-6 border-b border-white/5">
                    <Utensils size={24} className="text-amber-500" /> Kitchen Area
                 </div>
                 <div className="flex items-center gap-4 text-white font-black text-lg py-6 border-b border-white/5">
                    <Car size={24} className="text-amber-500" /> Free Parking
                 </div>
                 <div className="flex items-center gap-4 text-white font-black text-lg py-6 border-b border-white/5">
                    <ShieldCheck size={24} className="text-amber-500" /> Security 24h
                 </div>
                 <div className="flex items-center gap-4 text-white font-black text-lg py-6 border-b border-white/5">
                    <Waves size={24} className="text-amber-500" /> Swimming Pool
                 </div>
                 <div className="flex items-center gap-4 text-white font-black text-lg py-6 border-b border-white/5">
                    <Dumbbell size={24} className="text-amber-500" /> Fitness Center
                 </div>
                 <div className="flex items-center gap-4 text-white font-black text-lg py-6 border-b border-white/5">
                    <Wifi size={24} className="text-amber-500" /> High-speed Wi-Fi
                 </div>
              </div>
           </section>

           {/* Nearby Landmarks */}
           <NearbyLandmarks 
             lat={property.latitude} 
             lng={property.longitude} 
           />

           <PropertyMap 
             lat={property.latitude} 
             lng={property.longitude}
             propertyName={property.name}
             address={`${property.district}, ${property.province}`}
           />

           {/* Reviews Section */}
           <section className="pt-16 border-t border-white/5">
              <div className="flex items-center gap-6 mb-12">
                 <div className="flex items-center gap-3">
                    <Star className="fill-amber-500 text-amber-500" size={32} />
                    <span className="text-5xl font-black">4.92</span>
                 </div>
                 <div className="h-12 w-px bg-white/10"></div>
                 <span className="text-white/30 font-black uppercase tracking-widest text-sm">12 Verified Reviews</span>
              </div>
              
              {/* Mock Review Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[1, 2].map((i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">U{i}</div>
                          <div>
                             <h5 className="font-black text-white">Verified User</h5>
                             <p className="text-white/20 text-xs font-bold">2 months ago</p>
                          </div>
                       </div>
                       <p className="text-white/60 leading-relaxed">
                          "Excellent property and very professional service. The location is perfect with easy access to the station. Highly recommended!"
                       </p>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
