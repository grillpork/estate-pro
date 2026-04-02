import { eq } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { userSubscriptions, membershipPlans } from '../../database/schema/index.js'

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
    const payload = {
      userId,
      planId: Number(planId),
      billingCycle,
      startDate: startDate ? new Date(startDate) : now,
      endDate: endDate ? new Date(endDate) : null,
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
