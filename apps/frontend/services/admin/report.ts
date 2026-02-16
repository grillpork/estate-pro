import { api } from "@/lib/api";

export const getAllReports = async () => {
  const response = await api.get("/admin/reports");
  return response.data;
};
