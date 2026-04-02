import { sql } from '../../database/schema/db.js'

// GET /brands
export const getAllBrands = async (req, res) => {
    try {
        const result = await sql`SELECT * FROM brands`
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
        const result = await sql`
            SELECT * FROM brands WHERE id = ${Number(id)}
        `

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
        const { name, category, isActive } = req.body
        const now = new Date()

        const result = await sql`
            INSERT INTO brands (name, category, is_active, created_at, updated_at)
            VALUES (
                ${name ?? null},
                ${category ?? null},
                ${isActive ?? true},
                ${now},
                ${now}
            )
            RETURNING *
        `

        return res.status(201).json(result[0])
    } catch (error) {
        console.error('createBrand error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// PUT /brands/:id
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params
        const { name, category, isActive } = req.body

        // เช็คว่ามีอยู่จริง
        const existing = await sql`SELECT id FROM brands WHERE id = ${Number(id)}`
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Brand not found' })
        }

        const result = await sql`
            UPDATE brands
            SET
                name       = COALESCE(${name ?? null}, name),
                category   = COALESCE(${category ?? null}, category),
                is_active  = COALESCE(${isActive ?? null}, is_active),
                updated_at = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
        `

        return res.json(result[0])
    } catch (error) {
        console.error('updateBrand error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// DELETE /brands/:id
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params

        const result = await sql`
            DELETE FROM brands WHERE id = ${Number(id)} RETURNING *
        `

        if (result.length === 0) {
            return res.status(404).json({ message: 'Brand not found' })
        }

        return res.json({ message: 'Brand deleted' })
    } catch (error) {
        console.error('deleteBrand error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
