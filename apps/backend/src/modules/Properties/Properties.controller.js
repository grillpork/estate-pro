import fs from 'fs'
import path from 'path'
import { sql } from '../../database/schema/db.js'

// =============================================================
// HELPER: ดึง property พร้อม JOIN brand และ main image ตาม id
// =============================================================
const getPropertyByIdWithJoins = async (id) => {
    const rows = await sql`
        SELECT
            p.*,
            pi.id           AS main_image_id,
            pi.image_path   AS main_image_path,
            pi.is_main      AS main_image_is_main,
            pi.created_at   AS main_image_created_at,
            b.id            AS brand_id_obj,
            b.name          AS brand_name,
            b.category      AS brand_category,
            b.is_active     AS brand_is_active
        FROM properties p
        LEFT JOIN property_images pi ON p.image_id = pi.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = ${Number(id)}
    `

    const row = rows[0]
    if (!row) return null

    // ดึงรูปภาพทั้งหมดของ property นี้
    const allImages = await sql`
        SELECT * FROM property_images
        WHERE property_id = ${Number(id)}
    `

    return {
        id: row.id,
        name: row.name,
        description: row.description,
        imageId: row.image_id,
        startingPrice: row.starting_price,
        rentPrice: row.rent_price,
        projectArea: row.project_area,
        landArea: row.land_area,
        usableArea: row.usable_area,
        totalUnits: row.total_units,
        parkingSpaces: row.parking_spaces,
        parkingPercent: row.parking_percent,
        studio: row.studio,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        floor: row.floor,
        building: row.building,
        commonFee: row.common_fee,
        estimatedInstallment: row.estimated_installment,
        province: row.province,
        district: row.district,
        subDistrict: row.sub_district,
        zipCode: row.zip_code,
        facing: row.facing,
        latitude: row.latitude,
        longitude: row.longitude,
        occupancy: row.occupancy,
        ownerName: row.owner_name,
        ownerPhone: row.owner_phone,
        availableDate: row.available_date,
        brandId: row.brand_id,
        userId: row.user_id,
        amenities: row.amenities,
        listingType: row.listing_type,
        discount: row.discount,
        discountActive: row.discount_active,
        discountType: row.discount_type,
        rentDiscount: row.rent_discount,
        rentDiscountActive: row.rent_discount_active,
        rentDiscountType: row.rent_discount_type,
        rentNetTotal: row.rent_net_total,
        isActive: row.is_active,
        condition: row.condition,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        mainImage: row.main_image_id ? {
            id: row.main_image_id,
            imagePath: row.main_image_path,
            isMain: row.main_image_is_main,
            createdAt: row.main_image_created_at,
        } : null,
        brand: row.brand_id_obj ? {
            id: row.brand_id_obj,
            name: row.brand_name,
            category: row.brand_category,
            isActive: row.brand_is_active,
        } : null,
        images: allImages.map(img => ({
            id: img.id,
            propertyId: img.property_id,
            imagePath: img.image_path,
            isMain: img.is_main,
            order: img.order,
            createdAt: img.created_at,
            updatedAt: img.updated_at,
        })),
    }
}

