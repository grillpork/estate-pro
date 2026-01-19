import { Hono } from "hono";
import { auth } from "./lib/auth";
import { db } from "./db";
import { user } from "./db/schemas";
const app = new Hono();

app.get("/", (c) => c.text("Hello World"));

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default app;
