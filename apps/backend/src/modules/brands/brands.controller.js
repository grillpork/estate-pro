import { eq } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { brands } from '../../database/schema/index.js'

// GET /brands
export const getAllBrands = async (req, res) => {
    try {
        const result = await db.select().from(brands)
        return res.json(result)
    } catch (error) {
        console.error('getAllBrands error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /brands/:id
export const getBrandById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await db
            .select()
            .from(brands)
            .where(eq(brands.id, Number(id)))

        const brand = result[0]
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' })
        }

        return res.json(brand)
    } catch (error) {
        console.error('getBrandById error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /brands
export const createBrand = async (req, res) => {
    try {
        const now = new Date()
        const payload = {
            ...req.body,
            createdAt: now,
            updatedAt: now,
        }

        const [created] = await db.insert(brands).values(payload).returning()
        return res.status(201).json(created)
    } catch (error) {
        console.error('createBrand error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// PUT /brands/:id
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params
        const body = { ...req.body, updatedAt: new Date() }

        const [updated] = await db
            .update(brands)
            .set(body)
            .where(eq(brands.id, Number(id)))
            .returning()

        if (!updated) {
            return res.status(404).json({ message: 'Brand not found' })
        }

        return res.json(updated)
    } catch (error) {
        console.error('updateBrand error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// DELETE /brands/:id
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params

        const [deleted] = await db
            .delete(brands)
            .where(eq(brands.id, Number(id)))
            .returning()

        if (!deleted) {
            return res.status(404).json({ message: 'Brand not found' })
        }

        return res.json({ message: 'Brand deleted' })
    } catch (error) {
        console.error('deleteBrand error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
