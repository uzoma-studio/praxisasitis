import type { CollectionConfig } from 'payload'

const minWords = (min: number) => (value: any) => {
  if (!value) return `This field is required.`
  const text = JSON.stringify(value)
    .replace(/[{}[\]":,]/g, ' ')
    .trim()
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return wordCount >= min || `Needs at least ${min} words (currently ~${wordCount}).`
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'scale', 'issueTags', 'dateStart'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    // 1. Title
    { name: 'title', type: 'text', required: true, label: 'Title' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },

    // 2. Author name
    { name: 'authorName', type: 'text', required: true, label: 'Author name (real or pseudonym)' },

    // 3. Author contact (optional, visibility TBD — gated to logged-in users for now)
    {
      name: 'authorContact',
      type: 'text',
      label: 'Author contact (email, WhatsApp, Telegram, or Signal)',
      access: { read: ({ req: { user } }) => Boolean(user) },
    },

    // 4. Date / time period of action
    { name: 'dateStart', type: 'date', required: true, label: 'Action date (start)' },
    { name: 'dateEnd', type: 'date', label: 'Action date (end, if a range)' },

    // 5. Location description
    { name: 'locationDescription', type: 'text', required: true, label: 'Location description' },

    // 6. Geotag
    { name: 'coordinates', type: 'point', required: true, label: 'Geotag (lat/long)' },

    // 7. Scale
    {
      name: 'scale',
      type: 'select',
      required: true,
      options: [
        { label: 'Small group (≤10)', value: 'small' },
        { label: 'Neighbourhood', value: 'neighbourhood' },
        { label: 'City-wide', value: 'city-wide' },
        { label: 'Multi-city', value: 'multi-city' },
      ],
    },

    // 8. Issue tags
    {
      name: 'issueTags',
      type: 'relationship',
      relationTo: 'issue-tags',
      hasMany: true,
      required: true,
    },

    // 9. What did we do? — min. 300 words
    {
      name: 'whatDidWeDo',
      type: 'richText',
      required: true,
      label: 'What did we do?',
      validate: minWords(300),
    },

    // 10. What did we learn?
    { name: 'whatDidWeLearn', type: 'richText', required: true, label: 'What did we learn?' },

    // 11. What is still unclear?
    {
      name: 'whatIsStillUnclear',
      type: 'richText',
      required: true,
      label: 'What is still unclear?',
    },

    // 12. Request (optional)
    { name: 'request', type: 'richText', label: 'Request (e.g. "We need a lawyer")' },

    // 13. Media attachments (optional) — images, audio, video
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Media attachments',
    },

    // Editorial / archive plumbing
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: ['draft', 'pending-review', 'published', 'rejected'],
    },
    { name: 'locationSensitive', type: 'checkbox', label: 'Hide precise location publicly' },
  ],
}
