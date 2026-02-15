import { db } from "@/db";
import { notifications, properties, auditLogs } from "@/db/schemas";
import { Context } from "hono";
import { eq, like } from "drizzle-orm";
import { deleteFromR2, getR2PublicUrl, uploadToR2 } from "@/lib/r2";

export const searchProperties = async (c: Context) => {
  const query = c.req.query("query");
  const result = await db
    .select()
    .from(properties)
    .where(like(properties.title, `%${query}%`));
  return c.json(result);
};

export const getAllProperties = async (c: Context) => {
  const result = await db.query.properties.findMany({
    with: {
      Owner: true, // ดึงข้อมูล User (relation ชื่อ Owner ที่ตั้งไว้ใน schema)
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });
  return c.json(result);
};

export const getPublicProperties = async (c: Context) => {
  const result = await db.query.properties.findMany({
    where: eq(properties.status, "approved"), // สำคัญ! กรองเฉพาะที่อนุมัติแล้ว
    with: {
      Owner: true, // ดึงข้อมูลเจ้าของประกาศมาด้วย
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });
  return c.json(result);
};

export const getPropertyById = async (c: Context) => {
  const id = c.req.param("id");
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id));
  return c.json(property);
};

export const deleteProperty = async (c: Context) => {
  const id = c.req.param("id");
  const [deleteProperty] = await db
    .delete(properties)
    .where(eq(properties.id, id))
    .returning({
      id: properties.id,
      image: properties.image,
    });

  if (!deleteProperty) {
    return c.json({ message: "property not found" }, 400);
  }
  if (deleteProperty.image) {
    try {
      const url = new URL(deleteProperty.image);
      const key = url.pathname.startsWith("/")
        ? url.pathname.slice(1)
        : url.pathname;
      await deleteFromR2(key);
    } catch (error) {
      console.error("Failed to delete image from R2:", error);
    }
  }

  return c.json({ message: "deleted" }, 200);
};

export const updateProperty = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    title: string;
    description?: string;
    floor: string;
    price: number;
    address: string;
  }>();

  if (!body.title || !body.floor || !body.price || !body.address) {
    return c.json({ error: "ข้อมูลไม่ครบ" });
  }

  const price = Number(body.price);
  if (isNaN(price)) {
    return c.json({ error: "Invalid price" }, 400);
  }

  const [updateProperty] = await db
    .update(properties)
    .set({
      title: body.title,
      description: body.description || null,
      floor: body.floor,
      price: price,
      address: body.address,
    })
    .where(eq(properties.id, id))
    .returning();

  return c.json(updateProperty);
};

export const updatePropertyImage = async (c: Context) => {
  const id = c.req.param("id");

  const body = await c.req.parseBody();

  const file = body["image"] ?? body["file"];

  if (!file || !(file instanceof File)) {
    return c.json(
      {
        error:
          'กรุณาส่งไฟล์แบบ multipart/form-data โดยใช้ field "image" หรือ "file"',
      },
      400,
    );
  }

  const [existingProperty] = await db
    .select({
      id: properties.id,
      image: properties.image,
    })
    .from(properties)
    .where(eq(properties.id, id));

  if (!existingProperty) {
    return c.json({ error: "ไม่พบข้อมูลอสังหา" }, 400);
  }

  try {
    if (existingProperty.image) {
      try {
        const oldUrl = new URL(existingProperty.image);
        const oldKey = oldUrl.pathname.startsWith("/")
          ? oldUrl.pathname.slice(1)
          : oldUrl.pathname;
        await deleteFromR2(oldKey);
      } catch (error) {
        console.error("Failed to delete old image from R2:", error);
      }
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `properties/${id}/image-${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await uploadToR2(fileName, buffer, file.type);

    const publicUrl = getR2PublicUrl(fileName);

    const [updatedProperty] = await db
      .update(properties)
      .set({
        image: publicUrl,
      })
      .where(eq(properties.id, id))
      .returning();

    return c.json(updatedProperty);
  } catch (error) {
    console.error(error);
    return c.json({ error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" }, 500);
  }
};

export const createProperty = async (c: Context) => {
  // ดึง user จาก session (ต้องผ่าน authMiddleware ก่อน)
  const user = c.get("user");

  if (!user?.id) {
    return c.json({ error: "Unauthorized - ไม่พบข้อมูล user" }, 401);
  }

  const body = await c.req.json<{
    title: string;
    description?: string;
    floor: string;
    price: number;
    address: string;
    status?: "pending" | "approved" | "rejected";
    name: string;
    amenities: string[];
  }>();

  const price = Number(body.price);
  const id = crypto.randomUUID();
  if (isNaN(price)) {
    return c.json({ error: "Invalid price" }, 400);
  }

  const [newProperty] = await db
    .insert(properties)
    .values({
      id,
      title: body.title,
      description: body.description || null,
      floor: body.floor,
      price: price,
      address: body.address,
      userId: user.id, // ดึงจาก session อัตโนมัติ
      amenities: body.amenities,
    })
    .returning();

  // สร้าง notification แจ้ง admin ว่ามีอสังหาใหม่รอตรวจสอบ
  await db.insert(notifications).values({
    title: "🏠 อสังหาใหม่รอตรวจสอบ",
    message: `มีการลงประกาศอสังหาใหม่: "${body.title}" ราคา ${price.toLocaleString()} บาท`,
  });

  return c.json(newProperty);
};

//------------ update status property
export const updatePropertyStatus = async (c: Context) => {
  //ดึง user จาก session
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  //ดึง id จาก param
  const id = c.req.param("id");

  //ดึงข้อมูลจาก body
  const body = await c.req.json<{
    status: "pending" | "approved" | "rejected";
    reason?: string;
  }>();

  //หา status เดิมก่อน เพื่อเอาไปเก็บ Log
  const [oldProperty] = await db
    .select({ status: properties.status })
    .from(properties)
    .where(eq(properties.id, id));

  if (oldProperty) c.json({ error: "ไม่พบข้อมูลอสังหา" }, 400);

  //อัปเดตข้อมูล
  const [updatedProperty] = await db
    .update(properties)
    .set({
      status: body.status,
      rejectionReason: body.status === "rejected" ? body.reason : null,
    })
    .where(eq(properties.id, id))
    .returning();

  //บันทึก Audit Log ลงฐานข้อมูล
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    actorId: user.id, // ใครทำ (Admin ID)
    action: body.status === "approved" ? "approve" : "reject", // ทำอะไร
    entityType: "property", // ทำกับอะไร
    entityId: id, // ID ของอสังหาฯ
    details: {
      oldStatus: oldProperty.status, // สถานะเก่า
      newStatus: body.status, // สถานะใหม่
      reason: body.reason, // เหตุผล (ถ้ามี)
    },
  });

  return c.json(updatedProperty);
};