// =============================================================
// GET /properties  --  ดึงทรัพย์สินทั้งหมด
// =============================================================
export const getAllProperties = async (req, res) => {
    try {
        const rows = await sql`
            SELECT
                p.*,
                pi.image_path   AS main_image,
                b.id            AS brand_id_obj,
                b.name          AS brand_name,
                b.category      AS brand_category,
                b.is_active     AS brand_is_active
            FROM properties p
            LEFT JOIN property_images pi ON p.image_id = pi.id
            LEFT JOIN brands b ON p.brand_id = b.id
        `

        const formattedResult = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            imageId: row.image_id,
            startingPrice: row.starting_price,
            rentPrice: row.rent_price,
            projectArea: row.project_area,
            landArea: row.land_area,
            usableArea: row.usable_area,
            totalUnits: row.total_units,
            parkingSpaces: row.parking_spaces,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            floor: row.floor,
            building: row.building,
            province: row.province,
            district: row.district,
            subDistrict: row.sub_district,
            zipCode: row.zip_code,
            latitude: row.latitude,
            longitude: row.longitude,
            occupancy: row.occupancy,
            ownerName: row.owner_name,
            ownerPhone: row.owner_phone,
            availableDate: row.available_date,
            brandId: row.brand_id,
            userId: row.user_id,
            amenities: row.amenities,
            listingType: row.listing_type,
            discount: row.discount,
            discountActive: row.discount_active,
            discountType: row.discount_type,
            rentDiscount: row.rent_discount,
            rentDiscountActive: row.rent_discount_active,
            rentDiscountType: row.rent_discount_type,
            rentNetTotal: row.rent_net_total,
            isActive: row.is_active,
            condition: row.condition,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            mainImage: row.main_image,
            brand: row.brand_id_obj ? {
                id: row.brand_id_obj,
                name: row.brand_name,
                category: row.brand_category,
                isActive: row.brand_is_active,
            } : null,
        }))

        return res.json(formattedResult)
    } catch (error) {
        console.error('getAllProperties error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// =============================================================
// GET /properties/:id
// =============================================================
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

// =============================================================
// GET /properties/my  --  ดึงทรัพย์สินของ user ที่ login อยู่
// =============================================================
export const getMyProperties = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const rows = await sql`
            SELECT
                p.*,
                pi.image_path   AS main_image,
                b.id            AS brand_id_obj,
                b.name          AS brand_name,
                b.category      AS brand_category,
                b.is_active     AS brand_is_active
            FROM properties p
            LEFT JOIN property_images pi ON p.image_id = pi.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.user_id = ${Number(req.user.id)}
        `

        const formattedResult = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            imageId: row.image_id,
            startingPrice: row.starting_price,
            rentPrice: row.rent_price,
            projectArea: row.project_area,
            landArea: row.land_area,
            usableArea: row.usable_area,
            totalUnits: row.total_units,
            parkingSpaces: row.parking_spaces,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            floor: row.floor,
            building: row.building,
            province: row.province,
            district: row.district,
            subDistrict: row.sub_district,
            zipCode: row.zip_code,
            latitude: row.latitude,
            longitude: row.longitude,
            occupancy: row.occupancy,
            ownerName: row.owner_name,
            ownerPhone: row.owner_phone,
            availableDate: row.available_date,
            brandId: row.brand_id,
            userId: row.user_id,
            amenities: row.amenities,
            listingType: row.listing_type,
            discount: row.discount,
            discountActive: row.discount_active,
            discountType: row.discount_type,
            rentDiscount: row.rent_discount,
            rentDiscountActive: row.rent_discount_active,
            rentDiscountType: row.rent_discount_type,
            rentNetTotal: row.rent_net_total,
            isActive: row.is_active,
            condition: row.condition,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            mainImage: row.main_image,
            brand: row.brand_id_obj ? {
                id: row.brand_id_obj,
                name: row.brand_name,
                category: row.brand_category,
                isActive: row.brand_is_active,
            } : null,
        }))

        return res.json(formattedResult)
    } catch (error) {
        console.error('getMyProperties error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// =============================================================
// POST /properties  --  สร้างทรัพย์สินใหม่
// =============================================================
export const createProperty = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const body = { ...req.body }

        // แปลง type จาก multipart/form-data (ทุก field เป็น string)
        if (body.brandId) body.brandId = Number(body.brandId)
        if (body.startingPrice) body.startingPrice = body.startingPrice.toString()
        if (body.totalUnits) body.totalUnits = Number(body.totalUnits)
        if (body.bedrooms) body.bedrooms = Number(body.bedrooms)
        if (body.bathrooms) body.bathrooms = Number(body.bathrooms)
        if (body.floor) body.floor = Number(body.floor)
        if (body.condition) body.condition = Number(body.condition)
        if (body.discountActive !== undefined) body.discountActive = body.discountActive === 'true' || body.discountActive === true
        if (body.isActive !== undefined) body.isActive = body.isActive === 'true' || body.isActive === true

        let availableDate = new Date()
        if (body.availableDate) {
            const d = new Date(body.availableDate)
            availableDate = isNaN(d.getTime()) ? new Date() : d
        }

        let amenities = null
        if (body.amenities !== undefined) {
            if (typeof body.amenities === 'string') {
                try {
                    amenities = JSON.parse(body.amenities)
                } catch (e) {
                    console.warn('Cannot parse amenities as JSON, keeping as null.')
                }
            } else {
                amenities = body.amenities
            }
        }

        // INSERT property
        const created = await sql`
            INSERT INTO properties (
                name, description, starting_price, rent_price,
                project_area, land_area, usable_area, total_units,
                parking_spaces, parking_percent, studio, bedrooms, bathrooms,
                floor, building, common_fee, estimated_installment,
                province, district, sub_district, zip_code,
                facing, latitude, longitude, occupancy,
                owner_name, owner_phone, available_date,
                brand_id, user_id, amenities, listing_type,
                discount, discount_active, discount_type,
                rent_discount, rent_discount_active, rent_discount_type,
                rent_net_total, is_active, condition
            ) VALUES (
                ${body.name ?? null},
                ${body.description ?? null},
                ${body.startingPrice ?? null},
                ${body.rentPrice ?? null},
                ${body.projectArea ?? null},
                ${body.landArea ?? null},
                ${body.usableArea ?? null},
                ${body.totalUnits ?? null},
                ${body.parkingSpaces ?? null},
                ${body.parkingPercent ?? null},
                ${body.studio ?? null},
                ${body.bedrooms ?? null},
                ${body.bathrooms ?? null},
                ${body.floor ?? null},
                ${body.building ?? null},
                ${body.commonFee ?? null},
                ${body.estimatedInstallment ?? null},
                ${body.province ?? null},
                ${body.district ?? null},
                ${body.subDistrict ?? null},
                ${body.zipCode ?? null},
                ${body.facing ?? null},
                ${body.latitude ?? null},
                ${body.longitude ?? null},
                ${body.occupancy ?? null},
                ${body.ownerName ?? null},
                ${body.ownerPhone ?? null},
                ${availableDate},
                ${body.brandId ?? null},
                ${Number(req.user.id)},
                ${amenities ? JSON.stringify(amenities) : null},
                ${body.listingType ?? null},
                ${body.discount ?? null},
                ${body.discountActive ?? true},
                ${body.discountType ?? 'BAHT'},
                ${body.rentDiscount ?? null},
                ${body.rentDiscountActive ?? false},
                ${body.rentDiscountType ?? 'BAHT'},
                ${body.rentNetTotal ?? null},
                ${body.isActive ?? true},
                ${body.condition ?? 1}
            )
            RETURNING *
        `

        const newProperty = created[0]

        // จัดการรูปภาพ (ถ้ามีการส่งมา)
        const files = req.files && req.files.length > 0
            ? req.files
            : req.file
                ? [req.file]
                : []

        if (files.length > 0) {
            // INSERT ทุกรูป
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const imagePath = file.path.replace(process.cwd() + path.sep, '')
                await sql`
                    INSERT INTO property_images (property_id, image_path, is_main)
                    VALUES (${newProperty.id}, ${imagePath}, ${i === 0})
                `
            }

            // ดึง id ของรูปแรก (main image)
            const mainImg = await sql`
                SELECT id FROM property_images
                WHERE property_id = ${newProperty.id}
                ORDER BY id ASC
                LIMIT 1
            `

            // อัปเดต image_id ใน property
            await sql`
                UPDATE properties
                SET image_id = ${mainImg[0].id}
                WHERE id = ${newProperty.id}
            `
        }

        const property = await getPropertyByIdWithJoins(newProperty.id)
        return res.status(201).json(property)
    } catch (error) {
        console.error('createProperty error:', error)
        return res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

// =============================================================
// PUT /properties/:id  --  อัปเดตข้อมูลทรัพย์สิน
// =============================================================
export const updateProperty = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params
        const body = { ...req.body }

        // ตรวจว่าทรัพย์สินนี้มีอยู่จริงและเป็นของ user คนนี้
        const existing = await sql`
            SELECT id, user_id FROM properties WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing[0].user_id !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // แปลง type
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

        // สร้าง SET clause แบบ dynamic (เฉพาะ field ที่ส่งมา)
        const fieldMap = {
            name:                 body.name,
            description:          body.description,
            starting_price:       body.startingPrice,
            rent_price:           body.rentPrice,
            project_area:         body.projectArea,
            land_area:            body.landArea,
            usable_area:          body.usableArea,
            total_units:          body.totalUnits   !== undefined ? Number(body.totalUnits) : undefined,
            parking_spaces:       body.parkingSpaces !== undefined ? Number(body.parkingSpaces) : undefined,
            parking_percent:      body.parkingPercent,
            studio:               body.studio,
            bedrooms:             body.bedrooms  !== undefined ? Number(body.bedrooms) : undefined,
            bathrooms:            body.bathrooms !== undefined ? Number(body.bathrooms) : undefined,
            floor:                body.floor     !== undefined ? Number(body.floor) : undefined,
            building:             body.building,
            common_fee:           body.commonFee,
            estimated_installment: body.estimatedInstallment,
            province:             body.province,
            district:             body.district,
            sub_district:         body.subDistrict,
            zip_code:             body.zipCode,
            facing:               body.facing,
            latitude:             body.latitude,
            longitude:            body.longitude,
            occupancy:            body.occupancy,
            owner_name:           body.ownerName,
            owner_phone:          body.ownerPhone,
            available_date:       body.availableDate,
            brand_id:             body.brandId !== undefined ? Number(body.brandId) : undefined,
            amenities:            body.amenities !== undefined ? JSON.stringify(body.amenities) : undefined,
            listing_type:         body.listingType,
            discount:             body.discount,
            discount_active:      body.discountActive !== undefined ? (body.discountActive === 'true' || body.discountActive === true) : undefined,
            discount_type:        body.discountType,
            rent_discount:        body.rentDiscount,
            rent_discount_active: body.rentDiscountActive !== undefined ? (body.rentDiscountActive === 'true' || body.rentDiscountActive === true) : undefined,
            rent_discount_type:   body.rentDiscountType,
            rent_net_total:       body.rentNetTotal,
            is_active:            body.isActive !== undefined ? (body.isActive === 'true' || body.isActive === true) : undefined,
            condition:            body.condition !== undefined ? Number(body.condition) : undefined,
            updated_at:           new Date(),
        }

        // กรองเอาเฉพาะ field ที่ส่งมา (ไม่ undefined)
        const entries = Object.entries(fieldMap).filter(([, v]) => v !== undefined)

        if (entries.length === 0) {
            return res.status(400).json({ message: 'No fields to update' })
        }

        // สร้าง SQL SET clause ด้วย string concatenation (ปลอดภัยเพราะ key มาจาก fieldMap ที่เรากำหนดเอง)
        // ค่า value ยังถูกส่งเป็น parameterized ผ่าน Neon
        const setClauses = entries.map(([col]) => col + ' = $' + (entries.indexOf(entries.find(e => e[0] === col)) + 1)).join(', ')
        const values = entries.map(([, v]) => v)

        // ใช้ Pool โดยตรงสำหรับ dynamic query
        const { Pool } = await import('@neondatabase/serverless')
        const pool = new Pool({ connectionString: process.env.DATABASE_URL })
        const client = await pool.connect()

        try {
            const updateResult = await client.query(
                `UPDATE properties SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`,
                [...values, Number(id)]
            )
            const updated = updateResult.rows[0]
            const property = await getPropertyByIdWithJoins(updated.id)
            return res.json(property)
        } finally {
            client.release()
            await pool.end()
        }
    } catch (error) {
        console.error('updateProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// =============================================================
// Middleware: โหลดชื่อโครงการจาก DB มาใส่ req.body.name
// =============================================================
export const loadPropertyName = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!id) return next()
        if (req.body && req.body.name) return next()

        const rows = await sql`
            SELECT name FROM properties WHERE id = ${Number(id)}
        `

        if (rows.length > 0) {
            if (!req.body) req.body = {}
            req.body.name = rows[0].name
        }
        next()
    } catch (error) {
        next()
    }
}

// =============================================================
// Middleware: โหลดชื่อโครงการโดยใช้ Image ID
// =============================================================
export const loadPropertyNameByImageId = async (req, res, next) => {
    try {
        const { imageId } = req.params
        if (!imageId) return next()

        const rows = await sql`
            SELECT p.name
            FROM property_images pi
            INNER JOIN properties p ON pi.property_id = p.id
            WHERE pi.id = ${Number(imageId)}
        `

        if (rows.length > 0) {
            if (!req.body) req.body = {}
            req.body.name = rows[0].name
        }
        next()
    } catch (error) {
        next()
    }
}

// =============================================================
// PUT /properties/images/:imageId  --  อัปเดตรูปภาพตาม imageId
// =============================================================
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

        // หา image + property เจ้าของ
        const rows = await sql`
            SELECT
                pi.id           AS image_id,
                pi.image_path   AS image_path,
                p.id            AS property_id,
                p.user_id       AS property_user_id
            FROM property_images pi
            INNER JOIN properties p ON pi.property_id = p.id
            WHERE pi.id = ${Number(imageId)}
        `

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Image not found' })
        }

        if (rows[0].property_user_id !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // ลบรูปเก่าออกจาก disk
        const oldPath = path.resolve(process.cwd(), rows[0].image_path)
        fs.unlink(oldPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Failed to delete old image file:', err)
            }
        })

        // อัปเดต record รูปใหม่
        const newImagePath = file.path.replace(process.cwd() + path.sep, '')
        const updated = await sql`
            UPDATE property_images
            SET image_path = ${newImagePath}, updated_at = NOW()
            WHERE id = ${Number(imageId)}
            RETURNING *
        `

        return res.json(updated[0])
    } catch (error) {
        console.error('updateImageById error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// =============================================================
// PUT /properties/:id/image  --  เปลี่ยนรูปภาพหลักของทรัพย์สิน
// =============================================================
export const updatePropertyImage = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params
        const files = req.files && req.files.length > 0
            ? req.files
            : req.file
                ? [req.file]
                : []

        if (files.length === 0) {
            return res.status(400).json({
                message: 'No image file found in the request',
                hint: 'ส่งไฟล์ผ่าน form-data ด้วย key ชื่ออะไรก็ได้ (เช่น image)',
            })
        }

        // หา property เดิม
        const existing = await sql`
            SELECT id, user_id FROM properties WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing[0].user_id !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // ยกเลิก image_id ก่อน เพื่อไม่ให้ FK ติด
        await sql`
            UPDATE properties SET image_id = NULL WHERE id = ${Number(id)}
        `

        // ดึงรูปเก่าทั้งหมด
        const oldImages = await sql`
            SELECT * FROM property_images WHERE property_id = ${Number(id)}
        `

        // ลบไฟล์รูปเก่าออกจาก disk
        for (const img of oldImages) {
            const oldPath = path.resolve(process.cwd(), img.image_path)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete old image file:', err)
                }
            })
        }

        // ลบ record รูปเก่าออกจาก DB
        await sql`
            DELETE FROM property_images WHERE property_id = ${Number(id)}
        `

        // INSERT รูปใหม่ทั้งหมด
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const imagePath = file.path.replace(process.cwd() + path.sep, '')
            await sql`
                INSERT INTO property_images (property_id, image_path, is_main)
                VALUES (${Number(id)}, ${imagePath}, ${i === 0})
            `
        }

        // ดึง id ของ main image (รูปแรก)
        const mainImg = await sql`
            SELECT id FROM property_images
            WHERE property_id = ${Number(id)}
            ORDER BY id ASC
            LIMIT 1
        `

        // อัปเดต image_id ของ property
        await sql`
            UPDATE properties
            SET image_id = ${mainImg[0].id}
            WHERE id = ${Number(id)}
        `

        const property = await getPropertyByIdWithJoins(Number(id))
        return res.json(property)
    } catch (error) {
        console.error('updatePropertyImage error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// =============================================================
// DELETE /properties/:id  --  ลบทรัพย์สิน
// =============================================================
export const deleteProperty = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params

        // หา record ก่อน เพื่อตรวจสิทธิ์
        const existing = await sql`
            SELECT id, user_id FROM properties WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing[0].user_id !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // 1. เคลียร์ image_id ก่อน เพื่อไม่ให้ FK ติด
        await sql`
            UPDATE properties SET image_id = NULL WHERE id = ${Number(id)}
        `

        // 2. หารูปทั้งหมดของ property
        const pImages = await sql`
            SELECT * FROM property_images WHERE property_id = ${Number(id)}
        `

        // 3. ลบไฟล์รูปออกจาก disk
        for (const img of pImages) {
            if (img.image_path) {
                const oldPath = path.resolve(process.cwd(), img.image_path)
                fs.unlink(oldPath, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error('Failed to delete property image:', err)
                    }
                })
            }
        }

        // 4. ลบ record รูปออกจาก DB
        await sql`
            DELETE FROM property_images WHERE property_id = ${Number(id)}
        `

        // 5. ลบ property
        await sql`
            DELETE FROM properties WHERE id = ${Number(id)}
        `

        return res.json({ message: 'Property deleted' })
    } catch (error) {
        console.error('deleteProperty error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// =============================================================
// POST /properties/:id/images  --  อัปโหลดรูปเพิ่มเติม
// =============================================================
export const uploadPropertyImages = async (req, res) => {
    try {
        const { id } = req.params

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' })
        }

        // ตรวจว่าทรัพย์สินนี้มีอยู่และเป็นของ user คนนี้
        const existing = await sql`
            SELECT id, user_id FROM properties WHERE id = ${Number(id)}
        `

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Property not found' })
        }

        if (existing[0].user_id !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: Not your property' })
        }

        // INSERT รูปใหม่ทั้งหมด
        const inserted = []
        for (const file of req.files) {
            const imagePath = file.path.replace(process.cwd() + path.sep, '')
            const result = await sql`
                INSERT INTO property_images (property_id, image_path, is_main)
                VALUES (${Number(id)}, ${imagePath}, false)
                RETURNING *
            `
            inserted.push(result[0])
        }

        return res.json(inserted)
    } catch (error) {
        console.error('uploadPropertyImages error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
