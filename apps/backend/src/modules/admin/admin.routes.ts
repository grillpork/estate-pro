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
} from "./admin.poperty.controller";
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./notification.controller";

export const adminRoutes = new Hono()

  .get("/users/search", searchUsers)

  .get("/users", getAllUsers)

  .get("/users/:id", getUserById)

  .delete("/user/delete/:id", deleteUser)

  .put("/users/:id", updateUser)

  .put("/users/:id/image", updateUserImage)

  .get("/properties", getAllProperties)

  .get("/properties/search", searchProperties)

  .get("/properties/:id", getPropertyById)

  .delete("/properties/:id", deleteProperty)

  .put("/properties/:id", updateProperty)

  .put("/properties/:id/image", updatePropertyImage)

  .post("/properties", createProperty)

  // Notification routes
  .get("/notifications", getAllNotifications)

  .get("/notifications/:id", getNotificationById)

  .post("/notifications", createNotification)

  .put("/notifications/:id/read", markAsRead)

  .put("/notifications/read-all", markAllAsRead)

  .delete("/notifications/:id", deleteNotification);
