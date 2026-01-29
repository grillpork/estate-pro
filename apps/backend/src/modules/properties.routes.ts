import { Hono } from "hono";
import { db } from "@/db";
import { properties } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { deleteFromR2, getR2PublicUrl, uploadToR2 } from "@/lib/r2";

const propertiesRoutes = new Hono();

propertiesRoutes.get("/properties", async (c) => {
    const property = await db.select().from(properties)
    return c.json(property);
});

propertiesRoutes.get("/properties/:id", async (c) => {
  const id = c.req.param("id");
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id));
  return c.json(property);
});

propertiesRoutes.post("/properties", async (c) => {
  const body = await c.req.json<{
    title: string;
    description?: string;
    floor: string;
    price: number;
    address: string;
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
    })
    .returning();

  return c.json(newProperty);
});

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
      const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
      await deleteFromR2(key);
    } catch (error) {
      console.error("Failed to delete image from R2:", error);
    }
  }

  return c.json({ message: "deleted" }, 200);
});

propertiesRoutes.put("/properties/:id", async (c) => {
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
      400
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

