import { getPayload } from 'payload'
import config from '@/payload.config'

import { Archive } from '../components/Archive'

export default async function ArchivePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [posts, tags] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-dateStart',
      limit: 100,
      depth: 2,
    }),
    payload.find({
      collection: 'issue-tags',
      limit: 50,
    }),
  ])

    const archivePosts = posts.docs.map((post: any) => {
    const media = Array.isArray(post.media) ? post.media : []

    const firstImage = media.find(
        (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'mimeType' in item &&
        typeof item.mimeType === 'string' &&
        item.mimeType.startsWith('image/'),
    ) as { url?: string } | undefined

    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        location: post.locationDescription,
        imageUrl: firstImage?.url ?? null,
        tags: (post.issueTags ?? [])
        .filter((tag: unknown) => typeof tag === 'object' && tag !== null)
        .map((tag: any) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
        })),
    }
    })

  const archiveTags = tags.docs.map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }))

  return <Archive posts={archivePosts} tags={archiveTags} />
}
