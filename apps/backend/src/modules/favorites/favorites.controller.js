import { eq } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { favorites, properties, brands } from '../../database/schema/index.js'

// GET /favorites
export const getAllFavorites = async (req, res) => {
    try {
        const result = await db.select().from(favorites)
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
        const result = await db
            .select()
            .from(favorites)
            .where(eq(favorites.id, Number(id)))

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
        
        let additionalData = {}
        if (req.body.propertyId) {
            const [property] = await db.select().from(properties).where(eq(properties.id, req.body.propertyId))
            if (property?.brandId) {
                additionalData.brandId = property.brandId
                
                const [brand] = await db.select().from(brands).where(eq(brands.id, property.brandId))
                if (brand?.category) {
                    additionalData.category = brand.category
                }
            }
        }

        const payload = {
            ...req.body,
            ...additionalData,
            createdAt: now,
            updatedAt: now,
        }

        const [created] = await db.insert(favorites).values(payload).returning()
        return res.status(201).json(created)
    } catch (error) {
        console.error('createFavorite error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


// DELETE /favorites/:id
export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params

        const [deleted] = await db
            .delete(favorites)
            .where(eq(favorites.id, Number(id)))
            .returning()

        if (!deleted) {
            return res.status(404).json({ message: 'Favorite not found' })
        }

        return res.json({ message: 'Favorite deleted' })
    } catch (error) {
        console.error('deleteFavorite error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
