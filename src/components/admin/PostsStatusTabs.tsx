'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const tabs = [
  {
    label: 'Pending Review',
    value: 'pending-review',
  },
  {
    label: 'Published',
    value: 'published',
  },
  {
    label: 'All Posts',
    value: null,
  },
]

export function PostsStatusTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('where[status][equals]')
  const isAllPosts = searchParams.get('view') === 'all'

  // Determine the tab represented by the current URL
  const urlTab = currentStatus || (isAllPosts ? 'all' : null)

  // Local tab state gives us immediate visual feedback
  const [activeTab, setActiveTab] = useState<string>(urlTab ?? 'pending-review')

  const [loadingTab, setLoadingTab] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  /*
   * Open Posts on Pending Review by default.
   */
  useEffect(() => {
    if (!currentStatus && !isAllPosts) {
      setActiveTab('pending-review')

      router.replace(`${pathname}?where[status][equals]=pending-review`)

      return
    }
  }, [currentStatus, isAllPosts, pathname, router])

  /*
   * Keep our local active state synchronized with
   * the actual URL once Payload/Next finishes navigation.
   */
  useEffect(() => {
    if (currentStatus) {
      setActiveTab(currentStatus)
      setLoadingTab(null)
      return
    }

    if (isAllPosts) {
      setActiveTab('all')
      setLoadingTab(null)
    }
  }, [currentStatus, isAllPosts])

  useEffect(() => {
    async function loadPendingCount() {
      try {
        const response = await fetch('/api/posts?where[status][equals]=pending-review&limit=0', {
          credentials: 'include',
        })

        if (!response.ok) return

        const data = await response.json()

        setPendingCount(data.totalDocs ?? 0)
      } catch (error) {
        console.error('Failed to load pending post count:', error)
      }
    }

    loadPendingCount()
  }, [currentStatus, isAllPosts])

  function handleTabClick(event: React.MouseEvent<HTMLAnchorElement>, value: string | null) {
    event.preventDefault()

    const nextTab = value ?? 'all'

    // Don't reload/navigate if we're already on this tab
    if (nextTab === activeTab && !loadingTab) {
      return
    }

    // Immediately move the active state
    setActiveTab(nextTab)

    // Show spinner on the selected tab
    setLoadingTab(nextTab)

    if (value) {
      router.push(`${pathname}?where[status][equals]=${encodeURIComponent(value)}`)
    } else {
      router.push(`${pathname}?view=all`)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '8px',
        paddingBottom: '36px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          width: 'min(760px, 100%)',
          minHeight: '76px',
          padding: '5px',
          gap: '4px',
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-50)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        }}
      >
        {tabs.map((tab) => {
          const tabKey = tab.value ?? 'all'
          const active = activeTab === tabKey
          const loading = loadingTab === tabKey

          const href = tab.value
            ? `${pathname}?where[status][equals]=${encodeURIComponent(tab.value)}`
            : `${pathname}?view=all`

          return (
            <a
              key={tab.label}
              href={href}
              onClick={(event) => handleTabClick(event, tab.value)}
              aria-current={active ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                minWidth: 0,
                padding: '0 24px',
                borderRadius: '9px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: active ? 650 : 500,
                letterSpacing: '-0.01em',
                color: active ? 'var(--theme-text)' : 'var(--theme-elevation-500)',
                background: active ? 'var(--theme-bg)' : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.16)' : 'none',
                transition: 'background 150ms ease, color 150ms ease, box-shadow 150ms ease',
                whiteSpace: 'nowrap',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.8 : 1,
              }}
            >
              <span>{tab.label}</span>

              {tab.value === 'pending-review' && pendingCount !== null && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '24px',
                    height: '24px',
                    padding: '0 7px',
                    borderRadius: '999px',
                    background: active ? 'var(--theme-text)' : 'var(--theme-elevation-150)',
                    color: active ? 'var(--theme-bg)' : 'var(--theme-text)',
                    fontSize: '12px',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {pendingCount}
                </span>
              )}

              {loading && (
                <span
                  aria-label="Loading"
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid var(--theme-elevation-200)',
                    borderTopColor: 'var(--theme-text)',
                    borderRadius: '50%',
                    animation: 'postsTabSpin 700ms linear infinite',
                    flexShrink: 0,
                  }}
                />
              )}
            </a>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes postsTabSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
