"use client";
import { useEffect, useState } from "react";
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from "@/services/admin/notification";
import { Bell, Check, CheckCheck } from "lucide-react";

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
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();

    // Polling ทุก 30 วินาทีเพื่อดึง notifications ใหม่
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 text-white p-4 bg-neutral-800 rounded-xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={24} /> การแจ้งเตือน
        </h1>
        <p className="text-neutral-400">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 text-white p-4 bg-neutral-800 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={24} /> การแจ้งเตือน
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 transition-colors text-sm"
          >
            <CheckCheck size={16} />
            อ่านทั้งหมด
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">ไม่มีการแจ้งเตือน</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                notification.status === "unread"
                  ? "bg-neutral-700 border-l-4 border-blue-500"
                  : "bg-neutral-900"
              }`}
            >
              <div className="flex-1">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-neutral-400 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString("th-TH")}
                </p>
              </div>
              {notification.status === "unread" && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="p-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 transition-colors"
                  title="ทำเครื่องหมายว่าอ่านแล้ว"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-sm text-neutral-500">
        รายการทั้งหมด {notifications.length} รายการ
      </p>
    </div>
  );
};

export default NotificationList;
