import { db } from '../../database/db.js'
import { reports, users } from '../../database/schema/index.js'
import { eq, sql } from 'drizzle-orm'

// POST /reports
export const createReport = async (req, res) => {
    try {
        const reporterId = req.user.id
        const { type, targetId, title, description } = req.body

        if (!type || !title || !description) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const [newReport] = await db.insert(reports).values({
            reporterId,
            type,
            targetId: targetId ? String(targetId) : null,
            title,
            description,
        }).returning()

        return res.status(201).json(newReport)
    } catch (error) {
        console.error('Create report error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /admin/reports
export const getAllReportsAdmin = async (req, res) => {
    try {
        const data = await db
            .select({
                id: reports.id,
                title: reports.title,
                description: reports.description,
                type: reports.type,
                targetId: reports.targetId,
                status: reports.status,
                createdAt: reports.createdAt,
                user: {
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    image: users.imagePath,
                }
            })
            .from(reports)
            .leftJoin(users, eq(reports.reporterId, users.id))
            .orderBy(sql`${reports.createdAt} DESC`)

        return res.status(200).json(data)
    } catch (error) {
        console.error('Get reports admin error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// PATCH /admin/reports/:id/status
export const updateReportStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!status) {
            return res.status(400).json({ message: 'Status is required' })
        }

        const [updated] = await db.update(reports)
            .set({ 
                status: status.toLowerCase(),
                updatedAt: new Date()
            })
            .where(eq(reports.id, parseInt(id)))
            .returning()

        if (!updated) {
            return res.status(404).json({ message: 'Report not found' })
        }

        return res.status(200).json(updated)
    } catch (error) {
        console.error('Update report status error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
