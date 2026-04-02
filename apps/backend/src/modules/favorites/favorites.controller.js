import { sql } from '../../database/schema/db.js'

// GET /favorites
export const getAllFavorites = async (req, res) => {
    try {
        const result = await sql`SELECT * FROM favorites`
        return res.json(result)
    } catch (error) {
        console.error('getAllFavorites error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /favorites/:id
export const getFavoriteById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await sql`
            SELECT * FROM favorites WHERE id = ${Number(id)}
        `

        const favorite = result[0]
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' })
        }

        return res.json(favorite)
    } catch (error) {
        console.error('getFavoriteById error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /favorites
export const createFavorite = async (req, res) => {
    try {
        const now = new Date()
        const { propertyId, userId } = req.body

        let brandId = null
        let category = null

        // ดึง brandId และ category จาก property (ถ้ามี propertyId)
        if (propertyId) {
            const property = await sql`
                SELECT brand_id FROM properties WHERE id = ${Number(propertyId)}
            `
            if (property[0]?.brand_id) {
                brandId = property[0].brand_id

                const brand = await sql`
                    SELECT category FROM brands WHERE id = ${brandId}
                `
                if (brand[0]?.category) {
                    category = brand[0].category
                }
            }
        }

        const result = await sql`
            INSERT INTO favorites (user_id, property_id, brand_id, category, created_at, updated_at)
            VALUES (
                ${userId ?? null},
                ${propertyId ? Number(propertyId) : null},
                ${brandId},
                ${category},
                ${now},
                ${now}
            )
            RETURNING *
        `

        return res.status(201).json(result[0])
    } catch (error) {
        console.error('createFavorite error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// DELETE /favorites/:id
export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params

        const result = await sql`
            DELETE FROM favorites WHERE id = ${Number(id)} RETURNING *
        `

        if (result.length === 0) {
            return res.status(404).json({ message: 'Favorite not found' })
        }

        return res.json({ message: 'Favorite deleted' })
    } catch (error) {
        console.error('deleteFavorite error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
