import { getPayload } from 'payload'
import config from '@/payload.config'

import { FAQAccordion } from '../components/FAQAccordion'
import { richTextToPlainText } from '@/lib/richText'

export const dynamic = 'force-dynamic'

export default async function FAQPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [faqs] = await Promise.all([
    payload.find({
      collection: 'faq',
      sort: 'order',
    }),
  ])

  // FAQAccordion expects `answer` as plain text, but the collection stores
  // it as Lexical richText — flatten it here.
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
