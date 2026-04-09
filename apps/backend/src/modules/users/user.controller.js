import { sql } from '../../database/schema/db.js'
import { rowToCamel, rowsToCamel } from '../../utils/mapCase.js'
import fs from 'fs'
import path from 'path'

export const getAllUsers = async (req, res) => {
    console.log('Current user (req.user):', req.user)
    const users = await sql`SELECT * FROM users`
    return res.json(rowsToCamel(users))
}

export const getUserById = async (req, res) => {
    console.log('Current user metadata (req.user):', req.user)
    const id = req.params.id
    const user = await sql`SELECT * FROM users WHERE id = ${Number(id)}`
    return res.json(rowsToCamel(user))
}

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id
        const user = req.user

        // Authorization check: Only user themselves or admin can update
        if (Number(id) !== Number(user.id) && user.role !== 'admin' && user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden: คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้อื่น' })
        }

        const { username, firstName, lastName, password, phoneNumber, roleId } = req.body

        const result = await sql`
            UPDATE users
            SET
                username     = COALESCE(${username ?? null}, username),
                first_name   = COALESCE(${firstName ?? null}, first_name),
                last_name    = COALESCE(${lastName ?? null}, last_name),
                password     = COALESCE(${password ?? null}, password),
                phone_number = COALESCE(${phoneNumber ?? null}, phone_number),
                role_id      = COALESCE(${roleId ? Number(roleId) : null}, role_id),
                updated_at   = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
        `

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.json(rowToCamel(result[0]))
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id
    const result = await sql`
        DELETE FROM users WHERE id = ${Number(id)} RETURNING *
    `
    console.log('user deleted', result)
    if (result.length === 0) {
        return res.status(400).json({ message: 'user not deleted' })
    }
    return res.status(200).json({ message: 'ok' })
}

// PUT /api/users/:id/profile-image
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params

        if (Number(id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: ไม่สามารถแก้ไขรูปของผู้ใช้คนอื่น' })
        }

        const file = req.file
            ? req.file
            : (req.files && req.files.length > 0)
                ? req.files[0]
                : null

        if (!file) {
            return res.status(400).json({
                message: 'ไม่พบไฟล์รูปภาพ',
                hint: 'ส่งไฟล์ผ่าน form-data ด้วย key ชื่อ "image"'
            })
        }

        const existing = await sql`
            SELECT id, image_path FROM users WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        // ลบไฟล์รูปเก่าออกจาก disk (ถ้ามี)
        if (existing[0].image_path) {
            const oldPath = path.resolve(process.cwd(), existing[0].image_path)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete old profile image:', err)
                }
            })
        }

        const newImagePath = file.path.replace(process.cwd() + path.sep, '')
        const result = await sql`
            UPDATE users
            SET image_path = ${newImagePath}, updated_at = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
        `

        return res.json(rowToCamel(result[0]))
    } catch (error) {
        console.error('uploadProfileImage error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
