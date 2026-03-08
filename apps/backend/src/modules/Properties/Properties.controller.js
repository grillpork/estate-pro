import { eq } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { properties } from '../../database/schema/index.js'

// GET /properties
export const getAllProperties = async (req, res) => {
    try {
        const result = await db.select().from(properties)
        return res.json(result)
    } catch (error) {
        console.error('getAllProperties error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /properties/:id
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await db
            .select()
            .from(properties)
            .where(eq(properties.id, Number(id)))

        const property = result[0]
        if (!property) {
            return res.status(404).json({ message: 'Property not found' })
        }

        return res.json(property)
    } catch (error) {
        console.error('getPropertyById error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getMyProperties = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const result = await db
            .select()
            .from(properties)
            .where(eq(properties.userId, Number(req.user.id)))

        return res.json(result)
    } catch (error) {
        console.error('getMyProperties error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /properties
export const createProperty = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const body = { ...req.body }
        if (body.availableDate) {
            const d = new Date(body.availableDate)
            body.availableDate = isNaN(d.getTime()) ? undefined : d
        } else {
            body.availableDate = new Date()
        }

        const payload = {
            ...req.body,
            userId: Number(req.user.id),
        }

        const [created] = await db.insert(properties).values(payload).returning()
        return res.status(201).json(created)
    } catch (error) {
        console.error('createProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// PUT /properties/:id
export const updateProperty = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params
        const body = { ...req.body }

        if (body.availableDate !== undefined) {
            const d = new Date(body.availableDate)
            body.availableDate = isNaN(d.getTime()) ? null : d
        }

        const [updated] = await db
            .update(properties)
            .set(req.body)
            .where(eq(properties.id, Number(id)))
            .returning()

        if (!updated) {
            return res.status(404).json({ message: 'Property not found' })
        }

        return res.json(updated)
    } catch (error) {
        console.error('updateProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// DELETE /properties/:id
export const deleteProperty = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params

        const [deleted] = await db
            .delete(properties)
            .where(eq(properties.id, Number(id)))
            .returning()

        if (!deleted) {
            return res.status(404).json({ message: 'Property not found' })
        }

        return res.json({ message: 'Property deleted' })
    } catch (error) {
        console.error('deleteProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
