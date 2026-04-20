import { getActiveSubscriptionWithQuota } from '../modules/userSubscriptions/userSubscriptions.controller.js'

/**
 * Middleware: ตรวจสอบว่า user มี subscription ที่ active อยู่
 * และยังไม่เกินจำนวน maxListings ของแพลนที่สมัคร
 * ต้องใช้หลัง verifyToken เสมอ (ต้องมี req.user)
 */
export const requireSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { subscription, plan, currentListings, maxListings } = await getActiveSubscriptionWithQuota(userId)

        if (!subscription) {
            return res.status(403).json({
                message: 'คุณยังไม่ได้สมัครแพลน กรุณาสมัครแพลนก่อนลงประกาศ',
                code: 'NO_SUBSCRIPTION',
            })
        }

        // เช็คว่า subscription หมดอายุหรือยัง
        if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
            return res.status(403).json({
                message: 'แพลนของคุณหมดอายุแล้ว กรุณาต่ออายุหรือสมัครแพลนใหม่',
                code: 'SUBSCRIPTION_EXPIRED',
            })
        }

        if (maxListings !== null && currentListings >= maxListings) {
            return res.status(403).json({
                message: `คุณลงประกาศครบจำนวนสูงสุดของแพลน ${plan.name} แล้ว (${maxListings} รายการ)`,
                code: 'MAX_LISTINGS_REACHED',
                currentListings,
                maxListings,
                planName: plan.name,
            })
        }

        req.subscription = subscription
        req.plan = plan
        req.listingsCount = currentListings

        next()
    } catch (error) {
        console.error('requireSubscription error:', error)
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบแพลน' })
    }
}
