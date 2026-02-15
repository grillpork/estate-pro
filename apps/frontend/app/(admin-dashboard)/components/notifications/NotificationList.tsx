"use client";
import { useEffect, useState } from "react";
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from "@/services/admin/notification";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  title: string;
  message: string;
  status: "read" | "unread";
  createdAt: string;
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications();
      setNotifications(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)),
    );
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    await markAllAsRead();
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();

    // Polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 w-full">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20 animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <p className="text-neutral-400 text-sm">
            Stay updated with latest activities.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1E] text-indigo-400 border border-[#27272A] hover:bg-indigo-500/10 hover:border-indigo-500/50 hover:text-indigo-300 transition-all text-sm font-medium shadow-sm hover:shadow-indigo-500/20"
          >
            <CheckCheck
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Mark all as read
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 z-10 bg-[#0F0F12]">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4 min-h-[300px]">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1E] flex items-center justify-center border border-[#27272A] shadow-inner">
              <Bell size={24} className="text-neutral-600" />
            </div>
            <div className="text-center">
              <p className="text-neutral-400 font-medium">
                No notifications yet
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                We'll let you know when something arrives.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative group p-5 rounded-2xl border transition-all duration-300 ${
                  notification.status === "unread"
                    ? "bg-[#1A1A1E] border-indigo-500/30 shadow-lg shadow-black/20"
                    : "bg-[#151517] border-[#27272A] opacity-75 hover:opacity-100 hover:border-[#3F3F46]"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={`shrink-0 mt-1 p-2.5 rounded-xl ${
                      notification.status === "unread"
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "bg-[#27272A] text-neutral-500"
                    }`}
                  >
                    {notification.status === "unread" ? (
                      <Mail size={20} />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <h4
                        className={`text-sm font-semibold leading-tight ${
                          notification.status === "unread"
                            ? "text-white"
                            : "text-neutral-400"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <span className="shrink-0 text-[10px] text-neutral-500 flex items-center gap-1 bg-[#0F0F12] px-2 py-1 rounded-lg border border-[#27272A]">
                        <Clock size={10} />
                        {new Date(notification.createdAt).toLocaleTimeString(
                          "th-TH",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed font-light wrap-break-words">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-neutral-600 pt-1">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "th-TH",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  {/* Mark as read button (visible purely on hover/unread) */}
                  {notification.status === "unread" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-[#27272A] text-neutral-400 hover:text-green-400 hover:bg-green-500/10 border border-transparent hover:border-green-500/20 transition-all opacity-0 group-hover:opacity-100"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#27272A] flex justify-between items-center text-[10px] text-neutral-600 uppercase tracking-widest font-medium z-10 w-full">
        <p>Total: {notifications.length}</p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live Updates
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
