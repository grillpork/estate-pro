import { api } from "@/lib/api";

export const adminNotificationService = {
  getAllNotifications: async () => {
    const response = await api.get("/admin/notifications");
    return response.data;
  },

  getNotificationById: async (id: string) => {
    const response = await api.get(`/admin/notifications/${id}`);
    return response.data;
  },

  createNotification: async (data: { title: string; message: string }) => {
    const response = await api.post("/admin/notifications", data);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/admin/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/admin/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/admin/notifications/${id}`);
    return response.data;
  },
};

// Export individual functions for convenience
export const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = adminNotificationService;
