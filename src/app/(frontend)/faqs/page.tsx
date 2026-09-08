// src/app/(frontend)/map/page.tsx
import { getPayload } from 'payload'
import config from '@/payload.config'

import { FAQAccordion } from '../components/FAQAccordion'
import { richTextToPlainText, truncateWords } from '@/lib/richText'

export default async function FAQPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [faqs] = await Promise.all([payload.find({ collection: 'faq', sort: 'order', limit: 6 })])

  // FAQAccordion expects `answer` as plain text, but the collection stores
  // it as Lexical richText — flatten it here, same as the post excerpts.
  const faqItems = faqs.docs.map((doc: any) => ({
    ...doc,
    answer: richTextToPlainText(doc.answer),
  }))

  return (
    <div className="pt-16">
      <FAQAccordion items={faqItems as any} />
    </div>
  )
}
