import { api } from "@/lib/api";

export type UserSubscription = {
  id: number;
  userId: number;
  planId: number;
  billingCycle: "monthly" | "yearly";
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  // joined from backend
  userName?: string;
  userEmail?: string;
  planName?: string;
};

export type CreateUserSubscriptionPayload = {
  userId: number;
  planId: number;
  billingCycle: "monthly" | "yearly";
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
};

export type UpdateUserSubscriptionPayload = Partial<CreateUserSubscriptionPayload>;

export const adminUserSubscriptionsService = {
  getAllSubscriptions: async (): Promise<UserSubscription[]> => {
    const response = await api.get("/user-subscriptions");
    return response.data;
  },

  getSubscriptionById: async (id: number): Promise<UserSubscription> => {
    const response = await api.get(`/user-subscriptions/${id}`);
    return response.data;
  },

  createSubscription: async (data: CreateUserSubscriptionPayload): Promise<UserSubscription> => {
    const response = await api.post("/user-subscriptions", data);
    return response.data;
  },

  updateSubscription: async (id: number, data: UpdateUserSubscriptionPayload): Promise<UserSubscription> => {
    const response = await api.put(`/user-subscriptions/${id}`, data);
    return response.data;
  },

  deleteSubscription: async (id: number): Promise<void> => {
    await api.delete(`/user-subscriptions/${id}`);
  },
};
