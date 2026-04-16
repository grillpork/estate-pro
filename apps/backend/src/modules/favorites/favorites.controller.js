import { eq,and } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { favorites, properties, brands,propertyImages } from '../../database/schema/index.js'

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

// GET /favorites/my
export const getMyFavorites = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const result = await db
            .select({
                favorite: favorites,
                property: properties,
                mainImage: propertyImages.imagePath,
                brand: brands
            })
            .from(favorites)
            .innerJoin(properties, eq(favorites.propertyId, properties.id))
            .leftJoin(propertyImages, eq(properties.imageId, propertyImages.id))
            .leftJoin(brands, eq(properties.brandId, brands.id))
            .where(eq(favorites.userId, Number(req.user.id)))

        const formattedResult = result.map(row => ({
            ...row.favorite,
            category: row.favorite.category || row.brand?.category,
            property: {
                ...row.property,
                mainImage: row.mainImage,
                brand: row.brand
            }
        }))

        return res.json(formattedResult)
    } catch (error) {
        console.error('getMyFavorites error:', error)
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
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        
        const userId = Number(req.user.id)
        const propertyId = Number(req.body.propertyId)
        
        if (!propertyId) {
             return res.status(400).json({ message: 'propertyId is required' })
        }

        // Check if already exists
        const [existing] = await db
            .select()
            .from(favorites)
            .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
        
        if (existing) {
            return res.status(200).json(existing)
        }

        const now = new Date()
        let additionalData = {}
        const [property] = await db.select().from(properties).where(eq(properties.id, propertyId))
        if (property?.brandId) {
            additionalData.brandId = property.brandId
            const [brand] = await db.select().from(brands).where(eq(brands.id, property.brandId))
            if (brand?.category) {
                additionalData.category = brand.category
            }
        }

        const payload = {
            userId,
            propertyId,
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

// POST /favorites/toggle
export const toggleFavorite = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        
        const userId = Number(req.user.id)
        const propertyId = Number(req.body.propertyId)
        
        if (!propertyId) {
             return res.status(400).json({ message: 'propertyId is required' })
        }

        // Check if already exists
        const [existing] = await db
            .select()
            .from(favorites)
            .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
        
        if (existing) {
            // Delete it
            await db.delete(favorites).where(eq(favorites.id, existing.id))
            return res.status(200).json({ action: 'removed', propertyId })
        } else {
            // Insert it
            const now = new Date()
            let additionalData = {}
            const [property] = await db.select().from(properties).where(eq(properties.id, propertyId))
            if (property?.brandId) {
                additionalData.brandId = property.brandId
                const [brand] = await db.select().from(brands).where(eq(brands.id, property.brandId))
                if (brand?.category) {
                    additionalData.category = brand.category
                }
            }

            const payload = {
                userId,
                propertyId,
                ...additionalData,
                createdAt: now,
                updatedAt: now,
            }

            const [created] = await db.insert(favorites).values(payload).returning()
            return res.status(201).json({ action: 'added', favorite: created, propertyId })
        }
    } catch (error) {
        console.error('toggleFavorite error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

