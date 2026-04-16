import { api } from "@/lib/api";

export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (id: number, data: UpdateUserDto) => {
    try {
      const response = await api.patch(`/api/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  uploadAvatar: async (id: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await api.put(`/api/users/${id}/profile-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getPublicProfile: async (id: number) => {
    try {
      const response = await api.get(`/api/users/${id}/public-profile`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
