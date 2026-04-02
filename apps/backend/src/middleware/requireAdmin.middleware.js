import { eq } from 'drizzle-orm'
import { db } from '../database/schema/db.js'
import { roles } from '../database/schema/index.js'

export const requireAdmin = async (req, res, next) => {
  try {
    const roleId = req.user?.roleId
    if (!roleId) {
      return res.status(403).json({ message: 'Forbidden: no role assigned' })
    }

    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, Number(roleId)))

    if (!role || role.name.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin only' })
    }

    next()
  } catch (error) {
    console.error('requireAdmin error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
