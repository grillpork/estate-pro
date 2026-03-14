import { db } from '../../database/db.js'
import { landmarks } from '../../database/schema/landmark.js'
import { sql } from 'drizzle-orm'

/**
 * GET /landmarks/nearby?lat=13.74&lng=100.55&radius=1500
 * radius = เมตร (default 1000 เมตร)
 */
export const getNearbyLandmarks = async (req, res) => {
  try {
    const lat    = parseFloat(req.query.lat)
    const lng    = parseFloat(req.query.lng)
    const radius = parseFloat(req.query.radius) || 1000
    const type   = req.query.type  // optional: "MRT" | "BTS"
    const line   = req.query.line  // optional: กรอง line

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng are required' })
    }

    // Haversine distance ใน PostgreSQL (หน่วย: เมตร)
    const distanceExpr = sql`
      6371000 * acos(
        cos(radians(${lat})) * cos(radians(${landmarks.latitude})) *
        cos(radians(${landmarks.longitude}) - radians(${lng})) +
        sin(radians(${lat})) * sin(radians(${landmarks.latitude}))
      )
    `

    let query = db
      .select({
        id:        landmarks.id,
        name:      landmarks.name,
        type:      landmarks.type,
        line:      landmarks.line,
        color:     landmarks.color,
        latitude:  landmarks.latitude,
        longitude: landmarks.longitude,
        distance:  distanceExpr,
      })
      .from(landmarks)
      .where(sql`${distanceExpr} <= ${radius}`)
      .orderBy(distanceExpr)

    let results = await query

    // filter เพิ่มเติมฝั่ง JS (ถ้า DB ยังไม่ support parameterized ใน WHERE ซ้อน)
    if (type) results = results.filter(s => s.type?.toUpperCase() === type.toUpperCase())
    if (line) results = results.filter(s => s.line?.includes(line))

    return res.json({
      total: results.length,
      stations: results.map(s => ({
        ...s,
        distance: Math.round(s.distance), // ปัดเป็น เมตร
      })),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * GET /landmarks  — ดึงทั้งหมด (option: ?type=MRT|BTS)
 */
export const getAllLandmarks = async (req, res) => {
  try {
    const type = req.query.type
    let results = await db.select().from(landmarks)
    if (type) results = results.filter(s => s.type?.toUpperCase() === type.toUpperCase())
    return res.json({ total: results.length, stations: results })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
