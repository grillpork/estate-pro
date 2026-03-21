import { eq } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'
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

        if (body.amenities !== undefined) {
            if (typeof body.amenities === 'string') {
                try {
                    body.amenities = JSON.parse(body.amenities)
                } catch (e) {
                    return res.status(400).json({ message: 'Invalid amenities JSON' })
                }
            }

            if (!Array.isArray(body.amenities)) {
                return res.status(400).json({ message: 'amenities must be an array' })
            }
        }

        const [created] = await db
            .insert(properties)
            .values({
                ...body,
                userId: Number(req.user.id),
            })
            .returning()
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

        if (body.amenities !== undefined) {
            if (typeof body.amenities === 'string') {
                try {
                    body.amenities = JSON.parse(body.amenities)
                } catch (e) {
                    return res.status(400).json({ message: 'Invalid amenities JSON' })
                }
            }

            if (!Array.isArray(body.amenities)) {
                return res.status(400).json({ message: 'amenities must be an array' })
            }
        }

        // ตรวจว่าทรัพย์สินนี้เป็นของ user คนนี้จริงหรือไม่
        const [existing] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, Number(id)))

        if (!existing) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing.userId !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        const [updated] = await db
            .update(properties)
            .set(body)
            .where(eq(properties.id, Number(id)))
            .returning()

        return res.json(updated)
    } catch (error) {
        console.error('updateProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// PUT /properties/:id/image
export const updatePropertyImage = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params

        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' })
        }

        // หา property เดิมเพื่อระบุ path รูปเก่า
        const [existing] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, Number(id)))

        if (!existing) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing.userId !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // ลบไฟล์รูปเก่าถ้ามี
        if (existing.imagePath) {
            const oldPath = path.resolve(process.cwd(), existing.imagePath)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete old property image:', err)
                }
            })
        }

        const [updated] = await db
            .update(properties)
            .set({ imagePath: req.file.path })
            .where(eq(properties.id, Number(id)))
            .returning()

        return res.json(updated)
    } catch (error) {
        console.error('updatePropertyImage error:', error)
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

        // หา record ก่อนเพื่อลบไฟล์
        const [existing] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, Number(id)))

        if (!existing) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing.userId !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        if (existing.imagePath) {
            const oldPath = path.resolve(process.cwd(), existing.imagePath)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete property image on delete:', err)
                }
            })
        }

        await db
            .delete(properties)
            .where(eq(properties.id, Number(id)))

        return res.json({ message: 'Property deleted' })
    } catch (error) {
        console.error('deleteProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

