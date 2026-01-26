import { Hono } from "hono";
import { userRoutes } from "./modules/users.routes";
import { propertiesRoutes } from "./modules/properties.routes";
import { authRoutes } from "./modules/auth.routes";
import { corsMiddleware } from "./middleware/cors";
import { logger } from "hono/logger";

export const app = new Hono()
.use("*", corsMiddleware)
.use("*", logger())

.route('/', authRoutes)
.route("/", userRoutes)
.route("/", propertiesRoutes)

export  type App = typeof app;

const port = 4000;
console.log(`Server is running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch
}

