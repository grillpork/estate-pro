import express from 'express'
import {
  createConversation,
  deleteConversation,
  getAllConversations,
  getConversationById,
  updateConversation,
} from './conversations.controller.js'
import {
  getMessagesByConversation,
  sendMessage,
  receiveWebhookMessage
} from './messages.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

export const conversationsRouter = express.Router()
  .get('/conversations', verifyToken, getAllConversations)
  .post('/conversations', verifyToken, createConversation)
  .get('/conversations/:id', verifyToken, getConversationById)
  .put('/conversations/:id', verifyToken, updateConversation)
  .delete('/conversations/:id', verifyToken, deleteConversation)
  // Message Routes
  .get('/conversations/:id/messages', verifyToken, getMessagesByConversation)
  .post('/conversations/:id/messages', verifyToken, sendMessage)
  // Webhook Simulation
  .post('/webhook/messages', receiveWebhookMessage)
