import { api } from "@/lib/api";
export const adminPropertiesService = {
  getAllProperties: async () => {
    const response = await api.get("/admin/properties");
    return response.data;
  },
  getPublicProperties: async () => {
    const response = await api.get("/admin/properties/public");
    return response.data;
  },
  getPropertyById: async (id: string) => {
    const response = await api.get(`/admin/properties/${id}`);
    return response.data;
  },
  deleteProperty: async (id: string) => {
    try {
      const response = await api.delete(`/admin/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting property:", error);
    }
    return null;
  },

  updateProperty: async (id: string, data: any) => {
    const response = await api.put(`/admin/properties/${id}`, data);
    return response.data;
  },

  createProperty: async (data: any) => {
    const response = await api.post("/admin/properties", data);
    return response.data;
  },

  updatePropertyImage: async (id: string, data: any) => {
    const response = await api.put(`/admin/properties/${id}/image`, data);
    return response.data;
  },

  searchProperties: async (searchTerm: string) => {
    const response = await api.get(
      `/admin/properties/search?query=${encodeURIComponent(searchTerm)}`,
    );
    return response.data;
  },

  updatePropertyStatus: async (id: string, status: string, reason?: string, brandId?: string) => {
    const response = await api.put(`/admin/properties/${id}/status`, {
      status,
      reason,
      brandId,
    });
    return response.data;
  },
};
