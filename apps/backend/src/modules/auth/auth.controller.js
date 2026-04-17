import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { users, roles } from '../../database/schema/index.js'

// POST /auth/register
export const register = async (req, res) => {
    try {
        const { email, password, username, firstName, lastName, phoneNumber } = req.body

        // 1. เช็ค format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }

        // 2. เช็คว่า email ซ้ำไหม
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        // 3. หา role 'user' พื้นฐาน
        const userRoles = await db.select().from(roles).where(eq(roles.name, 'user'))
        const defaultRoleId = userRoles[0]?.id || null

        // 4. Hash password ก่อน save
        const hashedPassword = await bcrypt.hash(password, 10)

        // 5. INSERT ลง database
        await db.insert(users).values({
            email,
            password: hashedPassword,
            username: username || email.split('@')[0],
            firstName,
            lastName,
            phoneNumber,
            roleId: defaultRoleId,
        })

        return res.status(201).json({ message: 'Register successful' })
    } catch (error) {
        console.error('Register error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // 1. หา user จาก email พร้อมข้อมูล role
        const result = await db
            .select({
                id: users.id,
                email: users.email,
                password: users.password,
                username: users.username,
                role: roles.name,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.email, email))

        const user = result[0]

        // 2. ถ้าไม่เจอ user ตอบ 401
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        // 3. เทียบ password กับ hash ใน DB
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        // 4. สร้าง JWT token (payload: email + role)
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // token หมดอายุใน 7 วัน
        )

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getRoles = async (req, res) => {
    try {
        const result = await db.select().from(roles)
        return res.status(200).json(result)
    } catch (error) {
        console.error('Get roles error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const addRole = async (req, res) => {
    try {
        const { name } = req.body
        const result = await db.insert(roles).values({
            name,
        })
        return res.status(201).json(result)
    } catch (error) {
        console.error('Add role error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await db
            .select({
                id: users.id,
                email: users.email,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
                imagePath: users.imagePath,
                phoneNumber: users.phoneNumber,
                role: roles.name,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.id, userId))

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.json(result[0])
    } catch (error) {
        console.error('Get profile error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const heartbeat = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })
        const userId = req.user.id
        await db.update(users).set({ lastSeen: new Date() }).where(eq(users.id, userId))
        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('Heartbeat error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        // Always return success to prevent email enumeration
        const [user] = await db.select().from(users).where(eq(users.email, email))

        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' })
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Store hashed token in DB
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        await db.update(users).set({
            resetToken: hashedToken,
            resetTokenExpiry,
            updatedAt: new Date(),
        }).where(eq(users.id, user.id))

        // Build reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

        // TODO: Replace with real email service (nodemailer) in production
        console.log('═══════════════════════════════════════════')
        console.log('📧 PASSWORD RESET LINK (dev mode)')
        console.log(`   Email: ${email}`)
        console.log(`   Link:  ${resetUrl}`)
        console.log(`   Expires: ${resetTokenExpiry.toLocaleString()}`)
        console.log('═══════════════════════════════════════════')

        return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' })
    } catch (error) {
        console.error('Forgot password error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: 'Token, email, and new password are required' })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        // Find user by email
        const [user] = await db.select().from(users).where(eq(users.email, email))

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' })
        }

        // Verify token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        if (!user.resetToken || user.resetToken !== hashedToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' })
        }

        // Check expiry
        if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
            return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' })
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await db.update(users).set({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            updatedAt: new Date(),
        }).where(eq(users.id, user.id))

        return res.status(200).json({ message: 'Password has been reset successfully' })
    } catch (error) {
        console.error('Reset password error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}