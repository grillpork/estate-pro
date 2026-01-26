import { Hono } from "hono";
import { db } from "./db";
import { user } from "./db/schemas";

const app = new Hono();

// Debug endpoint - ลบออกหลัง debug เสร็จ
app.get("/debug", async (c) => {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  // แสดงแค่ส่วนต้นเพื่อความปลอดภัย
  const maskedUrl =
    dbUrl.substring(0, 30) + "..." + dbUrl.substring(dbUrl.length - 20);

  return c.json({
    dbUrlSet: !!process.env.DATABASE_URL,
    dbUrlPreview: maskedUrl,
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
});

app.get("/users", async (c) => {
  console.log("Fetching users...");
  console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);

  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user);

    console.log("Users found:", users.length);
    return c.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: String(error) }, 500);
  }
});

export default app;
