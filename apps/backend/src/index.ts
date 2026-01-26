import { Hono } from "hono";
import { db } from "./db";
import { user } from "./db/schemas";

const app = new Hono();

app.get("/users", async (c) => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user);
  return c.json(users);
});

export default app;
