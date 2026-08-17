// src/app/(frontend)/map/page.tsx
import { getPayload } from 'payload'
import config from '@/payload.config'

import { MovementMap } from '../components/MovementMapLoader'

export default async function MapPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [posts, tags] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-dateStart',
      limit: 500, // stands in for "all" — raise if you expect more geotagged posts than this
      depth: 2, // populate issueTags and media instead of returning bare IDs
    }),
    payload.find({ collection: 'issue-tags', limit: 20 }),
  ])

  return <MovementMap posts={posts.docs as any} tags={tags.docs as any} variant="full" />
}
