import Link from 'next/link'

type Post = {
  id: string
  title: string
  slug: string
  issueTags?: { name: string; color?: string }[]
}

export function RecentPosts({ posts }: { posts: Post[] }) {
  return (
    <section className="border-b border-ink px-6 py-12">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-wide">Recent Stories</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="flex items-center gap-3 rounded-md border border-ink/20 bg-white/40 px-4 py-3 text-xs"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: post.issueTags?.[0]?.color ?? '#999' }}
            />
            <span className="font-medium">{post.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}