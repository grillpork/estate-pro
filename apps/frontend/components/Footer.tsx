"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Building2, Terminal } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[#0e0e14] border-t border-white/3 pt-15 pb-10 overflow-hidden">
      {/* Background Glows - More sophisticated positioning */}
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-amber-600/3 blur-[100px] pointer-events-none" />
      {/* Subtle top divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-500 group-hover:scale-105">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                Estate<span className="text-amber-500">Pro</span>
              </span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs font-medium">
              ยกระดับประสบการณ์การค้นหาและจัดการอสังหาริมทรัพย์ที่ครอบคลุมและทันสมัยที่สุดในประเทศไทย ตอบโจทย์ทุกไลฟ์สไตล์การใช้ชีวิตของคุณ
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-white/30 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-300">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] pl-3 border-l-2 border-amber-500">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: "หน้าแรก", href: "/" },
                { name: "ประกาศขาย/เช่า", href: "/properties" },
                { name: "อสังหาของฉัน", href: "/my-properties" },
                { name: "ข้อความ", href: "/conversations" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/30 hover:text-amber-400 text-sm transition-all duration-300 font-medium hover:translate-x-1 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] pl-3 border-l-2 border-amber-500">Support</h3>
            <ul className="space-y-4">
              {[
                "ศูนย์ช่วยเหลือ",
                "เงื่อนไขการใช้งาน",
                "นโยบายความเป็นส่วนตัว",
                "คำถามที่พบบ่อย",
              ].map((item) => (
                <li key={item}>
                  <button className="text-white/30 hover:text-amber-400 text-sm transition-all duration-300 font-medium hover:translate-x-1 text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] pl-3 border-l-2 border-amber-500">Contact Us</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-white/30 text-sm leading-relaxed font-medium">
                  123 ถนนสุขุมวิท เขตวัฒนา<br />กรุงเทพมหานคร 10110
                </p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <p className="text-white/30 text-sm font-medium">02-XXX-XXXX</p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-white/30 text-sm font-medium">contact@estatepro.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/2 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/10 text-[10px] font-bold uppercase tracking-widest">
            © 2026 EstatePro Co., Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/5 text-[9px] uppercase tracking-[0.3em] font-black">
            <Terminal size={10} />
            <span>Designed and Developed by AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
