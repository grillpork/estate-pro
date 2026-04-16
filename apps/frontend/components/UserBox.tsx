"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User, Sparkles, ChevronsUpDown, Building2, Heart, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth";
import ReportModal from "./ReportModal";

const UserBox = ({
  variant = "default",
}: {
  variant?: "default" | "ghost";
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push("/auth/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading)
    return <div className="text-white text-xs p-2">Loading...</div>;

  if (!user)
    return (
      <button
        className="bg-amber-600 cursor-pointer text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-amber-700 transition-colors shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
        onClick={() => router.push("/auth/sign-in")}
      >
        Sign in
      </button>
    );

  const containerClass =
    variant === "ghost"
      ? "bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10"
      : "bg-neutral-800 border border-neutral-700";

  return (
    <div
      className={`relative flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer group ${containerClass}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 rounded-lg bg-neutral-700 flex items-center justify-center text-white/40 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors overflow-hidden">
          <img 
            src={user.imagePath 
              ? `http://localhost:4000/${user.imagePath.replace(/\\/g, '/')}` 
              : "/images/userIcon.png"} 
            alt={user.username} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/userIcon.png";
            }}
          />
        </div>
        <div className="flex flex-col overflow-hidden text-left">
          <p className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
            {user.firstName || user.username || "User"}
          </p>
          <p className="text-[10px] text-neutral-400 truncate">
            {user.email}
          </p>
        </div>
      </div>
      <ChevronsUpDown className="ml-auto size-4 text-neutral-500 group-hover:text-white transition-colors" />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-[#151517] border border-[#27272A] rounded-xl shadow-xl p-1 z-50 overflow-hidden min-w-[200px]">
          <div className="px-3 py-2 border-b border-[#27272A]">
            <p className="text-sm font-medium text-white truncate">
              {user.firstName || user.username}
            </p>
            <p className="text-xs text-neutral-400 truncate">
              {user.email}
            </p>
          </div>

          <div className="p-1">
            <div className="text-[10px] text-amber-500/60 uppercase tracking-widest font-bold flex items-center gap-1.5 px-3 py-2 bg-amber-500/5 rounded-lg mb-1">
              <Sparkles size={12} className="animate-pulse" />
              <span>{user.role || 'user'}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors"
            >
              <User size={16} />
              Profile
            </button>
            <button 
               onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                router.push("/my-properties");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors"
            >
              <Building2 size={16} />
              My Properties
            </button>
            <button 
               onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                router.push("/favorites");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors"
            >
              <Heart size={16} />
              Your Favorites
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors">
              <Settings size={16} />
              Settings
            </button>
            <button 
                onClick={(e) => {
                 e.stopPropagation();
                 setIsOpen(false);
                 setIsReportModalOpen(true);
               }}
               className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors border-t border-white/5 mt-1 pt-2"
             >
               <AlertTriangle size={16} className="text-red-500/50" />
               Report an Issue
             </button>
          </div>

          <div className="h-px bg-[#27272A] my-1" />

          <div className="p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}

      <ReportModal 
         isOpen={isReportModalOpen}
         onClose={() => setIsReportModalOpen(false)}
         initialType="website"
         targetName="Website/General Issue"
      />
    </div>
  );
};

export default UserBox;
