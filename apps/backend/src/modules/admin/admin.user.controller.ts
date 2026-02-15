import { db } from "@/db";
import { user } from "@/db/schemas";
import { deleteFromR2, getR2PublicUrl, uploadToR2 } from "@/lib/r2";
import { or, like, eq, sql } from "drizzle-orm";
import { Context } from "hono";

type User = {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  role?: "user" | "admin" | "superadmin";
};

//ดึงข้อมูล user ทั้งหมด
export const searchUsers = async (c: Context) => {
  const search = c.req.query("search") || "";
  const role = c.req.query("role");

  let users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
    })
    .from(user)
    .where(or(like(user.name, `%${search}%`), like(user.email, `%${search}%`)));

  if (role && role !== "all") {
    users = users.filter((u) => u.role === role);
  }
  return c.json(users);
};

export const getAllUsers = async (c: Context) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const offset = (page - 1) * limit;
  // ดึงข้อมูล + count
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
    })
    .from(user)
    .limit(limit)
    .offset(offset);
  const [{ count }] = await db.select({ count: sql`count(*)` }).from(user);
  return c.json({
    users,
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  });
};

//ดึงข้อมูล user ด้วย id
export const getUserById = async (c: Context) => {
  const id = c.req.param("id");

  const [foundUser] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, id));

  if (!foundUser) {
    return c.json({ error: "ไม่พบ user" }, 404);
  }

  return c.json(foundUser);
};

export const deleteUser = async (c: Context) => {
  const id = c.req.param("id");

  // 1️⃣ หา user ก่อนลบ เพื่อเอา image URL
  const [existingUser] = await db
    .select({
      id: user.id,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, id));

  if (!existingUser) {
    return c.json({ message: "user not found" }, 404);
  }

  // 2️⃣ ลบรูปจาก Cloudflare R2 (ถ้ามี)
  if (existingUser.image) {
    try {
      const imageUrl = new URL(existingUser.image);
      const imageKey = imageUrl.pathname.replace(/^\/+/, "");

      console.log("🗑️ deleting user image from R2:", imageKey);
      await deleteFromR2(imageKey);
      console.log("✅ deleted user image:", imageKey);
    } catch (err) {
      console.error("❌ failed to delete user image from R2:", err);
      // ไม่ต้อง return error เพราะยังต้องลบ user ต่อ
    }
  }

  // 3️⃣ ลบ user จาก database
  const deletedUser = await db.delete(user).where(eq(user.id, id)).returning();

  console.log("🗑️ deleted user:", deletedUser);

  return c.json({ message: "ลบ user และรูปภาพเรียบร้อยแล้ว" }, 200);
};

export const updateUserRole = async (c: Context) => {
  const id = c.req.param("id");
  const { role } = await c.req.json();

  const [updatedUser] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, id))
    .returning();

  if (!updatedUser) {
    return c.json({ error: "ไม่พบ user" }, 404);
  }

  return c.json(updatedUser);
};

export const updateUser = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<User>();

  const [exitUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, id));

  if (!exitUser) {
    return c.json({ error: "ไม่เจอคน" });
  }

  const [updateUser] = await db
    .update(user)
    // admin.routes.ts - PUT /users/:id
    .set({
      ...(body.email && { email: body.email }),
      ...(body.name && { name: body.name }),
      ...(body.role && { role: body.role }), // เพิ่มตรงนี้
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    });
  return c.json(updateUser);
};

export const updateUserImage = async (c: Context) => {
  const userId = c.req.param("id");
  console.log("➡️ upload image for user:", userId);

  const body = await c.req.parseBody();

  const file = Array.isArray(body.image) ? body.image[0] : body.image;

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
};
