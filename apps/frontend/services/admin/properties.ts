import { api } from "@/lib/api";
export const adminPropertiesService = {
  getAllProperties: async () => {
    const response = await api.get("/admin/properties");
    return response.data;
  },
  getPropertyById: async (id: string) => {
    const response = await api.get(`/admin/properties/${id}`);
    return response.data;
  },
  deleteProperty: async (id: string) => {
    const response = await api.delete(`/admin/properties/${id}`);
    return response.data;
  },

  updateProperty: async (id: string, data: any) => {
    const response = await api.put(`/admin/properties/${id}`, data);
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
};
