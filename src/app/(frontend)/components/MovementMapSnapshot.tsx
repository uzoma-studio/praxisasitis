import Link from 'next/link'

type IssueTag = { id: string; name: string; color?: string }
type Post = { title: string; issueTags?: { name: string }[]; media?: { url?: string }[] }

export function MovementMapSnapshot({ tags, highlight }: { tags: IssueTag[]; highlight?: Post }) {
  return (
    <section className="border-b border-ink px-6 py-12">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-wide">Movement Map</h2>

      <div className="relative h-80 overflow-hidden rounded-lg border border-ink bg-[#f2dede]">
        {highlight && (
          <div className="absolute left-4 top-4 w-56 rounded-md bg-accent p-3 text-paper shadow-lg">
            {highlight.media?.[0]?.url && (
              <div className="mb-2 h-24 w-full rounded bg-black/20" />
            )}
            <p className="text-[10px] uppercase opacity-80">{highlight.issueTags?.[0]?.name}</p>
            <h3 className="text-xs font-bold leading-tight">{highlight.title}</h3>
            <span className="mt-2 block text-[10px] uppercase underline">Explore →</span>
          </div>
        )}
        {/* Real Leaflet/OSM map replaces this block in the /map build */}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-full border border-ink px-3 py-1 text-[10px] font-semibold uppercase">All</button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="rounded-full border border-ink px-3 py-1 text-[10px] font-semibold uppercase"
            style={{ borderColor: tag.color }}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <Link href="/map" className="mt-6 inline-block text-xs font-semibold uppercase underline">
        Open full map →
      </Link>
    </section>
  )
}