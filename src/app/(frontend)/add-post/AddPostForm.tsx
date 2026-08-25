'use client'

import { FormEvent, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'motion/react'

// LocationPicker touches window/document via Leaflet at import time, so it
// can't be part of the server-rendered pass. AddPostForm is already a
// Client Component, so ssr:false is allowed to be called right here.
const LocationPicker = dynamic(() => import('./LocationPicker').then((m) => m.LocationPicker), {
  ssr: false,
  loading: () => <p className="text-xs opacity-60">Loading map…</p>,
})

type Tag = {
  id: string
  name: string
  color?: string | null
}

const scales = [
  { value: 'small', label: 'Small group (10 people or fewer)' },
  { value: 'neighbourhood', label: 'Neighbourhood' },
  { value: 'city-wide', label: 'City-wide' },
  { value: 'multi-city', label: 'Multi-city' },
]

export function AddPostForm({ tags }: { tags: Tag[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const locationDescriptionRef = useRef<HTMLInputElement>(null)

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Field-adjacent validation errors, plus a top-of-form banner for
  // async/server-side outcomes (upload failures, submission errors,
  // success confirmation) that aren't tied to one specific field.
  const [tagsError, setTagsError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [lat, setLat] = useState<number | undefined>(undefined)
  const [lng, setLng] = useState<number | undefined>(undefined)

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    )
  }

  function removeSelectedMedia() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setCoverPreview(null)
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude)
        setLng(coords.longitude)
        setLocationError(null)
      },
      () =>
        setLocationError(
          'We could not access your location. You can search or click the map instead.',
        ),
    )
  }

  // Plain map click — only updates coordinates, leaves the location
  // description field alone (matches the admin GeoPointField's behavior).
  function handleMapPick(pickedLat: number, pickedLng: number) {
    setLat(pickedLat)
    setLng(pickedLng)
    setLocationError(null)
  }

  // Search result selection — updates coordinates AND auto-fills the
  // location description, same as the admin's sibling-field behavior.
  function handleSelectSearchResult(result: { lat: number; lng: number; description: string }) {
    setLat(result.lat)
    setLng(result.lng)
    setLocationError(null)
    if (locationDescriptionRef.current) {
      locationDescriptionRef.current.value = result.description
    }
  }

  async function uploadFiles(files: File[]) {
    return Promise.all(
      files.map(async (file) => {
        const data = new FormData()

        data.append('file', file)

        data.append(
          '_payload',
          JSON.stringify({
            alt: file.name.replace(/\.[^/.]+$/, ''),
          }),
        )

        const response = await fetch('/api/media', {
          method: 'POST',
          body: data,
        })

        const result = await response.json()

        if (!response.ok) {
          console.error('Media upload failed:', result)
          throw new Error(
            result?.errors?.[0]?.message || result?.message || `Could not upload ${file.name}`,
          )
        }

        return result.doc.id as string
      }),
    )
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setFormError(null)
    setTagsError(null)
    setLocationError(null)
    setSuccessMessage(null)

    const form = new FormData(formElement)
    const files = Array.from(fileInputRef.current?.files ?? [])

    let hasError = false

    if (!selectedTagIds.length) {
      setTagsError('Please select at least one issue tag.')
      hasError = true
    }

    if (lat === undefined || lng === undefined) {
      setLocationError('Please search for a location or click the map to place a pin.')
      hasError = true
    }

    if (hasError) return

    setIsSubmitting(true)

    try {
      const mediaIds = await uploadFiles(files)

      const response = await fetch('/api/post-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: form.get('authorName'),
          authorContact: form.get('authorContact'),
          title: form.get('title'),
          dateStart: form.get('dateStart'),
          dateEnd: form.get('dateEnd') || undefined,
          locationDescription: form.get('locationDescription'),
          latitude: lat,
          longitude: lng,
          scale: form.get('scale'),
          issueTags: selectedTagIds,
          whatDidWeDo: form.get('whatDidWeDo'),
          whatDidWeLearn: form.get('whatDidWeLearn'),
          whatIsStillUnclear: form.get('whatIsStillUnclear'),
          request: form.get('request') || undefined,
          locationSensitive: form.get('locationSensitive') === 'on',
          media: mediaIds,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Your post could not be submitted.')
      }

      formElement.reset()
      setSelectedTagIds([])
      setCoverPreview(null)
      setLat(undefined)
      setLng(undefined)
      setSuccessMessage('Thank you. Your post has been sent for editorial review.')

      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-26 text-ink lg:px-0">
      <AnimatePresence>
        {(formError || successMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed left-1/2 top-6 z-[9999] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
            role={formError ? 'alert' : 'status'}
          >
            <div
              className={`flex items-start justify-between gap-6 border bg-paper px-5 py-4 shadow-lg ${
                formError ? 'border-red-700' : 'border-ink'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    formError ? 'bg-red-700 text-white' : 'bg-praxisgreen text-white'
                  }`}
                >
                  {formError ? '!' : '✓'}
                </span>

                <p className="text-sm leading-relaxed">{formError ?? successMessage}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError(null)
                  setSuccessMessage(null)
                }}
                className="shrink-0 font-mono text-xs opacity-50 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto max-w-5xl ">
        <header className="mb-12 border-b border-ink pb-8">
          <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest">
            Community archive
          </p>
          <h1 className="font-mono text-4xl font-black uppercase sm:text-6xl">Add a post</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed">
            Share an action, campaign, or experience. Posts are reviewed before they appear in the
            archive.
          </p>
        </header>

        <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {(formError || successMessage) && (
              <p
                className={`border p-4 text-sm ${
                  formError ? 'border-red-700 text-red-700' : 'border-ink'
                }`}
                role="status"
              >
                {formError ?? successMessage}
              </p>
            )}

            <Field label="Your name or pseudonym">
              <input name="authorName" required placeholder="Your name" className={inputClass} />
            </Field>

            <Field label="Private contact (optional)">
              <input
                name="authorContact"
                placeholder="Email or phone number — only visible to editors"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-8 sm:grid-cols-2">
              <Field label="Action date">
                <input name="dateStart" type="date" required className={inputClass} />
              </Field>

              <Field label="End date (if applicable)">
                <input name="dateEnd" type="date" className={inputClass} />
              </Field>
            </div>

            <Field label="Location">
              <input
                ref={locationDescriptionRef}
                name="locationDescription"
                required
                placeholder="e.g. Gwagwalada, Federal Capital Territory"
                className={inputClass}
              />
            </Field>

            <Field label="Search for a location or click the map">
              <div className="relative isolate">
                <LocationPicker
                  lat={lat}
                  lng={lng}
                  onPick={handleMapPick}
                  onSelectSearchResult={handleSelectSearchResult}
                />
              </div>
              {locationError && (
                <p className="mt-2 text-sm text-red-700" role="alert">
                  {locationError}
                </p>
              )}
            </Field>

            <button
              type="button"
              onClick={useMyLocation}
              className="border border-ink px-4 py-3 font-mono text-xs font-bold uppercase hover:bg-ink hover:text-paper"
            >
              ◎ Use my current location
            </button>

            <label className="flex cursor-pointer gap-3 text-sm">
              <input
                name="locationSensitive"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                Hide my precise location publicly. Editors can use the location privately during
                review.
              </span>
            </label>

            <Field label="Scale of action">
              <select name="scale" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Select scale
                </option>
                {scales.map((scale) => (
                  <option key={scale.value} value={scale.value}>
                    {scale.label}
                  </option>
                ))}
              </select>
            </Field>

            <fieldset>
              <legend className="mb-3 font-mono text-sm font-bold">Issue tags</legend>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      style={selected ? { backgroundColor: tag.color ?? '#008a42' } : undefined}
                      className={`flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm ${
                        selected ? 'text-white' : ''
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${selected ? 'bg-white' : ''}`}
                        style={!selected ? { backgroundColor: tag.color ?? '#008a42' } : undefined}
                      />
                      {tag.name}
                    </button>
                  )
                })}
              </div>
              {tagsError && (
                <p className="mt-2 text-sm text-red-700" role="alert">
                  {tagsError}
                </p>
              )}
            </fieldset>

            <Field label="Title">
              <input
                name="title"
                required
                placeholder="Give this case a clear title"
                className={inputClass}
              />
            </Field>

            <StoryField
              name="whatDidWeDo"
              label="What did we do?"
              hint="Tell the story of the action. A minimum of 300 words is required."
              required
            />

            <StoryField
              name="whatDidWeLearn"
              label="What did we learn?"
              hint="What should others know from this experience?"
              required
            />

            <StoryField
              name="whatIsStillUnclear"
              label="What is still unclear?"
              hint="Name open questions, risks, or things you are still working out."
              required
            />

            <StoryField
              name="request"
              label="Request (optional)"
              hint="For example: We need a lawyer, documentation, funding, or solidarity."
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-ink px-6 py-5 font-mono text-sm font-bold uppercase text-paper transition-colors hover:bg-praxisgreen disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit for review →'}
            </button>
          </div>

          {/* On mobile this grid is a single column, so items stack by DOM
              order — order-first moves the image upload block above the
              fields (and the submit button, which lives at the end of the
              fields div) on small screens. lg:order-none reverts to normal
              source order once the two-column desktop grid kicks in, so
              desktop is unaffected. */}
          <aside className="order-first lg:order-none lg:pt-3">
            <div>
              <div className="relative">
                <label className="block cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,audio/*,video/*"
                    className="sr-only"
                    onChange={(event) => {
                      const firstImage = Array.from(event.target.files ?? []).find((file) =>
                        file.type.startsWith('image/'),
                      )

                      setCoverPreview(firstImage ? URL.createObjectURL(firstImage) : null)
                    }}
                  />

                  <div className="flex aspect-square items-center justify-center overflow-hidden border border-dashed border-ink/60">
                    {coverPreview ? (
                      <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl font-light">+</span>
                    )}
                  </div>
                </label>

                {coverPreview && (
                  <button
                    type="button"
                    onClick={removeSelectedMedia}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-ink text-paper transition-opacity hover:opacity-80"
                    aria-label="Remove selected media"
                  >
                    ×
                  </button>
                )}
              </div>

              <p className="mt-3 font-mono text-xs font-bold">Add cover image or media</p>
            </div>
          </aside>
        </form>
      </div>

      <section className="border-t border-ink px-6 mt-16 pt-16 text-center">
        <p className="font-mono lg:text-6xl text-2xl font-black uppercase tracking-wide">
          Tell No Lies, Claim <br />
          No Easy Victory
        </p>
      </section>
    </main>
  )
}

const inputClass =
  'w-full border border-ink bg-transparent px-5 py-4 font-mono text-sm outline-none placeholder:text-ink/45 focus:ring-1 focus:ring-ink'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 block font-mono text-sm font-bold">{label}</span>
      {children}
    </label>
  )
}

function StoryField({
  name,
  label,
  hint,
  required = false,
}: {
  name: string
  label: string
  hint: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="font-mono text-sm font-bold">{label}</span>
      <span className="mb-3 mt-1 block text-xs opacity-70">{hint}</span>
      <textarea
        name={name}
        required={required}
        rows={10}
        className={`${inputClass} resize-y leading-relaxed`}
      />
    </label>
  )
}
