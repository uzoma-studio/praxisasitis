// src/app/(frontend)/page.tsx
import { getPayload } from 'payload'
import config from '@/payload.config'

import { Hero } from './components/Hero'
import { FeaturedStories } from './components/FeaturedStories'
import { RecentPosts } from './components/RecentPosts'
import { FAQAccordion } from './components/FAQAccordion'
import { richTextToPlainText, truncateWords } from '@/lib/richText'
import { MovementMap } from './components/MovementMapLoader'
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [featured, recent, tags, faqs, settings] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { featured: { equals: true }, status: { equals: 'published' } },
      limit: 6,
    }),
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-dateStart',
      limit: 9,
      depth: 2, // populate issueTags and media instead of returning bare IDs
    }),
    payload.find({ collection: 'issue-tags', limit: 20 }),
    payload.find({ collection: 'faq', sort: 'order', limit: 6 }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  // RecentPosts expects an `excerpt` string, but the collection only has
  // `whatDidWeDo` as richText — flatten and truncate it here.
  const recentPosts = recent.docs.map((doc: any) => ({
    ...doc,
    excerpt: truncateWords(richTextToPlainText(doc.whatDidWeDo), 30),
  }))

  // FAQAccordion expects `answer` as plain text, but the collection stores
  // it as Lexical richText — flatten it here, same as the post excerpts.
  const faqItems = faqs.docs.map((doc: any) => ({
    ...doc,
    answer: richTextToPlainText(doc.answer),
  }))

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
      <RecentPosts posts={recentPosts as any} />
      <MovementMap tags={tags.docs as any} posts={recentPosts as any} />
      <FAQAccordion items={faqItems as any} />
    </>
  )
}
