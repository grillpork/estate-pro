import { eq } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'
import { db } from '../../database/schema/db.js'
import { properties, propertyImages, brands } from '../../database/schema/index.js'

// Helper to fetch property with joins
const getPropertyByIdWithJoins = async (id) => {
    const result = await db
        .select({
            property: properties,
            mainImage: propertyImages,
            brand: brands
        })
        .from(properties)
        .leftJoin(propertyImages, eq(properties.imageId, propertyImages.id))
        .leftJoin(brands, eq(properties.brandId, brands.id))
        .where(eq(properties.id, Number(id)))

    const row = result[0]
    if (!row || !row.property) return null

    // Fetch all images for this property
    const allImages = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, Number(id)))

    return {
        ...row.property,
        mainImage: row.mainImage,
        brand: row.brand,
        images: allImages
    }
}

// GET /properties
export const getAllProperties = async (req, res) => {
    try {
        const result = await db
            .select({
                property: properties,
                mainImage: propertyImages.imagePath,
                brand: brands
            })
            .from(properties)
            .leftJoin(propertyImages, eq(properties.imageId, propertyImages.id))
            .leftJoin(brands, eq(properties.brandId, brands.id))

        // Format the output to be cleaner
        const formattedResult = result.map(row => ({
            ...row.property,
            mainImage: row.mainImage,
            brand: row.brand
        }))

        return res.json(formattedResult)
    } catch (error) {
        console.error('getAllProperties error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /properties/:id
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params
        const property = await getPropertyByIdWithJoins(id)

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
            .select({
                property: properties,
                mainImage: propertyImages.imagePath,
                brand: brands
            })
            .from(properties)
            .leftJoin(propertyImages, eq(properties.imageId, propertyImages.id))
            .leftJoin(brands, eq(properties.brandId, brands.id))
            .where(eq(properties.userId, Number(req.user.id)))

        // Format the output to be cleaner
        const formattedResult = result.map(row => ({
            ...row.property,
            mainImage: row.mainImage,
            brand: row.brand
        }))

        return res.json(formattedResult)
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

        // ปรับแต่งข้อมูลจาก multipart/form-data (ซึ่งเป็น string ทั้งหมด)
        if (body.brandId) body.brandId = Number(body.brandId)
        if (body.startingPrice) body.startingPrice = body.startingPrice.toString()
        if (body.totalUnits) body.totalUnits = Number(body.totalUnits)
        if (body.bedrooms) body.bedrooms = Number(body.bedrooms)
        if (body.bathrooms) body.bathrooms = Number(body.bathrooms)
        if (body.floor) body.floor = Number(body.floor)
        if (body.condition) body.condition = Number(body.condition)

        // Booleans
        if (body.discountActive !== undefined) body.discountActive = body.discountActive === 'true' || body.discountActive === true
        if (body.isActive !== undefined) body.isActive = body.isActive === 'true' || body.isActive === true

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
                    // ถ้า parse ไม่ได้ก็ปล่อยไปเป็น string (อาจเกิดจากไม่ได้ส่งมาเป็น JSON)
                    console.warn('Cannot parse amenities as JSON, keeping it as is.')
                }
            }
        }

        const [created] = await db
            .insert(properties)
            .values({
                ...body,
                userId: Number(req.user.id),
            })
            .returning()

        // จัดการรูปภาพ (ถ้ามีการส่งมา)
        const files = req.files && req.files.length > 0
            ? req.files
            : req.file
                ? [req.file]
                : []

        if (files.length > 0) {
            const insertData = files.map((file, index) => ({
                propertyId: created.id,
                imagePath: file.path.replace(process.cwd() + path.sep, ''),
                isMain: index === 0,
            }))

            const inserted = await db
                .insert(propertyImages)
                .values(insertData)
                .returning()

            // ตั้ง imageId ชี้ไปที่รูปแรก
            const mainImg = inserted[0]
            await db
                .update(properties)
                .set({ imageId: mainImg.id })
                .where(eq(properties.id, created.id))
        }

        // Fetch again with joins for consistent output
        const property = await getPropertyByIdWithJoins(created.id)
        return res.status(201).json(property)
    } catch (error) {
        console.error('createProperty error:', error)
        return res.status(500).json({ message: 'Internal server error', error: error.message })
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

        // Fetch again with joins for consistent output
        const property = await getPropertyByIdWithJoins(updated.id)
        return res.json(property)
    } catch (error) {
        console.error('updateProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// Middleware เพื่อโหลดชื่อโครงการจาก DB มาใส่ req.body.name (ใช้สำหรับหาโฟลเดอร์ในขั้นตอนอัปโหลด)
export const loadPropertyName = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!id) return next()

        // ถ้ามี name ใน body อยู่แล้วไม่ต้องโหลด (เช่น create หรือ update ชื่อใหม่)
        if (req.body && req.body.name) return next()

        const [existing] = await db
            .select({ name: properties.name })
            .from(properties)
            .where(eq(properties.id, Number(id)))

        if (existing) {
            if (!req.body) req.body = {}
            req.body.name = existing.name
        }
        next()
    } catch (error) {
        next()
    }
}

