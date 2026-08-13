import { Fragment } from 'react'
import { InteractiveHeroImage } from './InteractiveHeroImage'

export function Hero({
  tagline,
  introText,
  illustrationUrl,
}: {
  tagline?: string
  introText?: string
  illustrationUrl?: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-ink px-6 py-16 md:py-24">
      <div className="max-w-xl">
        <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
          {(tagline ?? '').split('\n').map((line, i) => (
            <Fragment key={i}>
              {line}
              <br />
            </Fragment>
          ))}
        </h1>
        {introText && <p className="mt-6 max-w-md text-sm leading-relaxed">{introText}</p>}
        {/* ... */}
      </div>
      {illustrationUrl && (
        <div className="pointer-events-none absolute -right-10 top-8 hidden w-[420px] md:block">
          <InteractiveHeroImage src={illustrationUrl} alt="" />
        </div>
      )}
    </section>
  )
}
