"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, PlusCircle, Menu, X, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import UserBox from "./UserBox";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef<HTMLElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "HOME", href: "/", icon: Home },
    { name: "PROPERTIES", href: "/properties", icon: Building2 },
    { name: "LIST PROPERTY", href: "/properties/create", icon: PlusCircle },
    { name: "MESSAGES", href: "/conversations", icon: MessageSquare },
  ];

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const container = linksContainerRef.current;
    if (!container) return;

    const activeEl = container.querySelector('[data-active="true"]') as HTMLElement;

    if (activeEl) {
      setIndicatorStyle({
        width: activeEl.offsetWidth,
        transform: `translateX(${activeEl.offsetLeft}px)`
      });
    } else {
      setIndicatorStyle({
        width: 0,
        transform: `translateX(0px)`
      });
    }
  }, [pathname]);

  return (
    <nav ref={containerRef} className="fixed top-0 left-0 z-50 w-full bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex-1 lg:flex-none">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={3}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">
              ESTATE<span className="text-amber-500">PRO</span>
            </span>
          </Link>
        </div>

        <div ref={linksContainerRef} className="relative flex items-center justify-center h-full">
          {/* 👇 ขีดข้างล่าง (Underline Indicator) */}
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-300 ease-out pointer-events-none" 
            style={indicatorStyle}
          />
  
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
  
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active}
                className="relative flex items-center gap-2 px-5 h-full text-[11px] font-black uppercase tracking-widest transition-colors hover:text-white"
                style={{ color: active ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${active ? 'text-amber-400' : 'text-white/20'}`} />
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: User Menu */}
        <div className="flex-1 lg:flex-none flex justify-end items-center gap-4">
          <div className="hidden md:block">
            <UserBox variant="ghost" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 text-white/60 border border-white/5 transition-transform active:scale-90"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-[#0a0a0f] border-b border-white/5 overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pt-4 pb-10 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${active
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className={active ? 'text-amber-500' : 'text-white/20'} size={20} />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-6 mt-6 border-t border-white/5">
            <UserBox />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
