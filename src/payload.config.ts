import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { FAQ } from './collections/FAQ'
import { IssueTags } from './collections/IssueTags'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Praxis',
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
      },
    },
  },

  collections: [Users, Media, Posts, FAQ, IssueTags],

  globals: [SiteSettings],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  sharp,

  plugins: [
    s3Storage({
      collections: {
        [Media.slug]: {
          // Serve straight from the R2 custom domain instead of proxying through Payload
          disablePayloadAccessControl: true,
          generateFileURL: ({
            filename: fileName,
            prefix,
          }: {
            filename: string
            prefix?: string
          }) =>
            [process.env.R2_PUBLIC_URL, prefix, encodeURIComponent(fileName)]
              .filter(Boolean)
              .join('/'),
        },
      },
      bucket: process.env.R2_BUCKET || '',
      clientUploads: true,
      config: {
        endpoint: process.env.R2_ENDPOINT, // https://<ACCOUNT_ID>.r2.cloudflarestorage.com
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})