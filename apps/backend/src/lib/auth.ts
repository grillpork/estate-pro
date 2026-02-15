import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schemas";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  secret: process.env.BETTER_AUTH_SECRET || "hCf1n4l96S1CnidZkDx6d2XgOQAcfW9G",

  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],

  baseURL: "http://localhost:3000",
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    disableCSRFCheck: process.env.NODE_ENV === "development",
  },

  // databaseHooks คือฟีเจอร์ของ Better Auth ที่ให้เราสามารถ "ดักจับ" (Hook) การทำงานกับ Database ได้
  databaseHooks: {
    // session คือตารางที่เราต้องการจะดักจับ (ในที่นี้คือตาราง Session ที่เก็บการเข้าสู่ระบบ)
    session: {
      // create คือ Action (การสร้างข้อมูล) ที่เราต้องการดักจับ
      create: {
        // before คือ "ก่อน" ที่จะทำการสร้าง Session จริงๆ ลง Database
        // session คือข้อมูล session ที่กำลังจะถูกสร้าง (มี userId, token, expiresAt ฯลฯ)
        before: async (session) => {
          // ค้นหาข้อมูล User เจ้าของ session นี้จาก Database
          // โดยใช้ userId ที่อยู่ใน session มาหา
          const user = await db.query.user.findFirst({
            where: (users, { eq }) => eq(users.id, session.userId),
          });
          // ตรวจสอบสถานะ User ว่าเป็น "inactive" หรือ "deleted" หรือไม่
          if (user?.status === "inactive" || user?.status === "deleted") {
            // ถ้าใช่ ให้ return false
            // การ return false ใน Hook 'before' ของ Better Auth = "ยกเลิกการทำคำสั่งนี้"
            // ทำให้ Session ไม่ถูกสร้าง และการ Login ล้มเหลวทันที
            return false;
          }
          // ถ้า User สถานะปกติ ให้ return ข้อมูล session กลับไป
          // เพื่อให้ Better Auth ทำงานต่อ (สร้าง Session ลง Database)
          // ต้อง return ในรูปแบบ { data: ... } ตามข้อกำหนดของ Library
          return {
            data: session,
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
