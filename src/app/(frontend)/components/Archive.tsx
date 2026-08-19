'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Tag = {
  id: string
  name: string
  color?: string | null
}

type Post = {
  id: string
  slug?: string | null
  title?: string | null
  location?: string | null
  imageUrl?: string | null
  tags: Tag[]
}

export function Archive({ posts, tags }: { posts: Post[]; tags: Tag[] }) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)

  const selectedTag = tags.find((tag) => tag.id === selectedTagId)

  const visiblePosts = useMemo(() => {
    if (!selectedTagId) return posts

    return posts.filter((post) => post.tags.some((tag) => tag.id === selectedTagId))
  }, [posts, selectedTagId])

  return (
    <main className="min-h-screen bg-paper pt-28">
      <section className="px-6 lg:px-[4.4vw]">
        <nav aria-label="Filter posts by issue" className="flex max-w-[1600px] flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedTagId(null)}
            className={`rounded-full border cursor-pointer border-ink px-7 py-2 text-xs transition-colors ${
              selectedTagId === null ? 'bg-ink text-paper' : 'bg-transparent text-ink'
            }`}
          >
            All
          </button>

          {tags.map((tag) => {
            const isActive = tag.id === selectedTagId

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTagId(tag.id)}
                style={isActive ? { backgroundColor: tag.color ?? '#008a42' } : undefined}
                className={`flex items-center gap-2 rounded-full cursor-pointer border border-ink px-5 py-3 text-xs transition-colors ${
                  isActive ? 'text-white' : 'bg-transparent text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  style={!isActive ? { backgroundColor: tag.color ?? '#008a42' } : undefined}
                  className={`h-3 w-3 rounded-full ${isActive ? 'bg-white' : ''}`}
                />
                {tag.name}
              </button>
            )
          })}
        </nav>
      </section>

      <section className="px-6 pb-20 pt-20 lg:px-[4.4vw]">
        {visiblePosts.length ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10">
            {visiblePosts.map((post) => {
              const isSelectedCategory =
                selectedTagId !== null && post.tags.some((tag) => tag.id === selectedTagId)

              const activeColor = selectedTag?.color ?? '#008a42'
              const card = (
                <div className="group relative">
                  {/* Side handle */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-1/2 z-20 h-13 w-4 -translate-x-full -translate-y-1/2 rounded-l-md bg-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <article
                    style={isSelectedCategory ? { backgroundColor: activeColor } : undefined}
                    className={`relative flex aspect-[0.92] overflow-hidden border border-ink p-10 transition-colors duration-300 ${
                      isSelectedCategory ? 'text-white' : 'bg-paper text-ink group-hover:text-white'
                    }`}
                  >
                    {/* Green hover background */}
                    <div
                      aria-hidden="true"
                      style={{ backgroundColor: activeColor }}
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    {/* First uploaded image appears over the green background */}
                    {post.imageUrl && (
                      <>
                        <img
                          src={post.imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </>
                    )}

                    <div className="relative z-10 flex h-full w-full flex-col">
                      <p className="text-sm">{post.tags[0]?.name ?? 'Uncategorised'}</p>

                      <h2 className="my-auto font-mono text-lg font-bold leading-tight">
                        {post.title}
                      </h2>

                      <p className="text-sm">{post.location ?? 'Nigeria'}</p>
                    </div>
                  </article>
                </div>
              )
              return post.slug ? (
                <Link
                  key={post.id}
                  href={`/archives/${post.slug}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-4"
                >
                  {card}
                </Link>
              ) : (
                <div key={post.id}>{card}</div>
              )
            })}
          </div>
        ) : (
          <p className="border border-ink p-8 text-lg">No posts found for this issue.</p>
        )}
      </section>
    </main>
  )
}
