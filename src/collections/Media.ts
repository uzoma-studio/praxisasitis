import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    // The public "Add a post" form uploads files before the post exists,
    // so visitors need to be able to create media. Update and delete are
    // not listed, so Payload keeps them for logged-in editors only.
    create: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Images are listed explicitly so SVG (which can carry scripts) is
    // excluded. Keep this in sync with the accepted types in AddPostForm.
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'audio/*',
      'video/*',
      'application/pdf',
    ],
  },
}
