import { api } from "@/lib/api";

export interface CreateReportDto {
  type: string;
  targetId?: string;
  title: string;
  description: string;
}

export const reportService = {
  createReport: async (data: CreateReportDto) => {
    const response = await api.post("/reports", data);
    return response.data;
  },
};
