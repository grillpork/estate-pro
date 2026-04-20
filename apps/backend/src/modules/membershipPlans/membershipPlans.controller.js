import { eq } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { membershipPlans, userSubscriptions } from '../../database/schema/index.js'

/** GET /membership-plans */
/* Flow:
เรียก DB → ดึงทั้งหมด → ส่ง list กลับ → handle error */
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
/* Flow:
ตรวจสอบ input → ดึงข้อมูลตาม id → ส่งผลลัพธ์กลับ → handle error */
export const getMembershipPlanById = async (req, res) => {
  try {
    const { id } = req.params
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid id parameter' })
    }
    const [row] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(id)))
    /* เป็นการ query ไปที่ database เพื่อดึงข้อมูล membership plan ตาม id ที่ส่งมา
       แล้วเก็บผลลัพธ์แถวแรกไว้ในตัวแปร row */

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
/* Flow:
ตรวจสอบ input → สร้าง payload → insert ลง DB → ส่งผลลัพธ์กลับ → handle error */
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
      /* เป็นการเช็คว่า maxListings มีค่ามั้ย ถ้ามีจะ convert 
      เป็นตัวเลขด้วย Number() แล้วใช้ค่านั้น ถ้าไม่มีจะตั้งเป็น null */
      canChat: canChat ?? false,
      isActive: isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }
    /* เป็นการสร้าง payload object เพื่อเตรียมข้อมูลก่อน insert ลง database
     โดยมีการกำหนดค่า default และแปลง type ให้เหมาะสม */

    const [created] = await db.insert(membershipPlans).values(payload).returning()
    /* เป็นการ insert ข้อมูลใหม่ลงในตาราง membershipPlans โดยใช้ payload 
    แล้ว return ข้อมูลที่เพิ่งสร้างกลับมาเก็บในตัวแปร created */
    return res.status(201).json(created)
  } catch (error) {
    console.error('createMembershipPlan error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** PUT /membership-plans/:id */
/* Flow:
ตรวจสอบ input → ดึงข้อมูลเดิม → อัปเดตข้อมูล → ส่งผลลัพธ์กลับ → handle error */
export const updateMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid id parameter' })
    }

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
      isActive,
    } = req.body

    const body = { updatedAt: new Date() }

    if (name !== undefined) body.name = name
    if (description !== undefined) body.description = description
    if (priceMonthly !== undefined) body.priceMonthly = priceMonthly
    if (priceYearly !== undefined) body.priceYearly = priceYearly
    if (maxListings !== undefined) body.maxListings = Number(maxListings)
    if (canChat !== undefined) body.canChat = canChat
    if (isActive !== undefined) body.isActive = isActive
    /* เป็นการทำ Partial Update โดยเช็คว่าแต่ละ field ถูกส่งมาหรือไม่ (!== undefined) 
    แล้วอัปเดตเฉพาะค่าที่มีการส่งมา เพื่อไม่ให้ไป overwrite ค่าเดิมใน database */
    const [updated] = await db
      .update(membershipPlans)
      .set(body)
      /* คือการกำหนดค่าที่จะเอาไปอัปเดตใน database โดยใช้ข้อมูลจาก object body */
      .where(eq(membershipPlans.id, Number(id)))
      .returning()
    /* เป็นการอัปเดตข้อมูลในตาราง membershipPlans ตาม id โดยใช้ค่าจาก body 
    แล้วคืนค่าข้อมูลที่อัปเดตแล้วกลับมาเก็บในตัวแปร updated */
    return res.json(updated)
  } catch (error) {
    console.error('updateMembershipPlan error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/** DELETE /membership-plans/:id */
/* Flow:
ตรวจสอบ input → ดึงข้อมูลเดิม → ลบข้อมูล → ส่งผลลัพธ์กลับ → handle error */
export const deleteMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid id parameter' })
    }

    const [existing] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(id)))
    /* เป็นการ query ไปที่ database เพื่อดึงข้อมูล membership plan ตาม id ที่ส่งมา
     แล้วเก็บผลลัพธ์แถวแรกไว้ในตัวแปร existing */
    if (!existing) {
      return res.status(404).json({ message: 'Membership plan not found' })
    }

    await db.delete(userSubscriptions).where(eq(userSubscriptions.planId, Number(id)))
    await db.delete(membershipPlans).where(eq(membershipPlans.id, Number(id)))

    return res.json({ message: 'Membership plan deleted' })
  } catch (error) {
    console.error('deleteMembershipPlan error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
