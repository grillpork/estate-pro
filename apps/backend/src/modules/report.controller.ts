import { Context } from "hono"
import { db } from "@/db";
import { report } from "@/db/schemas";
import { get } from "node:http";

export const getReports = async (c: Context) => {
    const reports = await db.select().from(report)
  return c.json(reports)
}

export const createReport = async(c: Context) => {
   const user = c.get("user");
    const body = await c.req.json<{
       
      title: string;
      description: string;
      userId: string;
    }>();
   const id = crypto.randomUUID();
   
   const [newReport] = await db.insert(report)
     .values({
       id,
       title: body.title,
       description: body.description,
        userId: user.id ,
     })
     .returning();
   
    return c.json(newReport);
}
