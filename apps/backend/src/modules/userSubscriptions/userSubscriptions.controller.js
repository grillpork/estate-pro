import { eq, and, count } from 'drizzle-orm'
import { db } from '../../database/schema/db.js'
import { userSubscriptions, membershipPlans, properties } from '../../database/schema/index.js'

/**
 * Shared Helper — ดึง active subscription + จำนวนประกาศปัจจุบันของ user
 * ใช้ร่วมกัน 2 ที่: checkQuota (controller) และ requireSubscription (middleware)
 * แยกออกมาเพื่อไม่ต้องเขียนซ้ำ
 * @param {number} userId — id ของ user ที่ต้องการเช็ค
 * @returns {{ subscription, plan, currentListings, maxListings }}
 */
export const getActiveSubscriptionWithQuota = async (userId) => {
  /* ---- ขั้นที่ 1: หา subscription ที่ status = 'active' ---- */
  const activeSubs = await db
    .select({
      subscription: userSubscriptions,
      /* ดึงทุก column ของ user_subscriptions */
      plan: membershipPlans,
      /* ดึงทุก column ของ membership_plans (ชื่อแพลน, maxListings, ราคา) */
    })
    .from(userSubscriptions)
    .innerJoin(membershipPlans, eq(userSubscriptions.planId, membershipPlans.id))
    /* INNER JOIN — ต้องมี plan ที่ตรงกัน ถ้า planId ชี้ไปแพลนที่ถูกลบจะไม่ดึงมา */
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
        /* เอาเฉพาะที่ active — ไม่เอา cancelled, expired */
      )
    )
    .limit(1)
  /* limit(1) — user ควรมี active ได้แค่ 1 อัน (ระบบ cancel ตัวเก่าก่อนสร้างใหม่) */

  /* ถ้าไม่มี active subscription → return ค่าเปล่า */
  if (activeSubs.length === 0) {
    return {
      subscription: null,
      plan: null,
      currentListings: 0,
      maxListings: null,
      /* null = ยังไม่มีแพลน ไม่ใช่ unlimited */
    }
  }

  const { subscription, plan } = activeSubs[0]

  /* ---- ขั้นที่ 2: นับจำนวน property ที่ user ลงประกาศอยู่ ---- */
  const [propertyCount] = await db
    .select({ count: count() })
    /* SELECT COUNT(*) — นับทุก property ของ user คนนี้ */
    .from(properties)
    .where(eq(properties.userId, userId))

  const currentListings = propertyCount.count
  /* จำนวนประกาศปัจจุบัน */
  const maxListings = plan.maxListings
  /* จำนวนประกาศสูงสุดของแพลน — null = unlimited */

  return {
    subscription,
    plan,
    currentListings,
    maxListings,
  }
}

/* ============================================================
   GET /user-subscriptions — ดึง subscription ทั้งหมดในระบบ (Admin only)
   ============================================================
   Flow: verifyToken → requireAdmin → ดึงทุก row จาก user_subscriptions → ส่งกลับ
   ใช้ในหน้า Admin Dashboard เพื่อดูรายการ subscription ทั้งหมด */
