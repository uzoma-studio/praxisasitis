import type { ReactNode } from 'react'
import type { AboutData, QuoteExplainBlock } from '../about/about-content'
import { ScrollFillText } from './ScrollFillText'
import { CollapsibleSections } from '../components/CollapsibleSections'

// Local helper, not exported — used for the two quote+explanation sections
// (openingQuote, problemClosingQuote) that share the same layout.
function QuoteExplainSection({ block }: { block: QuoteExplainBlock }) {
  return (
    <section className=" px-6 pt-16 pb-20">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
        <div className="border-l-2 border-ink pl-6 pr-10 lg:pr-26">
          <blockquote className="text-lg font-bold leading-snug">
            &ldquo;{block.quote.text}&rdquo;
          </blockquote>
          <cite className="mt-3 block text-sm font-bold not-italic">{block.quote.attribution}</cite>
        </div>
        <ScrollFillText
          paragraphs={block.explanation}
          className="text-lg lg:pr-10 leading-relaxed"
        />
      </div>
    </section>
  )
}

// Local helper, not exported — the bordered two-column panel used for the
// "Problem" (green) and "Who We Are" (red) sections. The white column holds
// title/body/quote copy; the colored column holds only the structured
// content (question list, or the editor/institution/funded table).
function TwoColumnPanel({
  panelColor,
  left,
  right,
}: {
  panelColor: 'red' | 'green'
  left: ReactNode
  right: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 border border-ink md:grid-cols-2">
      <div className="border-b bg-white border-ink p-10 md:border-b-0 md:border-r">{left}</div>
      <div className={`p-8 text-white ${panelColor === 'red' ? 'bg-accent' : 'bg-praxisgreen'}`}>
        {right}
      </div>
    </div>
  )
}

// Local helper, replaces the RichText renderer — takes a plain array of
// paragraph strings instead of Lexical JSON.
function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={i > 0 ? 'mt-4' : undefined}>
          {p}
        </p>
      ))}
    </>
  )
}

export function About({ data }: { data: AboutData }) {
  const {
    heading,
    introText,
    bodyText,
    openingQuote,
    problemSection,
    problemClosingQuote,
    whoWeAre,
    closingBanner,
  } = data
  const whoWeAreRows: [string, string | undefined][] = [
    ['Editor', whoWeAre.editor],
    ['Institution', whoWeAre.institution],
    ['Funded by', whoWeAre.fundedBy],
  ]

  return (
    <>
      <section className=" px-6 py-20">
        <h1 className="font-mono lg:text-9xl text-5xl pt-62 font-black lg:pr-86 leading-[0.9]">
          {heading.split(' ')[0]}
          <br />
          {heading.split(' ').slice(1).join(' ')}
        </h1>
        <p className="mt-16 max-w-2xl text-lg font-bold">{introText}</p>
        <ScrollFillText
          paragraphs={bodyText}
          className="mt-16 max-w-4xl lg:text-2xl text-lg font-bold leading-relaxed"
        />
      </section>

      <QuoteExplainSection block={openingQuote} />

      <section className="border-t px-6 pb-12 pt-20">
        <TwoColumnPanel
          panelColor="green"
          left={
            <>
              <h2 className="mb-4 pt-2 text-center font-bold font-mono text-base ">
                {problemSection.title}
              </h2>
              <div className="text-sm py-2 leading-relaxed">
                <Paragraphs paragraphs={problemSection.introText} />
              </div>
              <blockquote className="mt-6 border-l-2 border-ink pl-4 text-sm font-bold leading-snug">
                &ldquo;{problemSection.quote.text}&rdquo;
              </blockquote>
              <cite className="mt-2 block pl-4 text-xs font-bold not-italic">
                — {problemSection.quote.attribution}
              </cite>
              <div className="mt-6 pb-4 text-sm leading-relaxed">
                <Paragraphs paragraphs={problemSection.afterText} />
              </div>
            </>
          }
          right={
            <>
              <h3 className=" font-bold font-mono text-base ">{problemSection.panelTitle}</h3>
              <p className="mt-1 text-sm">{problemSection.panelSubtitle}</p>
              <dl className="mt-6 space-y-4">
                {problemSection.items.map((item, i) => (
                  <div key={i} className="border border-white p-4">
                    <dt className="flex items-baseline gap-3 font-mono text-sm font-bold">
                      <span className="shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span>{item.question}</span>
                    </dt>
                    <dd className="mt-1 pl-8 text-sm leading-tight opacity-90">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </>
          }
        />
      </section>

      <QuoteExplainSection block={problemClosingQuote} />

      <section className="px-6 py-12">
        <TwoColumnPanel
          panelColor="red"
          left={
            <>
              <h2 className="mb-6 text-center font-mono text-base font-bold">{whoWeAre.title}</h2>

              <div className="text-sm leading-relaxed">
                <Paragraphs paragraphs={whoWeAre.body} />
              </div>

              <div className="mt-6 border-l-2 border-ink pl-4">
                <blockquote className="text-sm font-bold leading-snug">
                  &ldquo;{whoWeAre.quote.text}&rdquo;
                </blockquote>
                <cite className="mt-1 block text-xs font-bold not-italic">
                  — {whoWeAre.quote.attribution}
                </cite>
              </div>

              <div className="mt-6 text-sm leading-relaxed">
                <Paragraphs paragraphs={whoWeAre.afterText} />
              </div>
            </>
          }
          right={
            <div className="flex h-full flex-col">
              <dl className="grid flex-1 grid-rows-3 border border-white text-xs">
                {whoWeAreRows
                  .filter(([, value]) => value)
                  .map(([label, value], index) => (
                    <div
                      key={label}
                      className={`grid grid-cols-1 gap-1 px-5 py-5 md:grid-cols-2 md:items-center md:gap-6 md:py-6 ${
                        index < whoWeAreRows.filter(([, item]) => item).length - 1
                          ? 'border-b border-white'
                          : ''
                      }`}
                    >
                      <dt>{label}</dt>
                      <dd className="text-left text-sm font-bold leading-none md:text-right">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>

              <p className="mt-4 text-xs">
                This website was created by{' '}
                <a
                  href="https://uzoma.studio/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline underline-offset-2"
                >
                  uzoma.studio ↗
                </a>
              </p>
            </div>
          }
        />
      </section>

      <CollapsibleSections items={data.collapsibleSections} />

      <section className="border-b border-ink px-6 py-16 text-center">
        <p className="font-mono lg:text-6xl text-2xl font-black uppercase tracking-wide">
          Tell No Lies, Claim <br />
          No Easy Victory
        </p>
      </section>
    </>
  )
}
