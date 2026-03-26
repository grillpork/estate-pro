import { db } from '../../database/schema/db.js';
import { users } from '../../database/schema/index.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async (req, res) => {
    const user = await db.select().from(users);
    return res.json(user)
}

export const getUserById = async (req, res) => {
    const id = req.params.id;         
    const user = await db.select()
        .from(users)
        .where(eq(users.id, Number(id)));
    return res.json(user);
}

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id
        const { username, firstName, lastName, password, phoneNumber, roleId } = req.body
        const updatedUsers = await db
            .update(users)
            .set({
                username,
                firstName,
                lastName,
                password,
                phoneNumber,
                roleId: roleId ? Number(roleId) : undefined
            })
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