import { sql } from '../../database/schema/db.js'

function isParticipant(req, row) {
    if (!req.user?.id) return false
    const uid = Number(req.user.id)
    return Number(row.user1_id) === uid || Number(row.user2_id) === uid
}

/** GET /conversations - ดึงเฉพาะห้องที่เกี่ยวข้องกับผู้ใช้ที่ล็อกอิน */
export const getAllConversations = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })
        const uid = Number(req.user.id)

        const result = await sql`
            SELECT * FROM conversations
            WHERE user1_id = ${uid} OR user2_id = ${uid}
        `

        return res.json(result)
    } catch (error) {
        console.error('getAllConversations error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/** GET /conversations/:id */
export const getConversationById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await sql`
            SELECT * FROM conversations WHERE id = ${Number(id)}
        `

        if (result.length === 0) {
            return res.status(404).json({ message: 'Conversation not found' })
        }

        const row = result[0]

        if (!isParticipant(req, row)) {
            return res.status(403).json({ message: 'Forbidden: you are not a participant of this conversation' })
        }

        return res.json(row)
    } catch (error) {
        console.error('getConversationById error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/** POST /conversations — body: { user1Id, user2Id, propertyId? } */
export const createConversation = async (req, res) => {
    try {
        const { user1Id, user2Id, propertyId } = req.body

        if (user1Id == null || user2Id == null) {
            return res.status(400).json({ message: 'user1Id and user2Id are required' })
        }

        const u1 = Number(user1Id)
        const u2 = Number(user2Id)

        if (Number.isNaN(u1) || Number.isNaN(u2)) {
            return res.status(400).json({ message: 'user1Id and user2Id must be numbers' })
        }

        if (u1 === u2) {
            return res.status(400).json({ message: 'user1Id and user2Id must be different' })
        }

        // ผู้ใช้ที่ล็อกอินต้องเป็นหนึ่งในสองฝ่าย
        if (req.user?.id) {
            const uid = Number(req.user.id)
            if (uid !== u1 && uid !== u2) {
                return res.status(403).json({ message: 'Forbidden: you must be user1 or user2' })
            }
        }

        // ค้นหาห้องแชทเดิมที่มีอยู่แล้ว (1:1 Persistent)
        const existing = await sql`
            SELECT id FROM conversations
            WHERE
                (user1_id = ${u1} AND user2_id = ${u2})
                OR
                (user1_id = ${u2} AND user2_id = ${u1})
            LIMIT 1
        `

        if (existing.length > 0) {
            return res.json(existing[0])
        }

        let pId = null
        if (propertyId != null && propertyId !== '') {
            pId = Number(propertyId)
            if (Number.isNaN(pId)) {
                return res.status(400).json({ message: 'propertyId must be a number' })
            }
        }

        const now = new Date()
        const result = await sql`
            INSERT INTO conversations (user1_id, user2_id, property_id, created_at, updated_at)
            VALUES (${u1}, ${u2}, ${pId}, ${now}, ${now})
            RETURNING *
        `

        return res.status(201).json(result[0])
    } catch (error) {
        console.error('createConversation error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/** PUT /conversations/:id */
export const updateConversation = async (req, res) => {
    try {
        const { id } = req.params
        const { user1Id, user2Id, propertyId } = req.body

        const existing = await sql`
            SELECT * FROM conversations WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Conversation not found' })
        }

        const row = existing[0]

        if (!isParticipant(req, row)) {
            return res.status(403).json({ message: 'Forbidden: not a participant' })
        }

        let u1 = row.user1_id
        let u2 = row.user2_id
        let pId = row.property_id

        if (user1Id !== undefined) {
            const parsed = Number(user1Id)
            if (Number.isNaN(parsed)) return res.status(400).json({ message: 'user1Id must be a number' })
            u1 = parsed
        }
        if (user2Id !== undefined) {
            const parsed = Number(user2Id)
            if (Number.isNaN(parsed)) return res.status(400).json({ message: 'user2Id must be a number' })
            u2 = parsed
        }
        if (propertyId !== undefined) {
            if (propertyId === null || propertyId === '') {
                pId = null
            } else {
                const parsed = Number(propertyId)
                if (Number.isNaN(parsed)) return res.status(400).json({ message: 'propertyId must be a number' })
                pId = parsed
            }
        }

        if (u1 === u2) {
            return res.status(400).json({ message: 'user1Id and user2Id must be different' })
        }

        const result = await sql`
            UPDATE conversations
            SET user1_id = ${u1}, user2_id = ${u2}, property_id = ${pId}, updated_at = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
        `

        return res.json(result[0])
    } catch (error) {
        console.error('updateConversation error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/** DELETE /conversations/:id */
export const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params

        const existing = await sql`
            SELECT * FROM conversations WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Conversation not found' })
        }

        if (!isParticipant(req, existing[0])) {
            return res.status(403).json({ message: 'Forbidden: not a participant' })
        }

        await sql`DELETE FROM conversations WHERE id = ${Number(id)}`

        return res.json({ message: 'Conversation deleted' })
    } catch (error) {
        console.error('deleteConversation error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
