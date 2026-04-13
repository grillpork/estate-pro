import { eq, inArray } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'
import { db } from '../../database/schema/db.js'
import { properties, propertyImages, brands, notifications } from '../../database/schema/index.js'

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
            .where(eq(properties.status, 'approved'))


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

        const validFields = [
            'name', 'description', 'startingPrice', 'rentPrice', 'projectArea', 
            'landArea', 'usableArea', 'totalUnits', 'parkingSpaces', 'parkingPercent',
            'studio', 'bedrooms', 'bathrooms', 'floor', 'building', 'commonFee',
            'estimatedInstallment', 'province', 'district', 'subDistrict', 'zipCode',
            'facing', 'latitude', 'longitude', 'occupancy', 'ownerName', 'ownerPhone',
            'availableDate', 'brandId', 'amenities', 'listingType', 'discount',
            'discountActive', 'discountType', 'rentDiscount', 'rentDiscountActive',
            'rentDiscountType', 'rentNetTotal', 'status', 'condition'

        ]

        const insertData = {}
        validFields.forEach(field => {
            if (body[field] !== undefined) {
                insertData[field] = body[field]
            }
        })

        // Booleans & Numbers conversion from form-data strings
        if (insertData.brandId) insertData.brandId = Number(insertData.brandId)
        if (insertData.totalUnits) insertData.totalUnits = Number(insertData.totalUnits)
        if (insertData.bedrooms) insertData.bedrooms = Number(insertData.bedrooms)
        if (insertData.bathrooms) insertData.bathrooms = Number(insertData.bathrooms)
        if (insertData.floor) insertData.floor = Number(insertData.floor)
        if (insertData.condition) insertData.condition = Number(insertData.condition)

        if (insertData.discountActive !== undefined) 
            insertData.discountActive = insertData.discountActive === 'true' || insertData.discountActive === true
        if (insertData.status !== undefined) {
            insertData.status = insertData.status.toLowerCase();
        }


        if (insertData.availableDate) {
            const d = new Date(insertData.availableDate)
            insertData.availableDate = isNaN(d.getTime()) ? undefined : d
        } else {
            insertData.availableDate = new Date()
        }

        if (insertData.amenities !== undefined) {
            if (typeof insertData.amenities === 'string') {
                try {
                    insertData.amenities = JSON.parse(insertData.amenities)
                } catch (e) {
                    console.warn('Cannot parse amenities as JSON, keeping it as is.')
                }
            }
        }

        const [created] = await db
            .insert(properties)
            .values({
                ...insertData,
                userId: Number(req.user.id),
            })
            .returning()

        // Create Admin Notification
        await db.insert(notifications).values({
            userId: null, // Global notification for all admins
            title: 'New Property Listing',
            message: `A new property "${created.name}" has been listed by ${req.user.firstName || 'a user'} and is pending approval.`,
            type: 'PROPERTY_PENDING',
            status: 'unread'
        });

        // จัดการรูปภาพ (ถ้ามีการส่งมา)
        const files = req.files && req.files.length > 0
            ? req.files
            : req.file
                ? [req.file]
                : []

        if (files.length > 0) {
            const insertData = files.map((file, index) => ({
                propertyId: created.id,
                imagePath: file.path.replace(process.cwd() + path.sep, '').replace(/\\/g, '/'),
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

        // ป้องการการส่งฟิลด์ที่ไม่มีใน DB เช่น category, mainImage, brand, images
        const validFields = [
            'name', 'description', 'startingPrice', 'rentPrice', 'projectArea', 
            'landArea', 'usableArea', 'totalUnits', 'parkingSpaces', 'parkingPercent',
            'studio', 'bedrooms', 'bathrooms', 'floor', 'building', 'commonFee',
            'estimatedInstallment', 'province', 'district', 'subDistrict', 'zipCode',
            'facing', 'latitude', 'longitude', 'occupancy', 'ownerName', 'ownerPhone',
            'availableDate', 'brandId', 'amenities', 'listingType', 'discount',
            'discountActive', 'discountType', 'rentDiscount', 'rentDiscountActive',
            'rentDiscountType', 'rentNetTotal', 'status', 'condition'

        ]

        const updateData = {}
        validFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        })

        if (updateData.availableDate !== undefined && updateData.availableDate !== null) {
            const d = new Date(updateData.availableDate)
            updateData.availableDate = isNaN(d.getTime()) ? null : d
        }

        if (updateData.amenities !== undefined) {
            if (typeof updateData.amenities === 'string') {
                try {
                    updateData.amenities = JSON.parse(updateData.amenities)
                } catch (e) {
                    return res.status(400).json({ message: 'Invalid amenities JSON' })
                }
            }
            if (!Array.isArray(updateData.amenities)) {
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
            .set({ 
                ...updateData,
                updatedAt: new Date()
            })
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
        const newImagePath = file.path.replace(process.cwd() + path.sep, '').replace(/\\/g, '/')
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

// PUT /properties/:id/image (Image Sync/Update)
export const updatePropertyImage = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params
        const body = req.body || {}
        
        // keepImageIds อาจจะส่งมาเป็น string (จาก FormData) เช่น "1,2,3" หรือเป็น array [1,2,3]
        let keepImageIds = []
        if (body.keepImageIds) {
           keepImageIds = typeof body.keepImageIds === 'string' 
             ? body.keepImageIds.split(',').map(id => Number(id.trim()))
             : Array.isArray(body.keepImageIds) ? body.keepImageIds.map(id => Number(id)) : []
        }

        const files = req.files && req.files.length > 0
            ? req.files
            : req.file ? [req.file] : []

        // 1. หา property เดิม
        const [existingProperty] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, Number(id)))

        if (!existingProperty) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existingProperty.userId !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // 2. ดึงรูปเก่าทั้งหมดของทรัพย์สินนี้
        const oldImages = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        // 3. แยกรูปที่จะลบ (ตัวที่ ID ไม่อยู่ใน keepImageIds)
        const imagesToDelete = oldImages.filter(img => !keepImageIds.includes(img.id))
        
        // 4. ลบไฟล์รูปที่ไม่ได้ใช้แล้วออกจาก disk
        for (const img of imagesToDelete) {
            const oldPath = path.resolve(process.cwd(), img.imagePath)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete redundant image file:', err)
                }
            })
        }

        // 5. ลบ record เฉพาะรูปที่ไม่ต้องการเก็บไว้
        if (imagesToDelete.length > 0) {
            const deleteIds = imagesToDelete.map(img => img.id)
            
            // เช็คว่า imageId ของ property กำลังชี้ไปที่ตัวที่กำลังจะลบหรือไม่
            if (deleteIds.includes(existingProperty.imageId)) {
                await db
                    .update(properties)
                    .set({ imageId: null })
                    .where(eq(properties.id, Number(id)))
            }

            await db
                .delete(propertyImages)
                .where(inArray(propertyImages.id, deleteIds))
        }

        // 6. อัปโหลดรูปใหม่ (ถ้ามี)
        if (files.length > 0) {
            const insertData = files.map((file, index) => ({
                propertyId: Number(id),
                imagePath: file.path.replace(process.cwd() + path.sep, '').replace(/\\/g, '/'),
                isMain: false, // เดี๋ยวค่อยมาตั้ง main ทีหลังถ้าว่าง
            }))

            await db.insert(propertyImages).values(insertData)
        }

        // 7. จัดระเบียบ main image (ถ้า imageId เป็น null ให้เลือกรูปแรกเป็น main)
        const refreshedImages = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))
            .orderBy(propertyImages.id)

        if (refreshedImages.length > 0) {
            // ถ้า imageId เดิมหายไป (โดนลบ) หรือไม่มีอยู่เลย ให้ชี้ไปที่รูปแรก
            const [currentProp] = await db.select().from(properties).where(eq(properties.id, Number(id)))
            
            if (!currentProp.imageId) {
                await db
                    .update(properties)
                    .set({ imageId: refreshedImages[0].id })
                    .where(eq(properties.id, Number(id)))
            }

            // รับประกันว่ามีแค่รูปเดียวที่เป็น isMain ใน DB (เพื่อความเรียบร้อย)
            // แต่ logic หลักเราใช้ imageId ในตาราง properties เป็นหลัก
        }

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

        // 1. เคลียร์ imageId ก่อน เพื่อไม่ให้ FK ติด
        await db
            .update(properties)
            .set({ imageId: null })
            .where(eq(properties.id, Number(id)))

        // 2. หารูปทั้งหมดของ property นี้
        const pImages = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        // 3. ลบไฟล์รูปออกจาก disk
        for (const img of pImages) {
            if (img.imagePath) {
                const oldPath = path.resolve(process.cwd(), img.imagePath)
                fs.unlink(oldPath, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error('Failed to delete property image on delete:', err)
                    }
                })
            }
        }

        // 4. ลบ record รูปออกจาก database
        await db
            .delete(propertyImages)
            .where(eq(propertyImages.propertyId, Number(id)))

        // 5. ลบ property
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
        const propertyId = Number(req.params.id)
        const userId = Number(req.user.id)

        const files = req.files?.length
            ? req.files
            : req.file
                ? [req.file]
                : []

        if (!propertyId) {
            return res.status(400).json({ message: 'Invalid property id' })
        }

        if (files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' })
        }

        // check property
        const [property] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId))

        if (!property) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (property.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        // check existing images
        const currentImages = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, propertyId))

        const hasMain = currentImages.some(img => img.isMain)

        // prepare data
        const insertData = files.map((file, index) => ({
            propertyId,
            imagePath: file.path
                .replace(process.cwd() + path.sep, '')
                .replace(/\\/g, '/'),
            isMain: !hasMain && index === 0,
        }))

        // insert
        const inserted = await db
            .insert(propertyImages)
            .values(insertData)
            .returning()

        // set main image
        if (!hasMain && inserted.length > 0) {
            await db
                .update(properties)
                .set({ imageId: inserted[0].id })
                .where(eq(properties.id, propertyId))
        }

        return res.json(inserted)

    } catch (error) {
        console.error('uploadPropertyImages error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
