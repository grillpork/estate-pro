import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schemas";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  secret: process.env.BETTER_AUTH_SECRET || "hCf1n4l96S1CnidZkDx6d2XgOQAcfW9G",

  trustedOrigins: [
    "http://localhost:3000", 
    "http://localhost:3001", 
  ],

  baseURL: "http://localhost:3000",
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    disableCSRFCheck: process.env.NODE_ENV === "development",
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;


