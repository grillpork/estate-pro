import { Hono } from "hono";
import { db } from "@/db";
import { properties } from "@/db/schemas";
import { eq } from "drizzle-orm";

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
const deleteProperty = await db
.delete(properties)
.where(eq(properties.id, id))
.returning();

if (!deleteProperty) {
  return c.json({ message: "property not found" }, 400);
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

export { propertiesRoutes };

