import { db } from "@/db";
import { auditLogs } from "@/db/schemas";
import { Context } from "hono";

export const getAllLogs = async (c: Context) => {
  const logs = await db.query.auditLogs.findMany({
    with: {
      actor: true,
    },
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    limit: 50,
  });
  return c.json(logs);
};
