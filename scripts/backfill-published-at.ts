// scripts/backfill-published-at.ts
import { getPayload } from 'payload'
import config from '@/payload.config'

async function run() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { publishedAt: { exists: false } },
      ],
    },
    limit: 0,
  })

  console.log(`Found ${docs.length} published posts missing publishedAt`)

  for (const doc of docs) {
    await payload.update({
      collection: 'posts',
      id: doc.id,
      data: {
        publishedAt: doc.createdAt, // fallback — swap for doc.dateStart if you'd rather use the action date
      },
    })
    console.log(`Updated ${doc.id} — ${doc.title}`)
  }

  console.log('Done.')
  process.exit(0)
}

run()