import { db } from "@/db";
import { properties } from "@/db/schemas";
import { Context } from "hono";


export const getProperties = async (c: Context) => {
  const property = await db.select().from(properties);
  return c.json(property);
};
