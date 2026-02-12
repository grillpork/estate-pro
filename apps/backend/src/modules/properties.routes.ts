import { Hono } from "hono";
import { db } from "@/db";
import { properties } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { deleteFromR2, getR2PublicUrl, uploadToR2 } from "@/lib/r2";
import {
  createProperty,
  getProperties,
  myProperties,
  updateMyProperty,
  getPropertyById,
} from "./properties.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const propertiesRoutes = new Hono();

//เรีียกใช้ controller
propertiesRoutes.get("/properties", getProperties);

propertiesRoutes.post("/properties", authMiddleware, createProperty);

propertiesRoutes.get("/properties/my", authMiddleware, myProperties);

propertiesRoutes.get("/properties/:id", getPropertyById);
propertiesRoutes.put("/properties/:id", authMiddleware, updateMyProperty);

propertiesRoutes.delete("/properties/:id", async (c) => {
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
});

propertiesRoutes.put("/properties/:id/upload-image", async (c) => {
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
});

export { propertiesRoutes };
