import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { db } from "./db";
import { user, properties } from "./db/schemas";
import { eq, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";

const app = new Hono();

type User = {
  name?: string;
  email?: string;
  password?: string;
};

type Property = {
  title: string;
  description?: string;
  floor: string;
  price: number;
  address: string;
};

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
      name: user.name,
      email: user.email,
    })
    .from(user);
  return c.json(users);
});

//ดึงตาม id
app.get("/users/:id", async (c) => {
  //สร้างตัวแปรไอดีมารับการแสดงผลไอดีของ user
  const id = c.req.param("id");
  //ดึงข้แมูลมาแสดงจาก db
  const users = await db
    .select({
      id: user.id,
      eamil: user.email,
      name: user.name,
    })
    .from(user)
    .where(or(eq(user.id, String(id)), ilike(user.email, `${id}`)));
  //แสดงผลยูสเซอร์
  return c.json(users);
});

app.delete("/user/delete/:id", async (c) => {
  const id = c.req.param("id");
  const deleteUser = await db.delete(user).where(eq(user.id, id)).returning();
  console.log("do log: ", deleteUser);
  if (!deleteUser) {
    return c.json({ message: "user not found" }, 400);
  }
  return c.json({ message: "ys" }, 200);
});

app.put("/users/:id", async (c) => {
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

app.post("/properties", async (c) => {
  const body = await c.req.json<{
    title: string;
    description?: string;
    floor: string;
    price: number;
    address: string;
  }>();

  const price = Number(body.price);
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
      address: body.address,
    })
    .returning();

  return c.json(newProperty);
});

app.get("/properties", async (c) => {
  const Propertys = await db.select().from(properties);
  return c.json(Propertys);
});

app.get("/properties/:id", async (c) => {
  const id = c.req.param("id");
  const [Propertys] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id));
  return c.json(Propertys);
});

app.delete("/properties/:id", async (c) => {
const id = c.req.param("id");
const deleteProperty = await db
.delete(properties)
.where(eq(properties.id, id))
.returning();

if (!deleteProperty) {
  return c.json({ message: "property not found" }, 400);
}
return c.json({ message: "deleted" }, 200);
});

app.put("/properties/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    title: string;
    description?: string;
    floor: string;
    price: number;
    address: string;
  }>();

  if (!body.title || !body.floor || !body.price || !body.address) {
    return c.json({ error: "ข้อมูลไม่ครบ" });
  }

  const price = Number(body.price);
  if (isNaN(price)) {
    return c.json({ error: "Invalid price" }, 400);
  }

  const [updateProperty] = await db
    .update(properties)
    .set({
      title: body.title,
      description: body.description || null,
      floor: body.floor,
      price: price,
      address: body.address,
    })
    .where(eq(properties.id, id))
    .returning();

  return c.json(updateProperty);
});




export default app;