// Middleware เพื่อโหลดชื่อโครงการโดยใช้ Image ID
export const loadPropertyNameByImageId = async (req, res, next) => {
    try {
        const { imageId } = req.params
        if (!imageId) return next()

        const [existing] = await db
            .select({ name: properties.name })
            .from(propertyImages)
            .innerJoin(properties, eq(propertyImages.propertyId, properties.id))
            .where(eq(propertyImages.id, Number(imageId)))

        if (existing) {
            if (!req.body) req.body = {}
            req.body.name = existing.name
        }
        next()
    } catch (error) {
        next()
    }
}

// PUT /properties/images/:imageId
export const updateImageById = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { imageId } = req.params
        const file = req.file || (req.files && req.files[0])

        if (!file) {
            return res.status(400).json({ message: 'No image file found' })
        }

        // หาข้อมูลรูปเดิมและเจ้าของ
        const [existingImage] = await db
            .select({
                image: propertyImages,
                property: properties
            })
            .from(propertyImages)
            .innerJoin(properties, eq(propertyImages.propertyId, properties.id))
            .where(eq(propertyImages.id, Number(imageId)))

        if (!existingImage) {
            return res.status(404).json({ message: 'Image not found' })
        }

        if (existingImage.property.userId !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // ลบรูปเก่าออก
        const oldPath = path.resolve(process.cwd(), existingImage.image.imagePath)
        fs.unlink(oldPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Failed to delete old image file:', err)
            }
        })

        // อัปเดตข้อมูลใหม่
        const newImagePath = file.path.replace(process.cwd() + path.sep, '')
        const [updated] = await db
            .update(propertyImages)
            .set({
                imagePath: newImagePath,
                updatedAt: new Date()
            })
            .where(eq(propertyImages.id, Number(imageId)))
            .returning()

        return res.json(updated)
    } catch (error) {
        console.error('updateImageById error:', error)
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

        // รวบรวมไฟล์ทั้งหมด (รองรับทั้ง req.file และ req.files)
        const files = req.files && req.files.length > 0
            ? req.files
            : req.file
                ? [req.file]
                : []

        if (files.length === 0) {
            return res.status(400).json({
                message: 'No image file found in the request',
                hint: 'ส่งไฟล์ผ่าน form-data ด้วย key ชื่ออะไรก็ได้ (เช่น image)'
            })
        }

        // หา property เดิม
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

        // ยกเลิก imageId ของ property ก่อน (เพื่อไม่ให้ FK ติด)
        await db
            .update(properties)
            .set({ imageId: null })
            .where(eq(properties.id, Number(id)))

        // ดึงรูปเก่าทั้งหมดของทรัพย์สินนี้
        const oldImages = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        // ลบไฟล์รูปเก่าออกจาก disk
        for (const img of oldImages) {
            const oldPath = path.resolve(process.cwd(), img.imagePath)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete old image file:', err)
                }
            })
        }

        // ลบ record รูปเก่าทั้งหมดออกจาก database
        await db
            .delete(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        // เตรียมข้อมูลสำหรับ insert ทุกไฟล์ — รูปแรกเป็น main
        const insertData = files.map((file, index) => ({
            propertyId: Number(id),
            imagePath: file.path.replace(process.cwd() + path.sep, ''),
            isMain: index === 0,
        }))

        const inserted = await db
            .insert(propertyImages)
            .values(insertData)
            .returning()

        // ตั้ง imageId ของ property ให้ชี้ไปที่รูป main (รูปแรก)
        const mainImage = inserted[0]
        await db
            .update(properties)
            .set({ imageId: mainImage.id })
            .where(eq(properties.id, Number(id)))

        // Fetch again with joins for consistent output
        const property = await getPropertyByIdWithJoins(Number(id))
        return res.json(property)
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

        // ถ้าจะลบรูปแบบ cascade ก็ได้ แต่นี้ลบ manual
        const pImages = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        for (const img of pImages) {
            const oldPath = path.resolve(process.cwd(), img.imagePath)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete property image on delete:', err)
                }
            })
        }

        await db
            .delete(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        await db
            .delete(properties)
            .where(eq(properties.id, Number(id)))

        return res.json({ message: 'Property deleted' })
    } catch (error) {
        console.error('deleteProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// POST /properties/:id/images
export const uploadPropertyImages = async (req, res) => {
    try {
        const { id } = req.params
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' })
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

        const insertData = req.files.map(file => ({
            propertyId: Number(id),
            imagePath: file.path.replace(process.cwd() + path.sep, ''), // Keep it relative
            isMain: false,
        }))

        const inserted = await db.insert(propertyImages).values(insertData).returning()
        return res.json(inserted)
    } catch (error) {
        console.error('uploadPropertyImages error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

