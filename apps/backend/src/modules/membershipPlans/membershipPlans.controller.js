import { eq } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { membershipPlans } from '../../database/schema/index.js'

/** GET /membership-plans */
export const getAllMembershipPlans = async (req, res) => {
  try {
    const result = await db.select().from(membershipPlans)
    return res.json(result)
  } catch (error) {
    console.error('getAllMembershipPlans error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /membership-plans/:id */
export const getMembershipPlanById = async (req, res) => {
  try {
    const { id } = req.params
    const [row] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(id)))

    if (!row) {
      return res.status(404).json({ message: 'Membership plan not found' })
    }
    return res.json(row)
  } catch (error) {
    console.error('getMembershipPlanById error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** POST /membership-plans */
export const createMembershipPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      priceMonthly,
      priceYearly,
      maxListings,
      canChat,
      canViewOwnerContact,
      isActive,
    } = req.body

    if (!name) {
      return res.status(400).json({ message: 'name is required' })
    }

    const now = new Date()
    const payload = {
      name,
      description: description ?? null,
      priceMonthly: priceMonthly != null ? priceMonthly : null,
      priceYearly: priceYearly != null ? priceYearly : null,
      maxListings: maxListings != null ? Number(maxListings) : null,
      canChat: canChat ?? false,
      canViewOwnerContact: canViewOwnerContact ?? false,
      isActive: isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }

    const [created] = await db.insert(membershipPlans).values(payload).returning()
    return res.status(201).json(created)
  } catch (error) {
    console.error('createMembershipPlan error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** PUT /membership-plans/:id */
export const updateMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params

    const [existing] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Membership plan not found' })
    }

    const {
      name,
      description,
      priceMonthly,
      priceYearly,
      maxListings,
      canChat,
      canViewOwnerContact,
      isActive,
    } = req.body

    const body = { updatedAt: new Date() }

    if (name !== undefined) body.name = name
    if (description !== undefined) body.description = description
    if (priceMonthly !== undefined) body.priceMonthly = priceMonthly
    if (priceYearly !== undefined) body.priceYearly = priceYearly
    if (maxListings !== undefined) body.maxListings = Number(maxListings)
    if (canChat !== undefined) body.canChat = canChat
    if (canViewOwnerContact !== undefined) body.canViewOwnerContact = canViewOwnerContact
    if (isActive !== undefined) body.isActive = isActive

    const [updated] = await db
      .update(membershipPlans)
      .set(body)
      .where(eq(membershipPlans.id, Number(id)))
      .returning()

    return res.json(updated)
  } catch (error) {
    console.error('updateMembershipPlan error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** DELETE /membership-plans/:id */
export const deleteMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params

    const [existing] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Membership plan not found' })
    }

    await db.delete(membershipPlans).where(eq(membershipPlans.id, Number(id)))

    return res.json({ message: 'Membership plan deleted' })
  } catch (error) {
    console.error('deleteMembershipPlan error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
