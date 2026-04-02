import { sql } from '../../database/schema/db.js'

// GET /conversations/:id/messages
export const getMessagesByConversation = async (req, res) => {
    try {
        const { id } = req.params
        const result = await sql`
            SELECT * FROM messages
            WHERE conversation_id = ${parseInt(id)}
            ORDER BY created_at ASC
        `

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

        const result = await sql`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES (${parseInt(id)}, ${senderId}, ${content})
            RETURNING *
        `

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

        const result = await sql`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES (
                ${parseInt(conversationId)},
                ${senderId ? parseInt(senderId) : null},
                ${content}
            )
            RETURNING *
        `

        return res.status(200).json({
            status: 'success',
            message: result[0]
        })
    } catch (error) {
        console.error('Webhook receive error:', error)
        return res.status(500).json({ message: 'Webhook error' })
    }
}
