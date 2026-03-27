import { api } from "@/lib/api";

export const brandsService = {
  getAllBrands: async () => {
    const response = await api.get("/brands");
    return response.data;
  },
  getBrandById: async (id: string | number) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
  createBrand: async (data: any) => {
    const response = await api.post("/brands", data);
    return response.data;
  },
  updateBrand: async (id: string | number, data: any) => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },
  deleteBrand: async (id: string | number) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};
