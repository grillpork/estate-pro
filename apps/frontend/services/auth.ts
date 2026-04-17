import { api } from "@/lib/api";

export interface LoginCredentails {
  email: string;
  password: string;
}

export interface RegisterCredentails {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  login: async (credentials: LoginCredentails) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        // Set cookie for middleware access
        document.cookie = `token=${response.data.token}; path=/; max-age=86400; SameSite=Lax`;
        return { success: true };
      }
      return { success: false, error: "Invalid login" };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  register: async (credentials: RegisterCredentails) => {
    try {
      // Map name to username as the backend expects username
      const data = {
        ...credentials,
        username: credentials.name || credentials.email.split("@")[0],
      };
      const response = await api.post("/auth/register", data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    return { success: true };
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      return null;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      };
    }
  },

  resetPassword: async (token: string, email: string, newPassword: string) => {
    try {
      const response = await api.post("/auth/reset-password", { token, email, newPassword });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      };
    }
  },
};
