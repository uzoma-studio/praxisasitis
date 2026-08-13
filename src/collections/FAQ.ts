import type { CollectionConfig } from 'payload'

export const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: { useAsTitle: 'question', defaultColumns: ['question'] },
  access: { read: () => true },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'richText' }, // Lexical, matches your Stories long-form choice
    { name: 'order', type: 'number', defaultValue: 0 }, // sort key, since admin drag-order isn't guaranteed stable in queries
  ],
}