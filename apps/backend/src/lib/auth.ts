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
  allowUntrustedOrigins: true,
  secret: "hCf1n4l96S1CnidZkDx6d2XgOQAcfW9G",

  baseURL: "http://localhost:4000",
  basePath: "/api/auth",

  trustedOrigins: [
    "http://localhost:3000", // frontend
    "http://localhost:4000", // backend
  ],

  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
