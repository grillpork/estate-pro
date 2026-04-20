import { api } from "@/lib/api";

export type MembershipPlan = {
  id: number;
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  maxListings: number;
  canViewOwnerContact: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMembershipPlanPayload = Omit<MembershipPlan, "id" | "createdAt" | "updatedAt">;
export type UpdateMembershipPlanPayload = Partial<CreateMembershipPlanPayload>;

export const adminMembershipPlansService = {
  getAllPlans: async (): Promise<MembershipPlan[]> => {
    const response = await api.get("/membership-plans");
    return response.data;
  },

  getPlanById: async (id: number): Promise<MembershipPlan> => {
    const response = await api.get(`/membership-plans/${id}`);
    return response.data;
  },

  createPlan: async (data: CreateMembershipPlanPayload): Promise<MembershipPlan> => {
    const response = await api.post("/membership-plans", data);
    return response.data;
  },

  updatePlan: async (id: number, data: UpdateMembershipPlanPayload): Promise<MembershipPlan> => {
    const response = await api.put(`/membership-plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    await api.delete(`/membership-plans/${id}`);
  },
};
