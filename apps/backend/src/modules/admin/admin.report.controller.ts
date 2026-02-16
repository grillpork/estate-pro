import { Context } from "hono";
import { db } from "@/db";

export const getAllReports = async (c: Context) => {
    const result = await db.query.report.findMany({
        with: {
            user: true,
        },
    });
    return c.json(result);
};