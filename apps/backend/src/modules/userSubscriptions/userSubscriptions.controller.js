import { eq, and, count } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { userSubscriptions, membershipPlans, properties } from '../../database/schema/index.js'

/**
 * Utility function: Get active subscription with quota info for a user
 * @param {number} userId
 * @returns {Promise<{subscription, plan, currentListings, maxListings}>}
 */
export const getActiveSubscriptionWithQuota = async (userId) => {
  // 1. หา active subscription
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
    return {
      subscription: null,
      plan: null,
      currentListings: 0,
      maxListings: null,
    }
  }

  const { subscription, plan } = activeSubs[0]

  // 2. นับจำนวน property
  const [propertyCount] = await db
    .select({ count: count() })
    .from(properties)
    .where(eq(properties.userId, userId))

  const currentListings = propertyCount.count
  const maxListings = plan.maxListings

  return {
    subscription,
    plan,
    currentListings,
    maxListings,
  }
}

/** GET /user-subscriptions — Admin only */
export const getAllUserSubscriptions = async (req, res) => {
  try {
    const result = await db.select().from(userSubscriptions)
    return res.json(result)
  } catch (error) {
    console.error('getAllUserSubscriptions error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /user-subscriptions/me — ดึง subscription ของตัวเอง */
export const getMySubscription = async (req, res) => {
  try {
    const userId = Number(req.user?.id)
    const result = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
    return res.json(result)
  } catch (error) {
    console.error('getMySubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /user-subscriptions/:id */
export const getUserSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params
    const [row] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, Number(id)))

    if (!row) {
      return res.status(404).json({ message: 'Subscription not found' })
    }
    return res.json(row)
  } catch (error) {
    console.error('getUserSubscriptionById error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** POST /user-subscriptions — สมัครแผน */
export const createUserSubscription = async (req, res) => {
  try {
    const { planId, billingCycle, startDate, endDate, autoRenew } = req.body
    const userId = Number(req.user?.id)

    if (!planId || !billingCycle) {
      return res.status(400).json({ message: 'planId and billingCycle are required' })
    }

    const [plan] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(planId)))

    if (!plan) {
      return res.status(404).json({ message: 'Membership plan not found' })
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ message: "billingCycle must be 'monthly' or 'yearly'" })
    }

    const now = new Date()
    const start = startDate ? new Date(startDate) : now

    // Deactivate any existing active subscriptions for this user
    await db
      .update(userSubscriptions)
      .set({ status: 'cancelled', updatedAt: now })
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'active')
        )
      )

    // Auto-calculate endDate based on billingCycle
    let calculatedEndDate = null
    if (endDate) {
      calculatedEndDate = new Date(endDate)
    } else {
      calculatedEndDate = new Date(start)
      if (billingCycle === 'monthly') {
        calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1)
      } else if (billingCycle === 'yearly') {
        calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1)
      }
    }

    const payload = {
      userId,
      planId: Number(planId),
      billingCycle,
      startDate: start,
      endDate: calculatedEndDate,
      status: 'active',
      autoRenew: autoRenew ?? false,
      createdAt: now,
      updatedAt: now,
    }

    const [created] = await db.insert(userSubscriptions).values(payload).returning()
    return res.status(201).json(created)
  } catch (error) {
    console.error('createUserSubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** PUT /user-subscriptions/:id — แก้ไข subscription */
export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params
    const userId = Number(req.user?.id)

    const [existing] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: not your subscription' })
    }

    const { billingCycle, startDate, endDate, status, autoRenew } = req.body
    const body = { updatedAt: new Date() }

    if (billingCycle !== undefined) {
      if (!['monthly', 'yearly'].includes(billingCycle)) {
        return res.status(400).json({ message: "billingCycle must be 'monthly' or 'yearly'" })
      }
      body.billingCycle = billingCycle
    }
    if (startDate !== undefined) body.startDate = new Date(startDate)
    if (endDate !== undefined) body.endDate = new Date(endDate)
    if (status !== undefined) body.status = status
    if (autoRenew !== undefined) body.autoRenew = autoRenew

    const [updated] = await db
      .update(userSubscriptions)
      .set(body)
      .where(eq(userSubscriptions.id, Number(id)))
      .returning()

    return res.json(updated)
  } catch (error) {
    console.error('updateUserSubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /user-subscriptions/check-quota — เช็คโควต้าลงประกาศของ user */
export const checkQuota = async (req, res) => {
  try {
    const userId = Number(req.user?.id)

    // 1. หา active subscription
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

    // ถ้ามี subscription
    if (activeSubs.length > 0) {
      const { subscription, plan } = activeSubs[0]

      // เช็คหมดอายุ
      if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        return res.json({
          hasSubscription: true,
          canCreateListing: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: 'แพลนของคุณหมดอายุแล้ว กรุณาต่ออายุหรือสมัครแพลนใหม่',
          planName: plan.name,
        })
      }

      // นับจำนวน property
      const [propertyCount] = await db
        .select({ count: count() })
        .from(properties)
        .where(eq(properties.userId, userId))

      const currentListings = propertyCount.count
      const maxListings = plan.maxListings
      const canCreate = maxListings === null || currentListings < maxListings

      return res.json({
        hasSubscription: true,
        canCreateListing: canCreate,
        code: canCreate ? 'OK' : 'MAX_LISTINGS_REACHED',
        message: canCreate
          ? null
          : `คุณลงประกาศครบจำนวนสูงสุดของแพลน ${plan.name} แล้ว (${maxListings} รายการ)`,
        planName: plan.name,
        currentListings,
        maxListings,
      })
    }

    // ถ้าไม่มี subscription (new user) — อนุญาตให้ลง 1 รายการฟรี
    const [propertyCount] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.userId, userId))

    const currentListings = propertyCount.count

    // ถ้าเกิน 1 รายการแล้ว
    if (currentListings >= 1) {
      return res.json({
        hasSubscription: false,
        canCreateListing: false,
        code: 'FREE_LISTING_LIMIT_REACHED',
        message: 'คุณลงประกาศครบจำนวนฟรี (1 รายการ) แล้ว กรุณาสมัครแพลนเพื่อลงประกาศเพิ่มเติม',
        currentListings,
        maxListings: 1,
      })
    }

    // อนุญาตให้ลง 1 รายการฟรี
    return res.json({
      hasSubscription: false,
      canCreateListing: true,
      code: 'FREE_LISTING_ALLOWED',
      message: 'คุณสามารถลงประกาศ 1 รายการฟรีได้',
      currentListings,
      maxListings: 1,
    })
  } catch (error) {
    console.error('checkQuota error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** DELETE /user-subscriptions/:id — ยกเลิก subscription */
export const deleteUserSubscription = async (req, res) => {
  try {
    const { id } = req.params
    const userId = Number(req.user?.id)

    const [existing] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: not your subscription' })
    }

    await db.delete(userSubscriptions).where(eq(userSubscriptions.id, Number(id)))
    return res.json({ message: 'Subscription deleted' })
  } catch (error) {
    console.error('deleteUserSubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
