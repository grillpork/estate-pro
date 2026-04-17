import { api } from "@/lib/api";

export type ClientUserSubscription = {
  id: number;
  userId: number;
  planId: number;
  billingCycle: "monthly" | "yearly";
  startDate: string;
  endDate: string | null;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscribePayload = {
  planId: number;
  billingCycle: "monthly" | "yearly";
  autoRenew?: boolean;
};

export type QuotaCheck = {
  hasSubscription: boolean;
  canCreateListing: boolean;
  code: "OK" | "NO_SUBSCRIPTION" | "SUBSCRIPTION_EXPIRED" | "MAX_LISTINGS_REACHED";
  message: string | null;
  planName?: string;
  currentListings?: number;
  maxListings?: number;
};

export const clientUserSubscriptionsService = {
  getMySubscription: async (): Promise<ClientUserSubscription[]> => {
    const response = await api.get("/user-subscriptions/me");
    return response.data;
  },

  checkQuota: async (): Promise<QuotaCheck> => {
    const response = await api.get("/user-subscriptions/check-quota");
    return response.data;
  },

  subscribeToPlan: async (data: SubscribePayload): Promise<ClientUserSubscription> => {
    const response = await api.post("/user-subscriptions", data);
    return response.data;
  },

  cancelSubscription: async (id: number): Promise<ClientUserSubscription> => {
    const response = await api.put(`/user-subscriptions/${id}`, { status: "cancelled" });
    return response.data;
  },
};
