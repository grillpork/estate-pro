import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { userRoutes } from "./modules/users/users.routes";
import { propertiesRoutes } from "./modules/properties/properties.routes";

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


app.route('/users', userRoutes);
app.route('/properties', propertiesRoutes);


export default app;
