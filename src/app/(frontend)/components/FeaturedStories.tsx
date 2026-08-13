import Link from 'next/link'
import Image from 'next/image'

type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  dateStart: string
  media?: { url?: string }[]
  issueTags?: { name: string }[]
}

export function FeaturedStories({ posts }: { posts: Post[] }) {
  const [hero, ...rest] = posts

  return (
    <section id="featured" className="border-b border-ink px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide">Featured Stories</h2>
        <div className="flex gap-2 text-xs">
          <button aria-label="Previous" className="h-7 w-7 rounded border border-ink">‹</button>
          <button aria-label="Next" className="h-7 w-7 rounded border border-ink">›</button>
        </div>
      </div>

      {hero && (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-ink md:grid-cols-3">
          <Link href={`/posts/${hero.slug}`} className="relative col-span-2 block bg-ink/5">
            {hero.media?.[0]?.url && (
              <Image src={hero.media[0].url} alt={hero.title} width={800} height={500} className="h-64 w-full object-cover md:h-full" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-paper p-4">
              <p className="text-[10px] uppercase text-ink/60">{hero.issueTags?.[0]?.name}</p>
              <h3 className="text-lg font-bold leading-tight">{hero.title}</h3>
              <div className="mt-2 flex items-center justify-between text-[10px] uppercase">
                <span>{new Date(hero.dateStart).toLocaleDateString()}</span>
                <span>Explore →</span>
              </div>
            </div>
          </Link>

          {rest.slice(0, 2).map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="flex flex-col justify-between bg-folder p-4 text-paper">
              <p className="text-[10px] uppercase opacity-80">{post.issueTags?.[0]?.name}</p>
              <h3 className="text-sm font-bold leading-tight">{post.title}</h3>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}