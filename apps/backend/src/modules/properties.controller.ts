import { db } from "@/db";
import { properties } from "@/db/schemas";
import { Context } from "hono";
import { eq, and } from "drizzle-orm";

export interface Property {
  id?: string;
  title: string;
  description?: string;
  price: number;
  bedroom?: number;
  bathroom?: number;
  size?: number;
  image?: string;
  userId?: string;
  status?: "pending" | "approved" | "rejected";
  type?: "rent" | "sale";
  category?: "house" | "condo" | "land";
  furnitureStatus?: "complete" | "partial" | "empty";
  amenities?: string[];
  floor: string;
  address: string;
}

export const getProperties = async (c: Context) => {
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.status, "approved"));
  return c.json(property);
};

export const myProperties = async (c: Context) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "ยังไม่ได้เข้าสู่ระบบ" }, 401);
  }

  let result = await db.query.properties.findMany({
    where: eq(properties.userId, user.id),
    with: {
      Owner: true,
    },
    // orderBy: (properties, {desc} =>  [desc(properties.createdAt)]),
  });
  return c.json(result);
};

export const getPropertyById = async (c: Context) => {
  const id = c.req.param("id");
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      Owner: true,
    },
  });

  if (!property) {
    return c.json({ message: "Property not found" }, 404);
  }

  return c.json(property);
};

export const updateMyProperty = async (c: Context) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "ยังไม่ได้เข้าสู่ระบบ" }, 401);
  }
  const id = c.req.param("id");
  const body = await c.req.json<Property>();

  const [existingProperty] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, user.id)));

  if (!existingProperty) {
    return c.json({ message: "property not found" }, 400);
  }

  const clearBody = {
    title: body.title,
    description: body.description || null,
    floor: body.floor,
    price: body.price,
    bedroom: body.bedroom,
    bathroom: body.bathroom,
    size: body.size,
    image: body.image,
    type: body.type,
    category: body.category ,
    furnitureStatus: body.furnitureStatus ,
    address: body.address,
    amenities: body.amenities,
  };

  const [updatedProperty] = await db
    .update(properties)
    .set({
      ...clearBody,
      status: "pending",
      updatedAt: new Date(),
    })
    .where(and(eq(properties.id, id), eq(properties.userId, user.id)))
    .returning();

  return c.json(updatedProperty);
};

export const createProperty = async (c: Context) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "ยังไม่ได้เข้าสู่ระบบ" }, 401);
  }

  let body = await c.req.json<Property>();

  const price = Number(body.price);
  const bedroom = Number(body.bedroom)
  const bathroom =Number(body.bathroom)
  const size =  Number(body.size)
  const type = body.type 
  const category = body.category 
  const furnitureStatus = body.furnitureStatus 
  const image = body.image 
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
      bedroom,
      bathroom,
      size,
      image,
      type,
      category,
      furnitureStatus,
      address: body.address,
      userId: user.id,
      amenities: body.amenities,
      status: "pending", 
    })
    .returning();

  return c.json(newProperty);
};
