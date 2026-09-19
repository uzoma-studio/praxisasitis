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
      type: 'text',
      required: true,
      defaultValue: '#00853F',
      validate: (value?: string | null) =>
        /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Pick a colour from the palette.',
      admin: {
        description: 'Pick the colour used for this tag across the site.',
        components: {
          Field: '/fields/ColorPaletteField#ColorPaletteField',
        },
      },
    },
  ],
}
