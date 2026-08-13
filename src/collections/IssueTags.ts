import type { CollectionConfig } from 'payload'

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const IssueTags: CollectionConfig = {
  slug: 'issue-tags',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) {
          data.slug = slugify(data.name)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true }, // e.g. "Labour", "Housing & Land"
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Leave blank to auto-generate from the name.',
      },
    },
    {
      name: 'color',
      type: 'select',
      required: true,
      options: [
        { label: 'Red', value: '#D10000' },
        { label: 'Green', value: '#00853F' },
        { label: 'Blue', value: '#0095D9' },
        { label: 'Amber', value: '#FCCA00' },
        { label: 'Purple', value: '#A900B2' },
      ],
    },
  ],
}
