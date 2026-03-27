import Link from "next/link";
import { Search, Building2, Home, MapPin, TrendingUp, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import StartChatEmptyState from "@/components/StartChatEmptyState";

type Property = {
  id: string;
  title: string;
  description: string | null;
  floor: string;
  price: number;
  address: string;
  image: string | null;
  category?: string;
};

async function getProperties(): Promise<Property[]> {
  try {
    const res = await fetch("http://127.0.0.1:4000/properties", {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Status error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    
    // Mapping backend data to frontend model
    if (Array.isArray(data)) {
        return data.map((p: any) => ({
            id: p.id.toString(),
            title: p.name || "โครงการคุณภาพ",
            description: p.description,
            floor: p.floor?.toString() || "-",
            price: Number(p.startingPrice) || 0,
            address: [p.district, p.province].filter(Boolean).join(", ") || "กรุงเทพมหานคร",
            image: p.mainImage ? `http://localhost:4000/${p.mainImage}` : null,
            category: p.listingType
        }));
    }
    return [];
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

export default async function HomePage() {
  const properties = await getProperties();

  return (
    <div className="bg-[#0a0a0f] min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" />
              บริษัทอสังหาริมทรัพย์อันดับ #1 ในไทย
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              ค้นหา<span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">อสังหาริมทรัพย์</span><br />
              ในฝันของคุณ
            </h1>
            <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-xl">
              เริ่มการเดินทางสู่บ้านหลังใหม่ที่ตอบโจทย์ไลฟ์สไตล์ของคุณที่สุด 
              ด้วยระบบจัดการและค้นหาที่ทันสมัยและครอบคลุมที่สุดในประเทศไทย
            </p>

            {/* Search Box */}
            <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/5 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-white/30" />
                <input 
                  type="text" 
                  placeholder="ค้นหาตามทำเล, ชื่อโครงการ..."
                  className="bg-transparent border-none outline-none text-white placeholder-white/20 w-full text-sm"
                />
              </div>
              <div className="h-px md:h-8 md:w-px bg-white/5 mx-2" />
              <button className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20">
                ค้นหาเลย
              </button>
            </div>

            <div className="mt-8 flex items-center gap-8 text-white/30 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">2.5k+</span>
                <span>รายการประกาศ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">1.2k+</span>
                <span>ผู้ใช้งานจริง</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">อสังหาริมทรัพย์ยอดนิยม</h2>
            <p className="text-white/40">คัดสรรโครงการคุณภาพสำหรับความต้องการของคุณ</p>
          </div>
          <Link href="/properties" className="text-amber-500 hover:text-amber-400 text-sm font-medium flex items-center gap-2">
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.length > 0 ? (
            properties.slice(0, 6).map((property) => (
              <div key={property.id} className="group bg-[#111118] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                  {property.image ? (
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-[#0a0a0f]/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-amber-500 border border-amber-500/20">
                    ยอดนิยม
                  </div>
                  <div className="absolute bottom-4 right-4 bg-amber-500 text-[#0a0a0f] px-3 py-1 rounded-lg text-sm font-black shadow-lg">
                    {Intl.NumberFormat("th-TH").format(property.price || 0)} บาท
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {property.title || "โครงการคุณภาพ"}
                  </h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{property.address || "กรุงเทพมหานคร"}</span>
                  </div>
                  <p className="text-sm text-white/30 line-clamp-2 mb-6 leading-relaxed">
                    {property.description ?? "โครงการพักอาศัยระดับพรีเมียม บนทำเลศักยภาพที่ตอบโจทย์การใช้ชีวิตยุคใหม่"}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="text-center px-3 py-1 bg-white/5 rounded-md">
                          <p className="text-[10px] text-white/30 uppercase font-bold">Floor</p>
                          <p className="text-xs text-white font-bold">{property.floor || "-"}</p>
                       </div>
                    </div>
                    <Link href={`/properties/${property.id}`} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-amber-500/20 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <StartChatEmptyState />
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">มั่งใจได้ 100%</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">ทุกประกาศผ่านการตรวจสอบข้อมูลและความถูกต้องก่อนแสดงผล</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 text-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">ราคาดีที่สุด</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">เปรียบเทียบราคาที่คุ้มค่าที่สุดบนทำเลที่คุณสนใจได้ทันที</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">ครบทุกโครงการ</h3>
            <p className="text-sm text-white/40 leading-relaxed text-center">รวบรวมกว่าพันโครงการทั่วประเทศไทย ครอบคลุมทุกความต้องการ</p>
          </div>
        </div>
      </section>
    </div>
  );
}
