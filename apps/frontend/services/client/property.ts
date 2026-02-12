import { api } from "@/lib/api";

export const propertyService = {
  createProperty: async (data: any) => {
    const response = await api.post("/properties", data);
    return response.data;
  },
};

export const myPropertiesService = async () => {
  const response = await api.get("/properties/my");
  return response.data;
};

export const updatePropertyService = async (id: string, data: any) => {
  const response = await api.put(`/properties/${id}`, data);
  return response.data;
};

export const getPropertyById = async (id: string) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};
