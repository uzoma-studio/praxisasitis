'use client'

import { useDocumentInfo } from '@payloadcms/ui'

export function ViewPublishedPost() {
  const { id, data } = useDocumentInfo()

  if (!id || data?.status !== 'published' || !data?.slug) {
    return null
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    return null
  }

  const postUrl = `${siteUrl}/archives/${data.slug}`

  return (
    <div
      style={{
        marginTop: '12px',
        marginBottom: '20px',
      }}
    >
      <a
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        View published post
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  )
}
