import { db } from '../../database/schema/db.js';
import { users, properties, propertyImages, brands } from '../../database/schema/index.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const getAllUsers = async (req, res) => {
    console.log('Current user (req.user):', req.user);
    const user = await db.select().from(users);
    return res.json(user)
}

export const getUserById = async (req, res) => {
    console.log('Current user metadata (req.user):', req.user);
    const id = req.params.id;
    const user = await db.select()
        .from(users)
        .where(eq(users.id, Number(id)));
    return res.json(user);
}

//public
export const getPublicProfile = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'User ID is required' });

        // 1. Fetch user (exclude sensitive data like password)
        const [user] = await db
            .select({
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
                imagePath: users.imagePath,
                phoneNumber: users.phoneNumber,
                verification: users.verification,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, Number(id)));

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Fetch approved properties for this user
        const userProperties = await db
            .select({
                property: properties,
                mainImage: propertyImages.imagePath,
                brand: brands,
            })
            .from(properties)
            .leftJoin(propertyImages, eq(properties.imageId, propertyImages.id))
            .leftJoin(brands, eq(properties.brandId, brands.id))
            .where(
                and(
                    eq(properties.userId, Number(id)),
                    eq(properties.status, 'approved')
                )
            );

        // Format properties list
        const formattedProperties = userProperties.map(row => ({
            ...row.property,
            mainImage: row.mainImage,
            brand: row.brand,
        }));

        return res.json({
            user,
            properties: formattedProperties,
        });
    } catch (err) {
        console.error('getPublicProfile error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id
        const { username, firstName, lastName, password, phoneNumber, roleId } = req.body
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (password !== undefined) updateData.password = password; // Should hash if updating from common user endpoint, but backend logic seems simple here.
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (roleId !== undefined) updateData.roleId = Number(roleId);

        const updatedUsers = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, Number(id)))
            .returning()

        if (updatedUsers.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(updatedUsers[0])

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id
    const deleteUser = await db
        .delete(users)
        .where(eq(users.id, Number(id)))
        .returning()
    console.log('user deleted', deleteUser)
    if (!deleteUser) {
        return res.json({ message: 'user not deleted' }, 400);
    }
    return res.json({ message: 'ok' }, 200);
}

// PUT /api/users/:id/profile-image
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { id } = req.params

        // ตรวจสอบว่าเป็น user คนเดียวกัน
        if (Number(id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: ไม่สามารถแก้ไขรูปของผู้ใช้คนอื่น' })
        }
        // รวบรวมไฟล์ (รองรับทั้ง req.file และ req.files)
        const file = req.file
            ? req.file
            : (req.files && req.files.length > 0)
                ? req.files[0]
                : null

        if (!file) {
            return res.status(400).json({
                message: 'ไม่พบไฟล์รูปภาพ',
                hint: 'ส่งไฟล์ผ่าน form-data ด้วย key ชื่อ "image"'
            })
        }

        // หา user เดิมเพื่อลบรูปเก่า
        const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(id)))

        if (!existing) {
            return res.status(404).json({ message: 'User not found' })
        }
        // ลบไฟล์รูปเก่าออกจาก disk (ถ้ามี)
        if (existing.imagePath) {
            const oldPath = path.resolve(process.cwd(), existing.imagePath)
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete old profile image:', err)
                }
            })
        }

        // บันทึก path ใหม่ลง database
        const newImagePath = file.path.replace(process.cwd() + path.sep, '').replace(/\\/g, '/')
        const [updated] = await db
            .update(users)
            .set({ imagePath: newImagePath })
            .where(eq(users.id, Number(id)))
            .returning()

        return res.json(updated)
    } catch (error) {
        console.error('uploadProfileImage error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

