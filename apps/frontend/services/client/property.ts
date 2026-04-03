import { api } from "@/lib/api";

export const propertyService = {
  createProperty: async (data: any) => {
    const response = await api.post("/properties", data);
    return response.data;
  },
  updatePropertyImage: async (id: string, data: File | FormData) => {
    let formData = data;
    if (data instanceof File) {
      formData = new FormData();
      formData.append("image", data);
    }
    const response = await api.put(`/properties/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadPropertyImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("images", file);
    });
    const response = await api.post(`/properties/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export const getAllPropertiesService = async () => {
  const response = await api.get("/properties");
  return response.data;
};
