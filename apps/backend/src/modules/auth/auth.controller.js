import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { eq, or } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { users } from '../../database/schema/index.js'

// POST /auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phoneNumber, role } = req.body

        // 1. เช็ค format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }

        // 2. เช็คว่า username หรือ email ซ้ำไหม
        const existing = await db
            .select()
            .from(users)
            .where(or(eq(users.username, username), eq(users.email, email)))

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username or email already exists' })
        }

        // 2. Hash password ก่อน save
        const hashedPassword = await bcrypt.hash(password, 10)

        // 3. INSERT ลง database
        await db.insert(users).values({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            role: role || 'user', // ถ้าไม่ส่ง role มา ใช้ 'user' เป็น default
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

        // 1. หา user จาก email
        const result = await db
            .select()
            .from(users)
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
            { expiresIn: '1d' } // token หมดอายุใน 1 วัน
        )

        return res.status(200).json({
            message: 'Login successful',
            token,
        })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}