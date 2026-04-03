import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
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