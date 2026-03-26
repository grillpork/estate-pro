import express from 'express'
import {
  createMembershipPlan,
  deleteMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
} from './membershipPlans.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

export const membershipPlansRouter = express.Router()
  .get('/membership-plans', getAllMembershipPlans)
  .get('/membership-plans/:id', getMembershipPlanById)
  .post('/membership-plans', verifyToken, createMembershipPlan)
  .put('/membership-plans/:id', verifyToken, updateMembershipPlan)
  .delete('/membership-plans/:id', verifyToken, deleteMembershipPlan)
