import { getSession, signIn, signUp, signOut } from "@/lib/auth-client";

export interface LoginCredentails {
  email: string;
  password: string;
}
export interface RegisterCredentails {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  //login function
  async login(credentails: LoginCredentails) {
    try {
      //เรียกใช้ better-auth จาก lib/auth-client.ts
      const result = await signIn.email({
        email: credentails.email,
        password: credentails.password,
      });

      //ถ้า login ไม่สำเร็จ
      if (result.error) {
        return {
          success: false,
          error: result.error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        };
      }

      //ถ้า login สำเร็จ
      return {
        success: true,
        data: result.data,
      };
      //ถ้า login ไม่สำเร็จ
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      };
    }
  },

  async register(credentails: RegisterCredentails) {
    try {
      const result = await signUp.email({
        email: credentails.email,
        password: credentails.password,
        name: credentails.email.split("@")[0],
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      };
    }
  },

  async getSession() {
    try {
      const session = await getSession();
      return session;
    } catch (error) {
      console.error("ดึงขข้อมูลผิด:", error);
      return null;
    }
  },

  async logout() {
    try {
      await signOut();
      return {
        success: true,
      };
    } catch (error) {
      console.error("ออกจากระบบผิดพลาด:", error);
      return {
        success: false,
        error: "ออกจากระบบผิดพลาด",
      };
    }
  },
};
