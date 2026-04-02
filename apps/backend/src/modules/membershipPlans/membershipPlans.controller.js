import { sql } from '../../database/schema/db.js'

/** GET /membership-plans */
export const getAllMembershipPlans = async (req, res) => {
    try {
        const result = await sql`SELECT * FROM membership_plans`
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
        const result = await sql`
            SELECT * FROM membership_plans WHERE id = ${Number(id)}
        `

        if (result.length === 0) {
            return res.status(404).json({ message: 'Membership plan not found' })
        }
        return res.json(result[0])
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

        const result = await sql`
            INSERT INTO membership_plans (
                name, description, price_monthly, price_yearly,
                max_listings, can_chat, can_view_owner_contact,
                is_active, created_at, updated_at
            )
            VALUES (
                ${name},
                ${description ?? null},
                ${priceMonthly ?? null},
                ${priceYearly ?? null},
                ${maxListings != null ? Number(maxListings) : null},
                ${canChat ?? false},
                ${canViewOwnerContact ?? false},
                ${isActive ?? true},
                ${now},
                ${now}
            )
            RETURNING *
        `

        return res.status(201).json(result[0])
    } catch (error) {
        console.error('createMembershipPlan error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/** PUT /membership-plans/:id */
export const updateMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params

        const existing = await sql`
            SELECT id FROM membership_plans WHERE id = ${Number(id)}
        `
        if (existing.length === 0) {
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

        const result = await sql`
            UPDATE membership_plans
            SET
                name                    = CASE WHEN ${name !== undefined} THEN ${name ?? null}                                        ELSE name END,
                description             = CASE WHEN ${description !== undefined} THEN ${description ?? null}                          ELSE description END,
                price_monthly           = CASE WHEN ${priceMonthly !== undefined} THEN ${priceMonthly ?? null}                        ELSE price_monthly END,
                price_yearly            = CASE WHEN ${priceYearly !== undefined} THEN ${priceYearly ?? null}                          ELSE price_yearly END,
                max_listings            = CASE WHEN ${maxListings !== undefined} THEN ${maxListings != null ? Number(maxListings) : null} ELSE max_listings END,
                can_chat                = CASE WHEN ${canChat !== undefined} THEN ${canChat ?? null}                                  ELSE can_chat END,
                can_view_owner_contact  = CASE WHEN ${canViewOwnerContact !== undefined} THEN ${canViewOwnerContact ?? null}          ELSE can_view_owner_contact END,
                is_active               = CASE WHEN ${isActive !== undefined} THEN ${isActive ?? null}                               ELSE is_active END,
                updated_at              = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
        `

        return res.json(result[0])
    } catch (error) {
        console.error('updateMembershipPlan error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

/** DELETE /membership-plans/:id */
export const deleteMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params

        const existing = await sql`
            SELECT id FROM membership_plans WHERE id = ${Number(id)}
        `
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Membership plan not found' })
        }

        await sql`DELETE FROM membership_plans WHERE id = ${Number(id)}`

        return res.json({ message: 'Membership plan deleted' })
    } catch (error) {
        console.error('deleteMembershipPlan error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
