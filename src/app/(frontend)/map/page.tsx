import { getPayload } from 'payload'
import config from '@/payload.config'

import { MovementMap } from '../components/MovementMapLoader'
import { richTextToPlainText, truncateWords } from '@/lib/richText'

export default async function MapPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [posts, tags] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-dateStart',
      limit: 800, // stands in for "all" — raise if you expect more geotagged posts than this
      depth: 2, // populate issueTags and media instead of returning bare IDs
    }),
    payload.find({ collection: 'issue-tags', limit: 20 }),
  ])

  // MovementMap expects an `excerpt` string, but the collection only has
  // `whatDidWeDo` as richText — flatten and truncate it here, same as the
  // homepage does for RecentPosts/FeaturedStories.
  const mapPosts = posts.docs.map((doc: any) => ({
    ...doc,
    excerpt: truncateWords(richTextToPlainText(doc.whatDidWeDo), 50),
  }))

  return <MovementMap posts={mapPosts as any} tags={tags.docs as any} variant="full" />
}
