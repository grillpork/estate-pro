import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schemas/index";

const sql = neon(
  "postgresql://neondb_owner:npg_ISbr93tgVQwP@ep-shiny-scene-a1fsdxrf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
);
export const db = drizzle(sql, { schema });

export type Database = typeof db;
