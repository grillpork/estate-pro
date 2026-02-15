import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth.middleware";
import { createReport, getReports } from "./report.controller";



export const reportRoutes = new Hono()

    .get("/reports", authMiddleware, getReports)

    .post("/reports", authMiddleware, createReport)


