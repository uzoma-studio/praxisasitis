import type { CollectionConfig } from 'payload'

export const IssueTags: CollectionConfig = {
  slug: 'issue-tags',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true }, // e.g. "Labour", "Housing & Land"
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'color',
      type: 'select',
      required: true,
      options: [
        { label: 'Red', value: '#b8332f' },
        { label: 'Green', value: '#3f7d4f' },
        { label: 'Blue', value: '#4f8fd6' },
        { label: 'Amber', value: '#c78a2e' },
        // extend as your palette settles — match dots in the Figma exactly
      ],
    },
  ],
}