"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Home,
  Settings,
  User,
  Bell,
  Search,
  Sparkles,
  LifeBuoy,
  FileText,
  Inbox,
  PanelLeft,
  ArrowLeftToLine,
  Crown,
  CreditCard,
} from "lucide-react";
import UserBox from "@/components/UserBox";
import { getAllNotifications } from "@/services/admin/notification";
import { useSession } from "@/lib/auth-client";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
};

const SideBar = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const session = useSession();

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const notifications = await getAllNotifications();
        if (Array.isArray(notifications)) {
          const unread = notifications.filter(
            (n: { status: string }) => n.status === "unread",
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotificationCount();
    // Polling ทุก 30 วินาที
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "หน้าแรก",
      icon: <Home size={18} />,
    },
    {
      href: "/dashboard/users",
      label: "ผู้ใช้",
      icon: <User size={18} />,
      badge: 2,
      badgeColor: "bg-orange-500",
    },
    {
      href: "/dashboard/properties",
      label: "ทรัพย์สิน",
      icon: <Building2 size={18} />,
    },
    {
      href: "/dashboard/membership-plans",
      label: "แพ็กเกจ",
      icon: <Crown size={18} />,
    },
    {
      href: "/dashboard/user-subscriptions",
      label: "สมัครสมาชิก",
      icon: <CreditCard size={18} />,
    },
    {
      href: "/dashboard/notification",
      label: "แจ้งเตือน",
      icon: <Bell size={18} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: "bg-red-500",
    },
    {
      href: "/dashboard/reports",
      label: "รายงาน",
      icon: <FileText size={18} />,
    },
  ];

  // Extra items for visual completeness based on the example (linked to # for now)
  const otherItems = [
    { href: "#", label: "Documentation", icon: <FileText size={18} /> },
    { href: "#", label: "Inbox", icon: <Inbox size={18} /> },
    { href: "#", label: "Support", icon: <LifeBuoy size={18} /> },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      className={`flex flex-col h-screen ${isCollapsed ? "w-20" : "w-72"} bg-[#151517] border-r border-[#1F1F23] text-sm  font-sans transition-all duration-300`}
    >
      {/* Header */}
      <div
        className={`py-6 flex flex-col ${isCollapsed ? "items-center px-0" : "px-6"}`}
      >
        <div
          className={`relative flex items-center ${isCollapsed ? "justify-center mb-6 flex-col gap-4" : "justify-between mb-6 w-full"}`}
        >
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "EstatePro" : ""}
          >
            <div className="min-w-8 w-8 h-8 rounded-md bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {!isCollapsed && (
              <span className="text-white font-bold text-xl tracking-tight group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                EstatePro
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-0 -right-10 p-2 bg-[#151517] cursor-pointer text-neutral-500 hover:text-white transition-colors rounded-lg hover:bg-[#1A1A1E] ${isCollapsed ? "" : ""}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ArrowLeftToLine size={18} className={isCollapsed ? "rotate-180" : ""} />
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed ? (
          <div className="relative group w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2  text-neutral-500 group-focus-within:text-indigo-400 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#1A1A1E] text-neutral-300 pl-10 pr-12 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 border border-[#333] rounded px-1.5 py-0.5 text-[10px] items-center flex">
              <span className="mr-0.5">⌘</span>F
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <button
              className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-[#1A1A1E] transition-colors"
              title="Search"
            >
              <Search size={18} />
            </button>
          </div>
        )}
      </div>

      <hr className="border-[#27272A]" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide py-2">
        {/* Main Menu */}
        <div className="w-full">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="block mb-1 w-full"
                >
                  <div
                    className={`relative overflow-hidden flex items-center ${isCollapsed ? "justify-center px-0 w-full" : "justify-start px-3"} py-2.5 rounded-xl transition-all duration-300 group ${
                      active
                        ? "bg-[#141418] text-white shadow-lg shadow-black/30"
                        : "text-neutral-400 hover:text-white hover:bg-[#1A1A1E]"
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    {/* Gradient Background for Active */}
                    {active && (
                      <div className="absolute inset-0 bg-linear-to-r inset-shadow-sm inset-shadow-neutral-700/50 opacity-100 rounded-xl pointer-events-none" />
                    )}

                    {/* Left Glow Bar for Active - Only show when expanded */}
                    {active && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-indigo-500 rounded-r-md shadow-[0_0_10px_#6366f1]" />
                    )}

                    <div
                      className={`flex items-center gap-3 relative z-10 ${isCollapsed ? "" : "pl-2 w-full"}`}
                    >
                      <span
                        className={`shrink-0 ${active ? "text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.6)]" : "text-neutral-500 group-hover:text-white"} transition-colors duration-200`}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`ml-auto ${item.badgeColor || "bg-red-500"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[18px] text-center shadow-sm`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span
                        className={`absolute top-2 right-2 w-2 h-2 ${item.badgeColor || "bg-red-500"} rounded-full border border-[#151517]`}
                      ></span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <hr className="border-[#27272A]" />

        {/* Other Section */}
        <div className="w-full">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-neutral-600 mb-3 px-3 uppercase tracking-wider whitespace-nowrap overflow-hidden">
              Other
            </p>
          )}
          <div className="space-y-1">
            {otherItems.map((item, idx) => (
              <Link href={item.href} key={idx} className="block w-full">
                <div
                  className={`flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-3 pl-5"} py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-[#1A1A1E] transition-colors group relative overflow-hidden`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span
                    className={`shrink-0 text-neutral-500 group-hover:text-white transition-colors`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div
        className={`p-4 bg-[#0F0F12] border-t border-[#1F1F23] space-y-4 ${isCollapsed ? "flex flex-col items-center px-2" : ""}`}
      >
        {/* User Profile */}
        <div
          className={`pt-1 w-full ${isCollapsed ? "flex justify-center" : ""}`}
        >
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer transition-colors">
              <User size={18} />
            </div>
          ) : (
            <UserBox variant="ghost" />
          )}
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
