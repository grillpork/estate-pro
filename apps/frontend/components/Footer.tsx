"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Building2, Terminal } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[#0a0a0f] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-amber-600/3 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Estate<span className="text-amber-500">Pro</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-medium">
              ยกระดับประสบการณ์การค้นหาและจัดการอสังหาริมทรัพย์ที่ครอบคลุมและทันสมัยที่สุดในประเทศไทย ตอบโจทย์ทุกไลฟ์สไตล์การใช้ชีวิตของคุณ
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest pl-1 border-l-2 border-amber-500">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: "หน้าแรก", href: "/" },
                { name: "ประกาศขาย/เช่า", href: "/properties" },
                { name: "อสังหาของฉัน", href: "/my-properties" },
                { name: "ข้อความ", href: "/conversations" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/40 hover:text-amber-400 text-sm transition-colors font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest pl-1 border-l-2 border-amber-500">Support</h3>
            <ul className="space-y-4">
              {[
                "ศูนย์ช่วยเหลือ",
                "เงื่อนไขการใช้งาน",
                "นโยบายความเป็นส่วนตัว",
                "คำถามที่พบบ่อย",
              ].map((item) => (
                <li key={item}>
                  <button className="text-white/40 hover:text-amber-400 text-sm transition-colors font-medium">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest pl-1 border-l-2 border-amber-500">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-white/40 text-sm leading-relaxed font-medium">
                  123 ถนนสุขุมวิท เขตวัฒนา<br />กรุงเทพมหานคร 10110
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500" />
                <p className="text-white/40 text-sm font-medium">02-XXX-XXXX</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500" />
                <p className="text-white/40 text-sm font-medium">contact@estatepro.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/20 text-xs font-medium">
            © 2026 EstatePro Co., Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/10 text-[10px] uppercase tracking-widest font-bold">
            <Terminal size={12} />
            <span>Designed and Developed by AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
