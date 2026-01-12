import { Hono } from "hono";

// Import all module routes
// import { authRoutes } from "@/modules/auth";


const v1 = new Hono();

// ===== Mount All Routes =====
// v1.route("/auth", authRoutes);


export default v1;
