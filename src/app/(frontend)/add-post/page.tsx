import { getPayload } from 'payload'

import config from '@/payload.config'
import { AddPostForm } from './AddPostForm'

export default async function AddPostPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const tags = await payload.find({
    collection: 'issue-tags',
    limit: 50,
  })

  return (
    <AddPostForm
      tags={tags.docs.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      }))}
    />
  )
}