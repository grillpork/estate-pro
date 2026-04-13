import express from 'express'
import { getUsers, updateUser, deleteUser, getStats, getNotifications, getAdminProperties, getLogs, getReports, searchUsers, markAsRead, markAllAsRead, updatePropertyStatus } from './admin.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'
import { requireAdmin } from '../../middleware/requireAdmin.middleware.js'

const router = express.Router()

// All routes here require authentication and admin role
router.use(verifyToken, requireAdmin)

router.get('/users/search', searchUsers)
router.get('/users', getUsers)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/stats', getStats)
router.get('/notifications', getNotifications)
router.put('/notifications/read-all', markAllAsRead)
router.put('/notifications/:id/read', markAsRead)
router.get('/properties', getAdminProperties)
router.put('/properties/:id/status', updatePropertyStatus)
router.get('/logs', getLogs)
router.get('/reports', getReports)

export default router
