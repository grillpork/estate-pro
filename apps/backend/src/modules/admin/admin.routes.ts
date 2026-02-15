import { Hono } from "hono";
import {
  getAllUsers,
  searchUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserImage,
} from "./admin.user.controller";
import {
  getAllProperties,
  getPropertyById,
  deleteProperty,
  updateProperty,
  updatePropertyImage,
  searchProperties,
  createProperty,
  updatePropertyStatus,
  getPublicProperties,
} from "./admin.poperty.controller";
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./notification.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { getAllLogs } from "./admin.logs.controller";

export const adminRoutes = new Hono()

  .get("/users/search", searchUsers)
  .get("/users", getAllUsers)
  .get("/users/:id", getUserById)

  .delete("/user/delete/:id", deleteUser)

  .put("/users/:id", updateUser)
  .put("/users/:id/image", updateUserImage)

  // Property routes
  .get("/properties/public", getPublicProperties)
  .get("/properties", getAllProperties)
  .get("/properties/:id", getPropertyById)
  .get("/properties/search", searchProperties)

  .post("/properties", createProperty)

  .put("/properties/:id/image", updatePropertyImage)
  .put("/properties/:id", updateProperty)
  .put("/properties/:id/status", authMiddleware, updatePropertyStatus)

  .delete("/properties/:id", deleteProperty)

  // Notification routes
  .get("/notifications", getAllNotifications)
  .get("/notifications/:id", getNotificationById)

  .post("/notifications", createNotification)

  .put("/notifications/:id/read", markAsRead)
  .put("/notifications/read-all", markAllAsRead)

  .delete("/notifications/:id", deleteNotification)

  // Logs routes
  .get("/logs", getAllLogs);