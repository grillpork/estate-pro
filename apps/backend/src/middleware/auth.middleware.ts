import { Context, Next } from "hono";
import { auth, Session, User } from "@/lib/auth";

declare module "hono" {
  interface ContextVariableMap {
    session: Session["session"];
    user: Session["user"];
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  //ตรวจสอบว่ามี Session อยู่จริงไหม?
  if (!session) {
    return c.json({
      message: "ยังไม่ได้เข้าสู่ระบบ",
    }, 401);
  }

  //ส่งข้อมูล Session ไปยัง Route Handler
  c.set("session", session.session);
  c.set("user", session.user);

  await next();
};
