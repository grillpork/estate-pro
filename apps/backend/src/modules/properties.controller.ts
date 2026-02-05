import { db } from "@/db";
import { properties } from "@/db/schemas";
import { Context } from "hono";
import { eq } from "drizzle-orm";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export const getProperties = async (c: Context) => {
  const property = await db.select().from(properties);
  return c.json(property);
};

//ค้นหาอสังหาด้วยชื่อ
export const searchProperties = async (c: Context) => {
  const title = c.req.query("title");
  const property = await db
    .select()
    .from(properties)
    .where(title ? eq(properties.title, title) : undefined);

  if (!property) {
    return c.json({ message: "Property not found" }, 404);
  }

  return c.json(property);
};
