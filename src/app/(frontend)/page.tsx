// src/app/(frontend)/page.tsx
import { getPayload } from 'payload'
import config from '@/payload.config'

import { Hero } from './components/Hero'
import { FeaturedStories } from './components/FeaturedStories'
import { RecentPosts } from './components/RecentPosts'
import { MovementMapSnapshot } from './components/MovementMapSnapshot'
import { FAQAccordion } from './components/FAQAccordion'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [featured, recent, tags, faqs, settings] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { featured: { equals: true }, status: { equals: 'published' } },
      limit: 3,
    }),
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-dateStart',
      limit: 6,
    }),
    payload.find({ collection: 'issue-tags', limit: 20 }),
    payload.find({ collection: 'faq', sort: 'order', limit: 6 }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  return (
    <>
      <Hero
        tagline={settings.tagline ?? undefined}
        introText={settings.introText ?? undefined}
        illustrationUrl={
          typeof settings.heroIllustration === 'object'
            ? (settings.heroIllustration?.url ?? undefined)
            : undefined
        }
      />
      <FeaturedStories posts={featured.docs as any} />
      <RecentPosts posts={recent.docs as any} />
      <MovementMapSnapshot tags={tags.docs as any} highlight={featured.docs[0] as any} />
      <FAQAccordion items={faqs.docs as any} />
    </>
  )
}
