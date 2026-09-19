'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const EmailAuthorButton: React.FC = () => {
  const email = useFormFields(([fields]) => fields?.email?.value as string | undefined)
  const title = useFormFields(([fields]) => fields?.title?.value as string | undefined)

  if (!email) {
    return (
      <p style={{ fontSize: '13px', opacity: 0.6 }}>Add an author email to enable this button.</p>
    )
  }

  const subject = `Updates for your Praxis post${title ? `: ${title}` : ''}`
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`

  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        marginTop: '10px',
        padding: '6px 12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        fontSize: '13px',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      Email author about this post
    </a>
  )
}

export default EmailAuthorButton
