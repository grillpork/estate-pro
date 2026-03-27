"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, PlusCircle, Search, Menu, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import UserBox from "./UserBox";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "หน้าแรก", href: "/", icon: Home },
    { name: "ประกาศขาย/เช่า", href: "/properties", icon: Building2 },
    { name: "ลงประกาศ", href: "/properties/create", icon: PlusCircle },
    { name: "ข้อความ", href: "/conversations", icon: MessageSquare },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Estate<span className="text-amber-500">Pro</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Search & Profile */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <UserBox variant="ghost" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#111118] border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(link.href)
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <div className="h-px bg-white/5 my-4 mx-2" />
            <div className="px-2 pt-2">
              <UserBox />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
