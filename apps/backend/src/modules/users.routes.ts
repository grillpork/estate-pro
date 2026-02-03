import { db } from "@/db";
import { user } from "@/db/schemas";
import { Hono } from "hono";
import { eq, like, or } from "drizzle-orm";
import { uploadToR2, getR2PublicUrl, deleteFromR2 } from "@/lib/r2";


const userRoutes = new Hono();

type User = {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
};

userRoutes.get("/users", async (c) => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user);
  return c.json(users);
});

userRoutes.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const users = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    })
    .from(user)
    .where(or(eq(user.id, String(id)), like(user.email, `${id}`)));
  return c.json(users);
});

userRoutes.delete("/user/delete/:id", async (c) => {
  const id = c.req.param("id");
  const deleteUser = await db.delete(user).where(eq(user.id, id)).returning();
  console.log("do log: ", deleteUser);
  if (!deleteUser) {
    return c.json({ message: "user not found" }, 400);
  }
  return c.json({ message: "ys" }, 200);
});

userRoutes.put("/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<User>();

  const [exitUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, id));

  if (!exitUser) {
    return c.json({ error: "ไม่เจอคน" });
  }

  const [updateUser]: any = await db
    .update(user)
    .set({
      ...(body.email && { email: body.email }),
      ...(body.name && { name: body.name }),
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });
  return c.json(updateUser);
});

userRoutes.put("/users/:id/image", async (c) => {
  const userId = c.req.param("id");
  console.log("➡️ upload image for user:", userId);

  const body = await c.req.parseBody();

  const file = Array.isArray(body.image)
    ? body.image[0]
    : body.image;

  if (!file || !(file instanceof File)) {
    console.error("❌ no file in request", body);
    return c.json({ error: "ไม่มีไฟล์" }, 400);
  }

  console.log("📦 file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  // -----------------------------
  // 1️⃣ หา user + image เก่า
  // -----------------------------
  const [existingUser] = await db
    .select({
      id: user.id,
      image: user.image, // ✅ ใช้ URL อย่างเดียว
    })
    .from(user)
    .where(eq(user.id, userId));

  if (!existingUser) {
    console.error("❌ user not found:", userId);
    return c.json({ error: "ไม่เจอ user" }, 404);
  }

  console.log("🖼️ old image url:", existingUser.image);

  // -----------------------------
  // 2️⃣ เตรียม key ใหม่ (fix path ให้ชัวร์)
  // -----------------------------
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const ext = extMap[file.type];
  const newKey = `users/${userId}/profile.png`;

  console.log("🆕 new upload key:", newKey);

  // -----------------------------
  // 3️⃣ upload รูปใหม่
  // -----------------------------
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadToR2(newKey, buffer, file.type);

  const publicUrl = getR2PublicUrl(newKey);
  console.log("🌍 new public url:", publicUrl);

  // -----------------------------
  // 4️⃣ update DB
  // -----------------------------
  await db
    .update(user)
    .set({
      image: publicUrl,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  // -----------------------------
  // 5️⃣ ลบรูปเก่า (จาก URL)
  // -----------------------------
  if (existingUser.image) {
    try {
      const oldUrl = new URL(existingUser.image);

      // ⚠️ DEBUG สำคัญมาก
      console.log("🧨 old image pathname:", oldUrl.pathname);

      // 🔥 จุดที่พังบ่อย
      const oldKey = oldUrl.pathname.replace(/^\/+/, "");

      console.log("🗑️ deleting key:", oldKey);

      await deleteFromR2(oldKey);

      console.log("✅ delete success:", oldKey);
    } catch (err) {
      console.error("❌ delete old image failed:", err);
    }
  } else {
    console.log("ℹ️ no old image to delete");
  }

  return c.json({
    message: "อัปเดตรูปเรียบร้อย",
    image: publicUrl,
  });
});



export { userRoutes };


