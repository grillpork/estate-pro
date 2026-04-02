import express from 'express'
import {
  getAllUserSubscriptions,
  getMySubscription,
  getUserSubscriptionById,
  createUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
} from './userSubscriptions.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'
import { requireAdmin } from '../../middleware/requireAdmin.middleware.js'

export const userSubscriptionsRouter = express.Router()
  .get('/user-subscriptions', verifyToken, requireAdmin, getAllUserSubscriptions)
  .get('/user-subscriptions/me', verifyToken, getMySubscription)
  .get('/user-subscriptions/:id', verifyToken, getUserSubscriptionById)
  .post('/user-subscriptions', verifyToken, createUserSubscription)
  .put('/user-subscriptions/:id', verifyToken, updateUserSubscription)
  .delete('/user-subscriptions/:id', verifyToken, deleteUserSubscription)
