import { eq, or, and } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { conversations } from '../../database/schema/index.js'

/** GET /conversations - ดึงเฉพาะห้องที่เกี่ยวข้องกับผู้ใช้ที่ล็อกอิน */
export const getAllConversations = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })
    const uid = Number(req.user.id)

    const result = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, uid),
          eq(conversations.user2Id, uid)
        )
      )
    return res.json(result)
  } catch (error) {
    console.error('getAllConversations error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /conversations/:id - เช็คสิทธิ์ก่อนดึงข้อมูลห้อง */
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params
    const [row] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, Number(id)))

    if (!row) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    // ตรวจสอบสิทธิ์ความเป็นส่วนตัว (Privacy Check)
    if (!isParticipant(req, row)) {
      return res.status(403).json({ message: 'Forbidden: you are not a participant of this conversation' })
    }

    return res.json(row)
  } catch (error) {
    console.error('getConversationById error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

function isParticipant(req, row) {
  if (!req.user?.id) return false
  const uid = Number(req.user.id)
  return Number(row.user1Id) === uid || Number(row.user2Id) === uid
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

    // 🔍 ค้นหาห้องแชทเดิมที่มีอยู่แล้ว (1:1 Persistent like IG)
    const [existing] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.user1Id, u1),
            eq(conversations.user2Id, u2)
          ),
          and(
            eq(conversations.user1Id, u2),
            eq(conversations.user2Id, u1)
          )
        )
      )

    if (existing) {
      return res.json(existing)
    }

    const now = new Date()
    const payload = {
      user1Id: u1,
      user2Id: u2,
      propertyId:
        propertyId != null && propertyId !== ''
          ? Number(propertyId)
          : null,
      createdAt: now,
      updatedAt: now,
    }

    if (payload.propertyId != null && Number.isNaN(payload.propertyId)) {
      return res.status(400).json({ message: 'propertyId must be a number' })
    }

    const [created] = await db.insert(conversations).values(payload).returning()
    return res.status(201).json(created)
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

    const [existing] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!isParticipant(req, existing)) {
      return res.status(403).json({ message: 'Forbidden: not a participant' })
    }

    const body = { updatedAt: new Date() }

    if (user1Id !== undefined) {
      const u1 = Number(user1Id)
      if (Number.isNaN(u1)) {
        return res.status(400).json({ message: 'user1Id must be a number' })
      }
      body.user1Id = u1
    }
    if (user2Id !== undefined) {
      const u2 = Number(user2Id)
      if (Number.isNaN(u2)) {
        return res.status(400).json({ message: 'user2Id must be a number' })
      }
      body.user2Id = u2
    }
    if (propertyId !== undefined) {
      if (propertyId === null || propertyId === '') {
        body.propertyId = null
      } else {
        const p = Number(propertyId)
        if (Number.isNaN(p)) {
          return res.status(400).json({ message: 'propertyId must be a number' })
        }
        body.propertyId = p
      }
    }

    const nextUser1 = body.user1Id ?? existing.user1Id
    const nextUser2 = body.user2Id ?? existing.user2Id
    if (nextUser1 === nextUser2) {
      return res.status(400).json({ message: 'user1Id and user2Id must be different' })
    }

    const [updated] = await db
      .update(conversations)
      .set(body)
      .where(eq(conversations.id, Number(id)))
      .returning()

    return res.json(updated)
  } catch (error) {
    console.error('updateConversation error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** DELETE /conversations/:id */
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params

    const [existing] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!isParticipant(req, existing)) {
      return res.status(403).json({ message: 'Forbidden: not a participant' })
    }

    await db.delete(conversations).where(eq(conversations.id, Number(id)))

    return res.json({ message: 'Conversation deleted' })
  } catch (error) {
    console.error('deleteConversation error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
