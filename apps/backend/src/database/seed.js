import 'dotenv/config'
import { db } from './db.js'
import { landmarks } from './schema/landmark.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const data = JSON.parse(
  readFileSync(join(__dirname, 'data/thai-address.json'), 'utf-8')
)

const stations = data.stations // array ของสถานีทั้งหมด

async function seed() {
  console.log(`🌱 Seeding ${stations.length} stations...`)

  // แบ่ง batch ละ 50 รายการ เพื่อกันกรณีข้อมูลเยอะ
  const batchSize = 50
  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize)
    const rows = batch.map((s) => ({
      name:      s.name,
      latitude:  s.lat,
      longitude: s.lng,
      color:     s.color   ?? null,
      line:      s.line    ?? null,
      type:      s.system  ?? null,   // "MRT" | "BTS"
    }))
    await db.insert(landmarks).values(rows)
    console.log(`  ✅ inserted ${i + batch.length} / ${stations.length}`)
  }

  console.log('🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
