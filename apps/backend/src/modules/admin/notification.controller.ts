import { db } from "@/db";
import { notifications } from "@/db/schemas";
import { Context } from "hono";
import { eq } from "drizzle-orm";

// ดึง notifications ทั้งหมด
export const getAllNotifications = async (c: Context) => {
  const result = await db.select().from(notifications);
  return c.json(result);
};

// ดึง notification ตาม id
export const getNotificationById = async (c: Context) => {
  const id = c.req.param("id");
  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, id));

  if (!notification) {
    return c.json({ error: "Notification not found" }, 404);
  }
  return c.json(notification);
};

// สร้าง notification ใหม่
export const createNotification = async (c: Context) => {
  const body = await c.req.json<{
    title: string;
    message: string;
  }>();

  if (!body.title || !body.message) {
    return c.json({ error: "Title and message are required" }, 400);
  }

  const [newNotification] = await db
    .insert(notifications)
    .values({
      title: body.title,
      message: body.message,
    })
    .returning();

  return c.json(newNotification, 201);
};

// อัปเดตสถานะเป็น read
export const markAsRead = async (c: Context) => {
  const id = c.req.param("id");

  const [updated] = await db
    .update(notifications)
    .set({ status: "read", updatedAt: new Date() })
    .where(eq(notifications.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Notification not found" }, 404);
  }
  return c.json(updated);
};

// อัปเดตทั้งหมดเป็น read
export const markAllAsRead = async (c: Context) => {
  await db.update(notifications).set({ status: "read", updatedAt: new Date() });

  return c.json({ message: "All notifications marked as read" });
};

// ลบ notification
export const deleteNotification = async (c: Context) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(notifications)
    .where(eq(notifications.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Notification not found" }, 404);
  }
  return c.json({ message: "Notification deleted" });
};
