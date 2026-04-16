import { api } from "@/lib/api";

export const favoritesService = {
  getMyFavorites: async () => {
    const response = await api.get("/favorites/my");
    return response.data;
  },
  createFavorite: async (propertyId: string) => {
    const response = await api.post("/favorites", { propertyId });
    return response.data;
  },
  deleteFavorite: async (id: string) => {
    const response = await api.delete(`/favorites/${id}`);
    return response.data;
  },
  toggleFavorite: async (propertyId: string) => {
    const response = await api.post("/favorites/toggle", { propertyId });
    return response.data;
  },
};
