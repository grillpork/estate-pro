import { db } from '../database/db.js'
import { userSubscriptions } from '../database/schema/userSubscriptions.js'
import { membershipPlans } from '../database/schema/membershipPlans.js'
import { properties } from '../database/schema/property.js'
import { eq, and, count } from 'drizzle-orm'

/**
 * Middleware: ตรวจสอบว่า user มี subscription ที่ active อยู่
 * และยังไม่เกินจำนวน maxListings ของแพลนที่สมัคร
 * ต้องใช้หลัง verifyToken เสมอ (ต้องมี req.user)
 */
export const requireSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id

        // 1. หา active subscription ของ user
        const activeSubs = await db
            .select({
                subscription: userSubscriptions,
                plan: membershipPlans,
            })
            .from(userSubscriptions)
            .innerJoin(membershipPlans, eq(userSubscriptions.planId, membershipPlans.id))
            .where(
                and(
                    eq(userSubscriptions.userId, userId),
                    eq(userSubscriptions.status, 'active')
                )
            )
            .limit(1)

        if (activeSubs.length === 0) {
            return res.status(403).json({
                message: 'คุณยังไม่ได้สมัครแพลน กรุณาสมัครแพลนก่อนลงประกาศ',
                code: 'NO_SUBSCRIPTION',
            })
        }

        const { subscription, plan } = activeSubs[0]

        // 2. เช็คว่า subscription หมดอายุหรือยัง
        if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
            return res.status(403).json({
                message: 'แพลนของคุณหมดอายุแล้ว กรุณาต่ออายุหรือสมัครแพลนใหม่',
                code: 'SUBSCRIPTION_EXPIRED',
            })
        }

        // 3. นับจำนวน property ที่ user มีอยู่
        const [propertyCount] = await db
            .select({ count: count() })
            .from(properties)
            .where(eq(properties.userId, userId))

        // 4. เช็คว่าเกิน maxListings หรือยัง
        if (plan.maxListings !== null && propertyCount.count >= plan.maxListings) {
            return res.status(403).json({
                message: `คุณลงประกาศครบจำนวนสูงสุดของแพลน ${plan.name} แล้ว (${plan.maxListings} รายการ)`,
                code: 'MAX_LISTINGS_REACHED',
                currentListings: propertyCount.count,
                maxListings: plan.maxListings,
                planName: plan.name,
            })
        }

        // 5. แนบข้อมูล subscription ไว้ใน req เพื่อใช้ต่อ
        req.subscription = subscription
        req.plan = plan
        req.listingsCount = propertyCount.count

        next()
    } catch (error) {
        console.error('requireSubscription error:', error)
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบแพลน' })
    }
}
