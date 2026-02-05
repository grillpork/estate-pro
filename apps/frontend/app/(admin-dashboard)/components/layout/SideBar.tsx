"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Home, Settings, User, ChevronUp, Bell } from "lucide-react";
import UserBox from "@/components/UserBox";
import { getAllNotifications } from "@/services/admin/notification";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
  option?: {
    href: string;
    label: string;
    badge?: number;
    badgeColor?: string;
  }[];
};

const SideBar = () => {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "/dashboard/users",
  ]);
  const [unreadCount, setUnreadCount] = useState(0);

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
      icon: <Home size={20} />,
    },
    {
      href: "/dashboard/users",
      label: "ผู้ใช้",
      icon: <User size={20} />,
      option: [
        {
          href: "/dashboard/users/approve",
          label: "ยืนยันผู้ใช้",
          badge: 2,
          badgeColor: "bg-orange-400",
        },
        { href: "/dashboard/users", label: "รายชื่อผู้ใช้" },
      ],
    },
    {
      href: "/dashboard/properties",
      label: "ทรัพย์สิน",
      icon: <Building2 size={20} />,
      option: [
        { href: "/dashboard/properties/approve", label: "ยืนยันทรัพย์สิน" },
        { href: "/dashboard/properties", label: "รายชื่อทรัพย์สิน" },
      ],
    },
    {
      href: "/dashboard/settings",
      label: "ตั้งค่า",
      icon: <Settings size={20} />,
    },
    {
      href: "/dashboard/notification",
      label: "แจ้งเตือน",
      icon: <Bell size={20} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: "bg-red-500",
    },
  ];

  // Toggle expand/collapse menu
  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
    );
  };

  // เช็คว่า menu expand อยู่ไหม
  const isExpanded = (href: string) => expandedMenus.includes(href);

  // เช็คว่า submenu active หรือไม่
  const isOptionActive = (optionHref: string) => {
    // Exact match
    if (pathname === optionHref) return true;

    // สำหรับ path ที่อาจมี nested routes (เช่น /dashboard/users/123)
    // แต่ต้องไม่ใช่ parent path (เช่น /dashboard/users vs /dashboard/users/approve)
    const isParentPath = ["/dashboard/users", "/dashboard/properties"].includes(
      optionHref,
    );
    if (isParentPath) {
      // เช็คว่า pathname ขึ้นต้นด้วย optionHref แต่ต้องไม่ใช่ sub-route ที่มีใน navItems
      return (
        pathname.startsWith(optionHref + "/") && !pathname.includes("/approve")
      );
    }

    // สำหรับ path อื่นๆ ใช้ startsWith
    return pathname.startsWith(optionHref + "/");
  };

  // เช็คว่า parent มี submenu active ไหม
  const hasActiveSubmenu = (item: NavItem) => {
    return item.option?.some((opt) => isOptionActive(opt.href));
  };

  // เช็คว่า parent active หรือไม่
  const isParentActive = (item: NavItem) => {
    if (item.option) {
      return false;
    }
    return pathname === item.href;
  };

  return (
    <div className="flex flex-col h-screen gap-1 p-4 w-64 bg-neutral-900">
      <div className="text-white flex items-center gap-2 w-full">
        <Link
          href="/dashboard"
          className="flex items-center justify-center py-4"
        >
          <img src="/logoipsum-360.svg" alt="" className="w-64" />
        </Link>
      </div>
      {navItems.map((item) => (
        <div key={item.href}>
          {/* Parent Menu Item */}
          {item.option ? (
            // Menu with submenu - use div with onClick
            <motion.div
              className={`cursor-pointer p-2 rounded-xl ${
                isParentActive(item)
                  ? "bg-neutral-800 text-white"
                  : hasActiveSubmenu(item)
                    ? "text-white"
                    : "hover:bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
              onClick={() => toggleMenu(item.href)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-md ${
                      isParentActive(item) || hasActiveSubmenu(item)
                        ? "bg-neutral-700"
                        : ""
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded(item.href) ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp size={16} />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            // Menu without submenu - use Link
            <Link href={item.href}>
              <motion.div
                className={`cursor-pointer p-2 rounded-xl ${
                  isParentActive(item)
                    ? "bg-neutral-800 text-white"
                    : "hover:bg-neutral-800 text-neutral-400 hover:text-white"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-md ${
                        isParentActive(item) ? "bg-neutral-700" : ""
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {/* Badge for notification */}
                  {item.badge && (
                    <span
                      className={`${item.badgeColor || "bg-red-500"} text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
          )}

          {/* Submenu with animation */}
          <AnimatePresence>
            {item.option && isExpanded(item.href) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative ml-4 mt-1">
                  <div className="flex flex-col">
                    {item.option.map((option, index) => (
                      <div
                        key={option.href + option.label}
                        className="relative flex items-center"
                      >
                        {/* Curved connecting line */}
                        <div
                          className={`absolute left-0 w-4 h-5 border-l border-b border-neutral-700 rounded-bl-lg ${
                            index === (item.option?.length || 0) - 1 ? "" : ""
                          }`}
                          style={{ top: "-2px" }}
                        />
                        {/* Vertical line extension (except last item) */}
                        {index < (item.option?.length || 0) - 1 && (
                          <div
                            className="absolute left-0 w-px bg-neutral-700"
                            style={{ top: "18px", height: "calc(100% - 10px)" }}
                          />
                        )}

                        <Link
                          href={option.href}
                          key={option.href + option.label}
                          className="flex-1"
                        >
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.15, delay: index * 0.05 }}
                            className={`cursor-pointer ml-4 px-3 py-2.5 rounded-xl flex items-center justify-between ${
                              isOptionActive(option.href)
                                ? "bg-neutral-700 text-white"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            <span className="text-sm font-medium w-full">
                              {option.label}
                            </span>
                            {option.badge && (
                              <span
                                className={`${
                                  isOptionActive(option.href)
                                    ? "bg-amber-600"
                                    : "bg-neutral-600"
                                } text-white text-xs font-semibold px-2 py-0.5 rounded-sm min-w-[20px] text-center`}
                              >
                                {option.badge}
                              </span>
                            )}
                          </motion.div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <div className="mt-auto">
        <UserBox />
      </div>
    </div>
  );
};

export default SideBar;
