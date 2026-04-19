import { api } from "@/lib/api";

export const getAllBrandsService = async () => {
  const response = await api.get("/brands");
  return response.data;
};
