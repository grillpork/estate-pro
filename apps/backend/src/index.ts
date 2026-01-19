import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { db } from "./db";
import { user } from "./db/schemas";
import { eq, ilike, or } from "drizzle-orm";
import { string } from "zod";

const app = new Hono();

type User = {
  name?: string,
  email?: string,
  password?: string,

}

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
app.get('/users/:id', async (c) => {
  //สร้างตัวแปรไอดีมารับการแสดงผลไอดีของ user
  const id = c.req.param('id')
  //ดึงข้แมูลมาแสดงจาก db
  const users = await db
    .select({
      id: user.id,
      eamil: user.email,
      name: user.name

    })
    .from(user)
    .where(
      or(
        eq(user.id, String(id)),
        ilike(user.email, `${id}`)
      )
    )
  //แสดงผลยูสเซอร์
  return c.json(users)
});

app.delete('/user/delete/:id', async (c) => {
  const id = c.req.param('id')
  const deleteUser = await db
    .delete(user)
    .where(eq(user.id, id)
    ).returning()
    console.log('do log: ',deleteUser)
  if (!deleteUser) {
    return c.json({ message: "user not found" },400 )
  }
  return c.json({ message: "ys" }, 200)
});

app.put('/users/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<User>()

  const [exitUser] = await db
  .select({id: user.id})
  .from(user)
  .where(eq(user.id, id))
  
  if (!exitUser) {
    return c.json({error: "ไม่เจอคน"})
  }
  
  const [updateUser] : any = await db
  .update(user)
  .set({
    ...(body.email && {email: body.email}),
    ...(body.name && {name: body.name}),
    updatedAt: new Date()
  })
  .where(eq(user.id, id))
  .returning({
    id: user.id,
    email: user.email,
    name: user.name,

  })
  return c.json(updateUser)
})

export default app;
