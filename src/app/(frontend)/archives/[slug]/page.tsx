import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { richTextToPlainText } from '@/lib/richText'
import { HoverText } from '../../components/HoverText'

type Props = {
  params: Promise<{ slug: string }>
}

function mediaKind(mimeType?: string | null) {
  const type = mimeType ?? ''
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type === 'application/pdf') return 'pdf'
  return 'other'
}

function formatSize(bytes?: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// One tile in the media gallery. Video and audio play inline; PDFs (and
// anything else) open in a new tab.
function GalleryItem({ item, postTitle }: { item: any; postTitle: string }) {
  const kind = mediaKind(item.mimeType)
  const label = item.alt || item.filename || 'Untitled'

  if (kind === 'image') {
    return (
      <img
        src={item.url}
        alt={item.alt ?? `${postTitle} documentation`}
        className="aspect-[4/3] w-full object-cover"
      />
    )
  }

  if (kind === 'video') {
    return (
      <div className="sm:col-span-2">
        <video controls preload="metadata" playsInline className="aspect-video w-full bg-black">
          <source src={item.url} type={item.mimeType} />
          <a href={item.url}>Download the video</a>
        </video>
      </div>
    )
  }

  if (kind === 'audio') {
    return (
      <div className="border border-white/20 p-5 sm:col-span-2">
        <p className="font-mono text-xs font-bold uppercase tracking-wide text-white/60">Audio</p>
        <p className="mb-4 mt-2 truncate font-mono text-sm font-bold">{label}</p>
        <audio controls preload="none" className="w-full">
          <source src={item.url} type={item.mimeType} />
        </audio>
      </div>
    )
  }

  const size = formatSize(item.filesize)

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 border border-white/20 p-5 transition-colors hover:bg-white/10"
    >
      <span className="min-w-0">
        <span className="block font-mono text-xs font-bold uppercase tracking-wide text-white/60">
          {kind === 'pdf' ? 'PDF' : 'File'}
          {size ? ` · ${size}` : ''}
        </span>
        <span className="mt-2 block truncate font-mono text-sm font-bold">{label}</span>
      </span>
      <span className="shrink-0 font-mono text-xs font-bold uppercase group-hover:underline">
        Open ↗
      </span>
    </a>
  )
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  const post = result.docs[0]

  if (!post) notFound()

  const tags = (post.issueTags ?? []).filter(
    (tag): tag is any => typeof tag === 'object' && tag !== null,
  )

  const media = (post.media ?? []).filter(
    (item): item is any => typeof item === 'object' && item !== null && Boolean(item.url),
  )

  const coverField = typeof post.coverImage === 'object' ? post.coverImage : null

  // Older posts have no cover field: their first gallery image was the cover,
  // so keep using it and leave it out of the gallery so it isn't shown twice.
  const fallbackCover = coverField
    ? null
    : media.find((item) => item.mimeType?.startsWith('image/'))

  const coverImage = coverField ?? fallbackCover ?? null

  const galleryItems = media.filter((item) => item.id !== fallbackCover?.id)

  const sections = [
    {
      label: 'File 01',
      title: 'What did we do?',
      content: richTextToPlainText(post.whatDidWeDo),
    },
    {
      label: 'File 02',
      title: 'What did we learn?',
      content: richTextToPlainText(post.whatDidWeLearn),
    },
    {
      label: 'File 03',
      title: 'What is still unclear?',
      content: richTextToPlainText(post.whatIsStillUnclear),
    },
  ]

  const actionDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.dateStart))

  return (
    <main className="min-h-screen overflow-hidden bg-[#181818] pb-24 pt-30 text-[#f5f1e8]">
      <section className="border-b border-white/15 px-6 py-16 lg:px-[4.4vw] lg:py-10">
        <div className="mx-auto max-w-[1800px]">
          <HoverText
            as="h1"
            text={post.title}
            className="max-w-5xl font-mono text-5xl font-black leading-[0.82] tracking-[-0.07em] sm:text-4xl lg:text-5xl"
          />
        </div>
      </section>

      <section className="px-6 pt-12 lg:pr-[8vw] lg:pl-[4vw] lg:pt-10">
        <div className="relative mx-auto max-w-[1400px] lg:mr-[6vw]">
          {/* Coloured folder tabs */}
          {tags.length > 0 && (
            <div className="absolute right-0 top-12 z-0 hidden translate-x-full flex-col items-end lg:flex">
              {tags.slice(0, 3).map((tag, index) => (
                <div
                  key={tag.id}
                  style={{
                    backgroundColor: tag.color ?? ['#008a42', '#662383', '#f4d900'][index % 3],
                  }}
                  className="mb-2 flex h-44 w-12 items-center justify-center rounded-r-[2rem] px-3 text-sm font-bold text-white [writing-mode:vertical-rl]"
                >
                  {tag.name}
                </div>
              ))}
            </div>
          )}

          <article className="relative z-10 overflow-hidden rounded-b-[1.5rem] bg-[#f4f0e5] text-[#151515] shadow-2xl">
            <div className="grid min-h-[580px] grid-cols-1 md:grid-cols-[92px_minmax(0,1fr)] rounded">
              {/* Binder spine */}
              <aside className="relative hidden border-r border-black/20 md:block">
                <span className="absolute left-1/2 top-[16%] h-6 w-6 -translate-x-1/2 rounded-full bg-[#181818]" />
                <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#181818]" />
                <span className="absolute bottom-[16%] left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#181818]" />
              </aside>

              <div className="grid lg:grid-cols-[30%_minmax(0,1fr)]">
                <figure
                  className={
                    coverImage
                      ? 'min-h-[320px] border-b border-black/20 lg:min-h-full lg:border-b-0 lg:border-r'
                      : 'm-8 hidden aspect-[3/4] self-start border border-dashed border-black/40 p-4 lg:block'
                  }
                >
                  {coverImage ? (
                    <img
                      src={coverImage.url}
                      alt={coverImage.alt ?? `${post.title} documentation`}
                      className="h-full w-full object-cover grayscale"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center">
                      <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/40"></p>
                    </div>
                  )}
                </figure>

                <div className="flex flex-col p-8 sm:p-12 lg:p-16">
                  <dl className="mb-12 grid grid-cols-2 gap-x-10 gap-y-6 border-b border-black/20 pb-8 text-xs uppercase sm:grid-cols-3">
                    <div>
                      <dd className="font-bold">{post.locationDescription}</dd>
                    </div>
                    <div>
                      <dd className="font-bold">{actionDate}</dd>
                    </div>
                    <div>
                      <dd className="font-bold">{post.authorName}</dd>
                    </div>
                  </dl>

                  <div className="max-w-3xl">
                    <p className=" leading-relaxed sm:text-lg lg:text-lg">{sections[0].content}</p>
                  </div>

                  <p className="mt-auto pt-12 font-mono text-xs font-bold uppercase tracking-wide">
                    {tags.map((tag) => tag.name).join(' / ')}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[1200px] px-6 lg:mt-20">
        {sections.slice(1).map((section) => (
          <article
            key={section.label}
            className="grid gap-8 border-t border-white/20 py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-20"
          >
            <div>
              <p className="font-mono text-sm font-bold text-white/60">{section.label}</p>
              <h2 className="mt-2 font-mono text-xl font-bold">{section.title}</h2>
            </div>

            <p className="max-w-3xl whitespace-pre-line leading-tight text-whites text-xl">
              {section.content}
            </p>
          </article>
        ))}

        {galleryItems.length > 0 && (
          <article className="grid gap-8 border-t border-white/20 py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-20">
            <div>
              <p className="font-mono text-sm font-bold text-white/60">Media</p>
              <h2 className="mt-2 font-mono text-xl font-bold">Gallery</h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              {galleryItems.map((item) => (
                <GalleryItem key={item.id} item={item} postTitle={post.title} />
              ))}
            </div>
          </article>
        )}

        {post.request && (
          <aside className="mt-10 border border-white bg-praxisgreen p-8 lg:mt-12 lg:p-12 rounded">
            <p className="font-mono text-sm font-bold uppercase">Request</p>
            <p className="mt-5 max-w-3xl text-white whitespace-pre-line text-xl leading-tight">
              {richTextToPlainText(post.request)}
            </p>
          </aside>
        )}
      </section>
    </main>
  )
}
