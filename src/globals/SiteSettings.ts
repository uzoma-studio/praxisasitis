import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' }, // optional — falls back to siteName text if empty
    { name: 'tagline', type: 'textarea', required: true }, // "Tell No Lies, Claim No Easy Victory"
    { name: 'introText', type: 'textarea' },
    {
      name: 'nav',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: ['x', 'instagram', 'facebook', 'tiktok', 'youtube', 'other'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'heroIllustration', type: 'upload', relationTo: 'media' },
  ],
}
