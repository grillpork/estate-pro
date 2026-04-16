import { api } from "@/lib/api";

export const landmarkService = {
  getAllLandmarks: async (type?: string) => {
    const response = await api.get("/landmarks", {
      params: { type },
    });
    return response.data;
  },

  getNearbyLandmarks: async (lat: number, lng: number, radius: number = 1000, type?: string) => {
    const response = await api.get("/landmarks/nearby", {
      params: { lat, lng, radius, type },
    });
    return response.data;
  },
};
