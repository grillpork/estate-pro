import { api } from "@/lib/api";

export const adminLogsService = {
  getAllLogs: async () => {
    const response = await api.get("/admin/logs");
    return response.data;
  },
};