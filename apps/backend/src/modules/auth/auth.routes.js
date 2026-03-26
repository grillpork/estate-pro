import express from 'express'
import { register, login, getRoles, addRole, getMe } from './auth.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/roles', getRoles)
router.post('/roles', addRole)
router.get('/me', verifyToken, getMe)

export default router