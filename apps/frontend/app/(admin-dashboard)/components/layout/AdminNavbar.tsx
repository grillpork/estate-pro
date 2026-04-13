"use client";
import React, { useState, useEffect } from "react";
import UserBox from "@/components/UserBox";
import { Bell, Search, ArrowLeftToLine } from "lucide-react";
import { getAllNotifications } from "@/services/admin/notification";
import { useSidebar } from "../context/SidebarContext";

const AdminNavbar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isCollapsed, toggleSidebar } = useSidebar();

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
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-[#1F1F23] bg-[#0F0F12] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-[#1A1A1E]"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ArrowLeftToLine size={20} className={isCollapsed ? "rotate-180" : ""} />
        </button>
        <div className="relative group w-full max-w-md hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full bg-[#1A1A1E] text-neutral-300 pl-10 pr-4 py-2 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2.5 text-neutral-400 hover:text-white transition-colors rounded-xl hover:bg-[#1A1A1E] relative group">
          <Bell size={20} className="group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F0F12] animate-pulse"></span>
          )}
        </button>
        
        <div className="h-8 w-px bg-[#27272A] mx-1 md:mx-2" />
        
        <div className="min-w-[40px] md:min-w-[180px]">
          <UserBox variant="ghost" />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
