// app/api/post-submissions/route.ts
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

import config from '@/payload.config'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    authorName,
    authorContact,
    title,
    dateStart,
    dateEnd,
    locationDescription,
    latitude,
    longitude,
    scale,
    issueTags,
    whatDidWeDo,
    whatDidWeLearn,
    whatIsStillUnclear,
    request: requestText,
    locationSensitive,
    media,
  } = body

  if (
    !authorName ||
    !title ||
    !dateStart ||
    !locationDescription ||
    latitude == null ||
    longitude == null ||
    !scale ||
    !issueTags?.length ||
    !whatDidWeDo ||
    !whatDidWeLearn ||
    !whatIsStillUnclear
  ) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Builds the exact editor schema (nodes/marks) your lexicalEditor()
  // config supports, so the converted JSON always matches what the
  // richText fields validate against — no hand-rolled node shape to
  // keep in sync with the package version.
  const editorConfig = await editorConfigFactory.default({ config: payloadConfig })

  const toLexical = (text: string) => convertMarkdownToLexical({ editorConfig, markdown: text })

  try {
    const post = await payload.create({
      collection: 'posts',
      data: {
        authorName,
        authorContact,
        title,
        dateStart,
        dateEnd: dateEnd || undefined,
        locationDescription,
        // Payload's `point` field stores GeoJSON order: [longitude, latitude]
        coordinates: [longitude, latitude],
        scale,
        issueTags,
        whatDidWeDo: toLexical(whatDidWeDo),
        whatDidWeLearn: toLexical(whatDidWeLearn),
        whatIsStillUnclear: toLexical(whatIsStillUnclear),
        request: requestText ? toLexical(requestText) : undefined,
        locationSensitive: Boolean(locationSensitive),
        media,
        status: 'pending-review',
      },
    })

    return NextResponse.json({ doc: post }, { status: 201 })
  } catch (error: any) {
    console.error('post-submissions error:', error)
    // Payload's ValidationError puts the generic summary in error.message,
    // but the actual per-field reason lives in error.data.errors.
    const detail = error?.data?.errors
      ?.map((e: any) => `${e.path ?? e.field}: ${e.message}`)
      .join('; ')
    const message =
      detail || (error instanceof Error ? error.message : 'Your post could not be submitted.')

    return NextResponse.json({ message }, { status: 400 })
  }
}
