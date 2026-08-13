'use client'
import { useState } from 'react'

type FAQItem = { id: string; question: string; answer: string }

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="px-6 py-12">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-wide">FAQ</h2>
      <div className="divide-y divide-accent/40 border-y border-accent/40">
        {items.map((item, i) => (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="flex w-full items-center gap-4 py-3 text-left text-xs"
            >
              <span className="text-ink/40">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-medium">{item.question}</span>
            </button>
            {openId === item.id && (
              <p className="pb-3 pl-8 text-xs text-ink/70">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}