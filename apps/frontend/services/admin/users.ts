import { api } from "@/lib/api";

export const adminUsersService = {
  searchUsers: async (search: string) => {
    const response = await api.get("/admin/users/search", {
      params: {
        search,
      },
    });
    return response.data;
  },

  // users.ts
  getAllUsers: async (page = 1, limit = 10, role = "all") => {
    const response = await api.get("/admin/users", {
      params: { page, limit, role },
    });
    return response.data;
  },

  getUserById: async (id: string) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },
  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/admin/user/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  updateUserImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.put(`/admin/users/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
