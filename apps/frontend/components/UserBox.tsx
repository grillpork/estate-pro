"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, Sparkles, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { authService } from "@/services/auth";

const UserBox = ({
  variant = "default",
}: {
  variant?: "default" | "ghost";
}) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isPending)
    return <div className="text-white text-xs p-2">Loading...</div>;

  if (!session)
    return (
      <button
        className="bg-indigo-600 cursor-pointer text-white p-2 rounded-xl w-full text-xs font-medium hover:bg-indigo-700 transition-colors"
        onClick={() => router.push("/login")}
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
        <img
          className="w-9 h-9 rounded-lg object-cover bg-neutral-700"
          src={
            session.user.image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmn4pWrDE1f07NiO_-ALAPW18mUchf6vj9oA&s"
          }
          alt={session.user.name || "User"}
        />
        <div className="flex flex-col overflow-hidden text-left">
          <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
            {session.user.name || "User"}
          </p>
          <p className="text-[10px] text-neutral-400 truncate">
            {session.user.email}
          </p>
        </div>
      </div>
      <ChevronsUpDown className="ml-auto size-4 text-neutral-500 group-hover:text-white transition-colors" />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-0 left-68 w-full mb-2 bg-[#151517] border border-[#27272A] rounded-xl shadow-xl p-1 z-50 overflow-hidden min-w-[200px]">
          <div className="px-3 py-2 border-b border-[#27272A]">
            <p className="text-sm font-medium text-white truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-neutral-400 truncate">
              {session.user.email}
            </p>
          </div>

          <div className="p-1">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors">
              <Sparkles size={16} />
              Upgrade to Pro
            </button>
          </div>

          <div className="h-px bg-[#27272A] my-1" />

          <div className="p-1">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors">
              <User size={16} />
              Profile
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors">
              <Settings size={16} />
              Settings
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
    </div>
  );
};

export default UserBox;
