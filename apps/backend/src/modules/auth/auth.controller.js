import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sql } from '../../database/schema/db.js'

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
        const existing = await sql`
            SELECT id FROM users WHERE email = ${email}
        `
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        // 3. หา role 'user' พื้นฐาน
        const userRoles = await sql`
            SELECT id FROM roles WHERE name = 'user' LIMIT 1
        `
        const defaultRoleId = userRoles[0]?.id || null

        // 4. Hash password ก่อน save
        const hashedPassword = await bcrypt.hash(password, 10)

        // 5. INSERT ลง database
        await sql`
            INSERT INTO users (email, password, username, first_name, last_name, phone_number, role_id)
            VALUES (
                ${email},
                ${hashedPassword},
                ${username || email.split('@')[0]},
                ${firstName ?? null},
                ${lastName ?? null},
                ${phoneNumber ?? null},
                ${defaultRoleId}
            )
        `

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
        const result = await sql`
            SELECT
                u.id,
                u.email,
                u.password,
                u.username,
                r.name AS role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = ${email}
            LIMIT 1
        `

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

        // 4. สร้าง JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
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
        const result = await sql`SELECT * FROM roles`
        return res.status(200).json(result)
    } catch (error) {
        console.error('Get roles error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const addRole = async (req, res) => {
    try {
        const { name } = req.body
        const result = await sql`
            INSERT INTO roles (name) VALUES (${name}) RETURNING *
        `
        return res.status(201).json(result[0])
    } catch (error) {
        console.error('Add role error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await sql`
            SELECT
                u.id,
                u.email,
                u.username,
                u.first_name  AS "firstName",
                u.last_name   AS "lastName",
                r.name        AS role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = ${userId}
            LIMIT 1
        `

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
        await sql`
            UPDATE users SET last_seen = NOW() WHERE id = ${userId}
        `
        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('Heartbeat error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}