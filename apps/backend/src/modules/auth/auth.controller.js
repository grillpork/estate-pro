import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { users, roles } from '../../database/schema/index.js'

export const register = async (req, res) => {
    try {
        const { email, password, username, firstName, lastName, phoneNumber } = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }

        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const userRoles = await db.select().from(roles).where(eq(roles.name, 'user'))
        if (!userRoles[0]) {
            return res.status(500).json({ message: 'Default role not found, please seed roles first' })
        }
        const defaultRoleId = userRoles[0].id

        const hashedPassword = await bcrypt.hash(password, 10)

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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

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

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
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

        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        await db.update(users).set({
            resetToken: hashedToken,
            resetTokenExpiry,
            updatedAt: new Date(),
        }).where(eq(users.id, user.id))

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

export const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: 'Token, email, and new password are required' })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const [user] = await db.select().from(users).where(eq(users.email, email))

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' })
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        if (!user.resetToken || user.resetToken !== hashedToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' })
        }

        if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
            return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' })
        }

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