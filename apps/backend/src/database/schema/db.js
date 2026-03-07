import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless";
import dotenv from "dotenv";

dotenv.config();

// create a connection pool and attach Drizzle ORM to it
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool); // now db exposes ORM methods such as select(), insert(), etc.
