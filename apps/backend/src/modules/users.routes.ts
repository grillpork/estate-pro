import { db } from "@/db";
import { user } from "@/db/schemas";
import { Hono } from "hono";
import { eq, like, or } from "drizzle-orm";


const userRoutes = new Hono();

type User = {
  name?: string;
  email?: string;
  password?: string;
};

userRoutes.get("/users", async (c) => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user);
  return c.json(users);
});

userRoutes.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const users = await db
    .select({
      id: user.id,
      eamil: user.email,
      name: user.name,
    })
    .from(user)
    .where(or(eq(user.id, String(id)), like(user.email, `${id}`)));
  return c.json(users);
});

userRoutes.delete("/user/delete/:id", async (c) => {
  const id = c.req.param("id");
  const deleteUser = await db.delete(user).where(eq(user.id, id)).returning();
  console.log("do log: ", deleteUser);
  if (!deleteUser) {
    return c.json({ message: "user not found" }, 400);
  }
  return c.json({ message: "ys" }, 200);
});

userRoutes.put("/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<User>();

  const [exitUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, id));

  if (!exitUser) {
    return c.json({ error: "ไม่เจอคน" });
  }

  const [updateUser]: any = await db
    .update(user)
    .set({
      ...(body.email && { email: body.email }),
      ...(body.name && { name: body.name }),
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  return c.json(updateUser);
});

export { userRoutes };


