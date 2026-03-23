import express from 'express'
import {
  createConversation,
  deleteConversation,
  getAllConversations,
  getConversationById,
  updateConversation,
} from './conversations.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

export const conversationsRouter = express.Router()
  .get('/conversations', getAllConversations)
  .get('/conversations/:id', getConversationById)
  .post('/conversations', verifyToken, createConversation)
  .put('/conversations/:id', verifyToken, updateConversation)
  .delete('/conversations/:id', verifyToken, deleteConversation)
