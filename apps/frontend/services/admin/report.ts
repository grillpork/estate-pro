import { api } from "@/lib/api";

export const getAllReports = async () => {
  const response = await api.get("/admin/reports");
  return response.data;
};

export const updateReportStatus = async (id: number, status: string) => {
  const response = await api.patch(`/admin/reports/${id}/status`, { status });
  return response.data;
};
