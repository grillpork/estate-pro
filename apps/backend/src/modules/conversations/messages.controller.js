import { eq, and, or, asc } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { messages, conversations } from '../../database/schema/index.js'

// GET /conversations/:id/messages
export const getMessagesByConversation = async (req, res) => {
    try {
        const { id } = req.params
        const result = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, parseInt(id)))
            .orderBy(asc(messages.createdAt))

        return res.status(200).json(result)
    } catch (error) {
        console.error('Get messages error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /conversations/:id/messages
export const sendMessage = async (req, res) => {
    try {
        const { id } = req.params
        const { content } = req.body
        const senderId = req.user.id

        const result = await db.insert(messages).values({
            conversationId: parseInt(id),
            senderId,
            content,
        }).returning()

        return res.status(201).json(result[0])
    } catch (error) {
        console.error('Send message error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /webhook/messages (Simulation for external systems like LINE)
export const receiveWebhookMessage = async (req, res) => {
    try {
        const { conversationId, senderId, content } = req.body

        // ในอนาคตคุณสามารถเพิ่ม Logic เช็ค signature หรือ validate data จาก LINE/FB ตรงนี้ได้ครับ
        const result = await db.insert(messages).values({
            conversationId: parseInt(conversationId),
            senderId: senderId ? parseInt(senderId) : null,
            content,
        }).returning()

        return res.status(200).json({
            status: 'success',
            message: result[0]
        })
    } catch (error) {
        console.error('Webhook receive error:', error)
        return res.status(500).json({ message: 'Webhook error' })
    }
}