export const getAllUserSubscriptions = async (req, res) => {
  try {
    const result = await db.select().from(userSubscriptions)
    /* SELECT * FROM user_subscriptions — ดึงทุก subscription ไม่ filter */
    return res.json(result)
  } catch (error) {
    console.error('getAllUserSubscriptions error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/* ============================================================
   GET /user-subscriptions/me — ดึง subscription ของ user ที่ login อยู่
   ============================================================
   Flow: verifyToken → ดึง userId จาก JWT → query เฉพาะ subscription ของ user คนนั้น
   ใช้ในหน้า "แพลนของฉัน" (My Subscription) */
export const getMySubscription = async (req, res) => {
  try {
    const userId = Number(req.user?.id)
    /* ดึง userId จาก JWT token ที่ verifyToken แนบไว้ใน req.user */
    const result = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
    /* WHERE user_id = userId — เอาเฉพาะของ user คนนี้
       อาจมีหลาย row (เก่า + ใหม่) เพราะเก็บ history ไว้ */
    return res.json(result)
  } catch (error) {
    console.error('getMySubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/* ============================================================
   GET /user-subscriptions/:id — ดึง subscription ตาม id
   ============================================================
   Flow: verifyToken → ดึง id จาก URL params → query 1 row → เจอก็ส่งกลับ ไม่เจอ 404 */
export const getUserSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params
    /* ดึง id จาก URL เช่น /user-subscriptions/5 → id = '5' */
    const [row] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, Number(id)))
    /* WHERE id = 5 — destructure [row] เอา row แรก (id เป็น PK มีได้แค่ 1) */

    if (!row) {
      return res.status(404).json({ message: 'Subscription not found' })
    }
    return res.json(row)
  } catch (error) {
    console.error('getUserSubscriptionById error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/* ============================================================
   POST /user-subscriptions — สมัคร subscription ใหม่
   ============================================================
   Flow: verifyToken → validate input → เช็คว่าแพลนมีอยู่จริง → validate billingCycle
         → ยกเลิก subscription เก่าที่ active อยู่ → คำนวณ endDate → INSERT ลง DB → ส่งกลับ
   ใช้ตอน user เลือกแพลนแล้วกด "สมัคร" ในหน้า pricing */
export const createUserSubscription = async (req, res) => {
  try {
    const { planId, billingCycle, startDate, endDate, autoRenew } = req.body
    /* planId = id ของแพลนที่เลือก (จำเป็น)
       billingCycle = 'monthly' หรือ 'yearly' (จำเป็น)
       startDate, endDate = optional — ถ้าไม่ส่งระบบคำนวณให้
       autoRenew = ต่ออายุอัตโนมัติหรือไม่ (default: false) */
    const userId = Number(req.user?.id)

    /* ---- Validation ---- */
    if (!planId || !billingCycle) {
      return res.status(400).json({ message: 'planId and billingCycle are required' })
    }

    /* ---- เช็คว่า plan ที่เลือกมีอยู่จริงใน DB ---- */
    const [plan] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(planId)))

    if (!plan) {
      return res.status(404).json({ message: 'Membership plan not found' })
      /* planId ชี้ไปแพลนที่ไม่มี → 404 */
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ message: "billingCycle must be 'monthly' or 'yearly'" })
      /* ป้องกันค่าแปลก ๆ เช่น 'weekly', 'daily' */
    }

    const now = new Date()
    const start = startDate ? new Date(startDate) : now
    /* ถ้า client ไม่ส่ง startDate → ใช้เวลาปัจจุบัน */

    /* ---- ยกเลิก subscription เก่าที่ active อยู่ ---- */
    /* user ควรมี active ได้แค่ 1 อัน — ตัวเก่าต้อง cancel ก่อน
       ทำตรงนี้แทนที่จะให้ client เรียก cancel เอง เพื่อกัน race condition */
    await db
      .update(userSubscriptions)
      .set({ status: 'cancelled', updatedAt: now })
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'active')
        )
      )

    /* ---- คำนวณ endDate อัตโนมัติจาก billingCycle ---- */
    let calculatedEndDate = null
    if (endDate) {
      calculatedEndDate = new Date(endDate)
      /* ถ้า client ส่ง endDate มาเอง → ใช้ตามนั้น */
    } else {
      calculatedEndDate = new Date(start)
      if (billingCycle === 'monthly') {
        calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1)
        /* monthly → +1 เดือน */
      } else if (billingCycle === 'yearly') {
        calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1)
        /* yearly → +1 ปี */
      }
    }

    /* ---- สร้าง payload แล้ว INSERT ---- */
    const payload = {
      userId,
      planId: Number(planId),
      billingCycle,
      startDate: start,
      endDate: calculatedEndDate,
      status: 'active',
      /* subscription ใหม่เริ่มเป็น active เสมอ */
      autoRenew: autoRenew ?? false,
      /* ?? false = ถ้าไม่ส่งมาใช้ false เป็น default */
      createdAt: now,
      updatedAt: now,
    }

    const [created] = await db.insert(userSubscriptions).values(payload).returning()
    /* .returning() — INSERT แล้วส่ง row ที่สร้างกลับมา (รวม id ที่ DB generate ให้) */
    return res.status(201).json(created)
    /* 201 = Created */
  } catch (error) {
    console.error('createUserSubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/* ============================================================
   PUT /user-subscriptions/:id — แก้ไข subscription (Partial Update)
   ============================================================
   Flow: verifyToken → ดึง id จาก params → หา subscription เดิม → เช็คสิทธิ์
         → validate แต่ละ field ที่ส่งมา → UPDATE เฉพาะ field ที่เปลี่ยน → ส่งกลับ
   สิทธิ์: user แก้ได้เฉพาะ subscription ของตัวเอง, admin แก้ได้ทุกคน */
export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params
    const userId = Number(req.user?.id)
    const userRole = req.user?.role?.toLowerCase()
    const isAdmin = userRole === 'admin' || userRole === 'superadmin'
    /* เช็คว่าเป็น admin หรือ superadmin — ถ้าใช่จะ bypass เช็คเจ้าของ */
    console.log('[updateUserSubscription] req.user =', req.user, '| isAdmin =', isAdmin)

    /* ---- หา subscription ที่ต้องการแก้ ---- */
    const [existing] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    /* ---- เช็คสิทธิ์: ไม่ใช่ admin + ไม่ใช่เจ้าของ → 403 ---- */
    if (!isAdmin && existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: not your subscription' })
    }

    /* ---- Partial Update — แก้เฉพาะ field ที่ client ส่งมา ---- */
    const { planId, billingCycle, startDate, endDate, status, autoRenew } = req.body
    const body = { updatedAt: new Date() }
    /* เริ่มจาก updatedAt เสมอ — ทุกครั้งที่แก้ต้องอัพเดทเวลา */

    /* ถ้าส่ง planId มา → เช็คว่าแพลนใหม่มีอยู่จริง */
    if (planId !== undefined) {
      const [plan] = await db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.id, Number(planId)))
      if (!plan) {
        return res.status(404).json({ message: 'Membership plan not found' })
      }
      body.planId = Number(planId)
    }

    /* ถ้าส่ง billingCycle มา → validate ว่าเป็น monthly หรือ yearly */
    if (billingCycle !== undefined) {
      if (!['monthly', 'yearly'].includes(billingCycle)) {
        return res.status(400).json({ message: "billingCycle must be 'monthly' or 'yearly'" })
      }
      body.billingCycle = billingCycle
    }

    /* ถ้าส่ง startDate มา → แปลงเป็น Date + validate */
    if (startDate !== undefined && startDate !== '' && startDate !== null) {
      const d = new Date(startDate)
      if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid startDate' })
      /* isNaN(d.getTime()) = วันที่ไม่ valid เช่น 'abc' */
      body.startDate = d
    }

    /* ถ้าส่ง endDate มา → แปลงเป็น Date + validate */
    if (endDate !== undefined && endDate !== '' && endDate !== null) {
      const d = new Date(endDate)
      if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid endDate' })
      body.endDate = d
    }

    /* status + autoRenew — ใส่ตรง ๆ ไม่ต้อง validate เพิ่ม */
    if (status !== undefined) body.status = status
    if (autoRenew !== undefined) body.autoRenew = autoRenew

    /* ---- UPDATE แล้วส่ง row ที่อัพเดทกลับ ---- */
    const [updated] = await db
      .update(userSubscriptions)
      .set(body)
      .where(eq(userSubscriptions.id, Number(id)))
      .returning()
    /* .returning() — ส่ง row ที่ UPDATE แล้วกลับมา */

    return res.json(updated)
  } catch (error) {
    console.error('updateUserSubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/* ============================================================
   GET /user-subscriptions/check-quota — เช็คโควต้าลงประกาศของ user
   ============================================================
   Flow: verifyToken → หา active subscription → เช็คหมดอายุ → นับประกาศ → เทียบกับ maxListings
   ใช้ใน frontend ก่อนเปิดฟอร์มลงประกาศ เพื่อแสดง UI ที่เหมาะสม
   
   กรณีที่เป็นไปได้ 5 กรณี:
   1. มี subscription + หมดอายุ → SUBSCRIPTION_EXPIRED
   2. มี subscription + ลงครบ maxListings → MAX_LISTINGS_REACHED
   3. มี subscription + ยังลงได้ → OK
   4. ไม่มี subscription + ลงฟรีครบ 1 แล้ว → FREE_LISTING_LIMIT_REACHED
   5. ไม่มี subscription + ยังไม่เคยลง → FREE_LISTING_ALLOWED */
export const checkQuota = async (req, res) => {
  try {
    const userId = Number(req.user?.id)

    /* ---- ขั้นที่ 1: หา active subscription (เหมือน shared helper แต่เช็คหมดอายุเพิ่ม) ---- */
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

    /* ---- กรณี: มี subscription ---- */
    if (activeSubs.length > 0) {
      const { subscription, plan } = activeSubs[0]

      /* กรณีที่ 1: subscription หมดอายุ */
      if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        return res.json({
          hasSubscription: true,
          canCreateListing: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: 'แพลนของคุณหมดอายุแล้ว กรุณาต่ออายุหรือสมัครแพลนใหม่',
          planName: plan.name,
        })
      }

      /* นับจำนวน property ปัจจุบัน */
      const [propertyCount] = await db
        .select({ count: count() })
        .from(properties)
        .where(eq(properties.userId, userId))

      const currentListings = propertyCount.count
      const maxListings = plan.maxListings
      /* maxListings = null หมายถึง unlimited (ไม่จำกัด) */
      const canCreate = maxListings === null || currentListings < maxListings
      /* null = unlimited → ลงได้เสมอ
         currentListings < maxListings → ยังลงได้ */

      /* กรณีที่ 2-3: ลงครบ maxListings หรือยังลงได้ */
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

    /* ---- กรณี: ไม่มี subscription (new user / free tier) ---- */
    /* ระบบอนุญาตให้ลง 1 รายการฟรีโดยไม่ต้องสมัครแพลน */
    const [propertyCount] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.userId, userId))

    const currentListings = propertyCount.count

    /* กรณีที่ 4: ลงฟรีครบ 1 รายการแล้ว → ต้องสมัครแพลน */
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

    /* กรณีที่ 5: ยังไม่เคยลงเลย → อนุญาตให้ลง 1 รายการฟรี */
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

/* ============================================================
   DELETE /user-subscriptions/:id — ลบ subscription
   ============================================================
   Flow: verifyToken → หา subscription → เช็คสิทธิ์ (เจ้าของ or admin) → DELETE → ส่ง success
   สิทธิ์เหมือน updateUserSubscription: user ลบได้เฉพาะของตัวเอง, admin ลบได้ทุกคน */
export const deleteUserSubscription = async (req, res) => {
  try {
    const { id } = req.params
    const userId = Number(req.user?.id)
    const userRole = req.user?.role?.toLowerCase()
    const isAdmin = userRole === 'admin' || userRole === 'superadmin'

    /* ---- หา subscription ที่จะลบ ---- */
    const [existing] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, Number(id)))

    if (!existing) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    /* ---- เช็คสิทธิ์: ไม่ใช่ admin + ไม่ใช่เจ้าของ → 403 ---- */
    if (!isAdmin && existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: not your subscription' })
    }

    /* ---- ลบจริง (hard delete) ---- */
    await db.delete(userSubscriptions).where(eq(userSubscriptions.id, Number(id)))
    /* DELETE FROM user_subscriptions WHERE id = :id
       เป็น hard delete ไม่ใช่ soft delete — row หายไปจาก DB จริง */
    return res.json({ message: 'Subscription deleted' })
  } catch (error) {
    console.error('deleteUserSubscription error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
