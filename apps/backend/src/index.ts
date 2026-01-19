import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { db } from "./db";
import { user } from "./db/schemas";

const app = new Hono();

// CORS middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/users", async (c) => {
  const users = await db
    .select({
      id: user.id,
      email: user.email,
    })
    .from(user);
  return c.json(users);
});

export default app;
