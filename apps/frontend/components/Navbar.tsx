"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, PlusCircle, Menu, X, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import UserBox from "./UserBox";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef(null);

  const navLinks = [
    { name: "HOME", href: "/", icon: Home },
    { name: "PROPERTIES", href: "/properties", icon: Building2 },
    { name: "LIST PROPERTY", href: "/properties/create", icon: PlusCircle },
    { name: "MESSAGES", href: "/conversations", icon: MessageSquare },
  ];

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const activeEl = document.querySelector('[data-active="true"]');
    const container = containerRef.current;

    if (activeEl && container) {
      const rect = activeEl.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();

      setIndicatorStyle({
        width: rect.width,
        height: rect.height,
        transform: `translateX(${rect.left - parentRect.left}px)`
      });
    }
  }, [pathname]);

  return (
    <nav ref={containerRef} className="fixed top-0 left-0 z-50 w-full bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 lg:flex-none"
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={3}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">
              ESTATE<span className="text-amber-500">PRO</span>
            </span>
          </Link>
        </motion.div>

       <div className="flex items-center justify-center">
          {/* 👇 ตัว pill */}
          <div
            className="absolute top-3.5 left-0 bg-amber-500/10 border border-amber-500/20 rounded-full transition-all duration-300 ease-out" 
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
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
                style={{ color: active ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-white/20'}`} />
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl bg-white/5 text-white/60 border border-white/5"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>
      </div>

      

      {/* Mobile Menu (AnimatePresence for smooth exit) */ }
  <AnimatePresence>
    {isMobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0, y: -20 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -20 }}
        className="lg:hidden bg-[#0a0a0f] border-b border-white/5 overflow-hidden"
      >
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
      </motion.div>
    )}
  </AnimatePresence>
    </nav >
  );
};

export default Navbar;
