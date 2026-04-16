import { db } from '../../database/db.js'
import { users, roles } from '../../database/schema/user.js'
import { properties, propertyImages } from '../../database/schema/property.js'
import { notifications } from '../../database/schema/notifications.js'
import { userSubscriptions } from '../../database/schema/userSubscriptions.js'
import { membershipPlans } from '../../database/schema/membershipPlans.js'
import { eq, sql, count } from 'drizzle-orm'

// GET /admin/users
export const getUsers = async (req, res) => {
  try {
    // 1. รับ query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role || "all";

    const offset = (page - 1) * limit;

    // 2. build query with join to get role name and property count
    let query = db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      imagePath: users.imagePath,
      phoneNumber: users.phoneNumber,
      role: roles.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastSeen: users.lastSeen,
      verified: sql`CASE 
        WHEN ${users.phoneNumber} IS NOT NULL AND ${users.phoneNumber} != '' THEN 'phone' 
        ELSE ${users.verification} 
      END`.mapWith(String),
      subscribed: sql`(
        SELECT ${membershipPlans.name} 
        FROM ${userSubscriptions} 
        JOIN ${membershipPlans} ON ${membershipPlans.id} = ${userSubscriptions.planId}
        WHERE ${userSubscriptions.userId} = ${users.id} AND ${userSubscriptions.status} = 'active'
        LIMIT 1
      )`.mapWith(String),
      propertiesCount: sql`(SELECT count(*) FROM properties WHERE properties.user_id = ${users.id})`.mapWith(Number)
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id));

    // 3. filter role (ถ้าไม่ใช่ all) - filter by roles.name
    if (role !== "all") {
      query = query.where(eq(roles.name, role));
    }

    // 4. ใส่ pagination
    const data = await query.limit(limit).offset(offset);

    // 5. นับ total (เอาไว้ทำ pagination frontend)
    let totalQuery = db.select({ count: count() })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    if (role !== "all") {
      totalQuery = totalQuery.where(eq(roles.name, role));
    }

    const totalResult = await totalQuery;
    const total = totalResult[0].count;

    // 6. response — format matches frontend expectation: { users, pagination }
    return res.status(200).json({
      users: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /admin/users/search
export const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(200).json({ users: [] });
    }

    const searchPattern = `%${search}%`;
    const data = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      imagePath: users.imagePath,
      phoneNumber: users.phoneNumber,
      role: roles.name,
      createdAt: users.createdAt,
      verified: sql`CASE 
        WHEN ${users.phoneNumber} IS NOT NULL AND ${users.phoneNumber} != '' THEN 'phone' 
        ELSE ${users.verification} 
      END`.mapWith(String),
      subscribed: sql`(
        SELECT ${membershipPlans.name} 
        FROM ${userSubscriptions} 
        JOIN ${membershipPlans} ON ${membershipPlans.id} = ${userSubscriptions.planId}
        WHERE ${userSubscriptions.userId} = ${users.id} AND ${userSubscriptions.status} = 'active'
        LIMIT 1
      )`.mapWith(String),
      propertiesCount: sql`(SELECT count(*) FROM properties WHERE properties.user_id = ${users.id})`.mapWith(Number)
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(sql`${users.firstName} ILIKE ${searchPattern} OR ${users.lastName} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern} OR ${users.phoneNumber} ILIKE ${searchPattern}`)
    .limit(20);

    return res.status(200).json({ 
      users: data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
      }
    });
  } catch (error) {
    console.error("Search users admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /admin/users/:id
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { role, roleId, firstName, lastName, phoneNumber } = req.body

        let finalRoleId = roleId ? parseInt(roleId) : undefined;

        // ถ้าส่ง role เป็น string (เช่น "admin", "user") มา ให้ไปหา roleId
        if (role && !finalRoleId) {
            const [roleData] = await db.select().from(roles).where(eq(roles.name, role.toLowerCase()));
            if (roleData) {
                finalRoleId = roleData.id;
            }
        }

        await db.update(users)
            .set({
                roleId: finalRoleId,
                firstName,
                lastName,
                phoneNumber,
                updatedAt: new Date()
            })
            .where(eq(users.id, parseInt(id)))

        return res.status(200).json({ message: 'User updated successfully' })
    } catch (error) {
        console.error('Update user admin error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// DELETE /admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        // Caution: This might fail if there are foreign key constraints (properties, favorites, etc.)
        // Usually we might want to soft-delete or handle cascading
        await db.delete(users).where(eq(users.id, parseInt(id)))

        return res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Delete user admin error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /admin/stats
export const getStats = async (req, res) => {
    try {
        const [totalUsers] = await db.select({ count: count() }).from(users)
        const [totalProperties] = await db.select({ count: count() }).from(properties)
        const [activeSubscriptions] = await db
            .select({ count: count() })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.status, 'active'))

        return res.status(200).json({
            totalUsers: totalUsers.count,
            totalProperties: totalProperties.count,
            activeSubscriptions: activeSubscriptions.count
        })
    } catch (error) {
        console.error('Get stats error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// GET /admin/notifications
export const getNotifications = async (req, res) => {
    try {
        const data = await db
            .select()
            .from(notifications)
            .orderBy(sql`${notifications.createdAt} DESC`)
            .limit(50);

        return res.status(200).json(data);
    } catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// PATCH /admin/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.update(notifications)
            .set({ status: 'read', updatedAt: new Date() })
            .where(eq(notifications.id, parseInt(id)));

        return res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// PATCH /admin/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        await db.update(notifications)
            .set({ status: 'read', updatedAt: new Date() })
            .where(eq(notifications.status, 'unread'));

        return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// GET /admin/properties
export const getAdminProperties = async (req, res) => {
    try {
        // Join properties with users (owner) and main image
        const rows = await db
            .select({
                id: properties.id,
                name: properties.name,
                description: properties.description,
                startingPrice: properties.startingPrice,
                rentPrice: properties.rentPrice,
                province: properties.province,
                district: properties.district,
                status: properties.status,
                rejectionReason: properties.rejectionReason,

                createdAt: properties.createdAt,
                userId: properties.userId,
                ownerName: properties.ownerName,
                // joined user fields
                userFirstName: users.firstName,
                userLastName: users.lastName,
                userEmail: users.email,
                userImagePath: users.imagePath,
                // joined main image
                imagePath: propertyImages.imagePath,
            })
            .from(properties)
            .leftJoin(users, eq(properties.userId, users.id))
            .leftJoin(
                propertyImages,
                sql`${propertyImages.propertyId} = ${properties.id} AND ${propertyImages.isMain} = true`
            )

        // Map to shape that frontend expects
        const data = rows.map(row => ({
            id: String(row.id),
            title: row.name,
            description: row.description,
            price: row.startingPrice ? parseFloat(row.startingPrice) : null,
            image: row.imagePath
                ? `http://localhost:4000/${row.imagePath}`
                : null,
            status: row.status,
            rejectionReason: row.rejectionReason ?? null,
            location: [row.district, row.province].filter(Boolean).join(', ') || null,
            createdAt: row.createdAt,
            userId: String(row.userId),
            Owner: {
                name: row.userFirstName
                    ? `${row.userFirstName} ${row.userLastName || ''}`.trim()
                    : (row.ownerName || 'Unknown'),
                email: row.userEmail || null,
                image: row.userImagePath
                    ? `http://localhost:4000/${row.userImagePath}`
                    : null,
            },
        }))

        return res.status(200).json(data)
    } catch (error) {
        console.error('Get admin properties error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// PUT /admin/properties/:id/status
export const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        // 1. Update status and rejection reason
        const [updated] = await db.update(properties)
            .set({ 
                status: status.toLowerCase(), 
                rejectionReason: reason || null,
                updatedAt: new Date() 
            })
            .where(eq(properties.id, parseInt(id)))
            .returning();

        if (!updated) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // 2. Notify the owner about the decision
        await db.insert(notifications).values({
            userId: updated.userId,
            title: status === 'approved' ? 'Property Approved! 🎉' : 'Property Rejected ⚠️',
            message: status === 'approved' 
                ? `Your property "${updated.name}" has been approved and is now live.`
                : `Your property "${updated.name}" was rejected. Reason: ${reason || 'No reason provided.'}`,
            type: status === 'approved' ? 'PROPERTY_APPROVED' : 'PROPERTY_REJECTED',
            status: 'unread'
        });

        return res.status(200).json({ message: `Property ${status} successfully` });
    } catch (error) {
        console.error('Update property status error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// GET /admin/logs
export const getLogs = async (req, res) => {
    try {
        const data = await db
            .select({
                id: notifications.id,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                createdAt: notifications.createdAt,
                userId: notifications.userId,
                actorFirstName: users.firstName,
                actorLastName: users.lastName
            })
            .from(notifications)
            .leftJoin(users, eq(notifications.userId, users.id))
            .orderBy(sql`${notifications.createdAt} DESC`)
            .limit(10);

        // Map to format ActivityLogs.tsx expects
        const mappedLogs = data.map(log => {
            let action = 'info';
            let entityType = 'property'

            if (log.type === 'PROPERTY_PENDING') action = 'create';
            if (log.type === 'PROPERTY_APPROVED') action = 'approve';
            if (log.type === 'PROPERTY_REJECTED') action = 'reject';
            if (log.type === 'USER_REGISTERED') { action = 'create'; entityType = 'user'; }

            return {
                id: log.id,
                action: action,
                entityType: entityType,
                entityId: String(log.id),
                createdAt: log.createdAt,
                actor: {
                    name: log.actorFirstName ? `${log.actorFirstName} ${log.actorLastName || ''}`.trim() : 'System'
                },
                details: {
                    message: log.message,
                    title: log.title
                }
            };
        });

        return res.status(200).json(mappedLogs);
    } catch (error) {
        console.error('Get logs error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


