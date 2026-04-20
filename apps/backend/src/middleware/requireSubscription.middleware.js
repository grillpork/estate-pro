import { getActiveSubscriptionWithQuota } from '../modules/userSubscriptions/userSubscriptions.controller.js'

/**
 * Middleware: ตรวจสอบว่า user สามารถลงประกาศได้หรือไม่
 * - New user (ไม่มี subscription) ได้ลงประกาศ 1 รายการ
 * - ถ้าต้องการลงมากกว่านั้น ต้องมี subscription
 * ต้องใช้หลัง verifyToken เสมอ (ต้องมี req.user)
 */
export const requireSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { subscription, plan, currentListings, maxListings } = await getActiveSubscriptionWithQuota(userId)

        // ถ้ามี subscription
        if (subscription) {
            // เช็คว่า subscription หมดอายุหรือยัง
            if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
                return res.status(403).json({
                    message: 'แพลนของคุณหมดอายุแล้ว กรุณาต่ออายุหรือสมัครแพลนใหม่',
                    code: 'SUBSCRIPTION_EXPIRED',
                })
            }

            // เช็คว่าเกินโควต้า
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
            return next()
        }

        // ถ้าไม่มี subscription (new user)
        // อนุญาตให้ลง 1 รายการ แล้วเตือนให้สมัครแพลนสำหรับการลงประกาศเพิ่มเติม
        if (currentListings >= 1) {
            return res.status(403).json({
                message: 'คุณลงประกาศครบจำนวนฟรี (1 รายการ) แล้ว กรุณาสมัครแพลนเพื่อลงประกาศเพิ่มเติม',
                code: 'FREE_LISTING_LIMIT_REACHED',
                currentListings,
                maxListings: 1,
            })
        }

        // อนุญาตให้ผ่าน แต่เตือน user ว่านี่คือการลงประกาศฟรี
        req.subscription = null
        req.plan = null
        req.listingsCount = currentListings
        req.isFreeListingWarning = true

        next()
    } catch (error) {
        console.error('requireSubscription error:', error)
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบแพลน' })
    }
}
