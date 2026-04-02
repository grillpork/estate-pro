import { Pool, neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless";
import dotenv from "dotenv";

dotenv.config();

// create a connection pool and attach Drizzle ORM to it
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

// Neon HTTP client สำหรับ Raw SQL (ใช้ template literal: sql`SELECT ...`)
export const sql = neon(process.env.DATABASE_URL);
