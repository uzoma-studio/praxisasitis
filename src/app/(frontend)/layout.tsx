// layout.tsx
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import localFont from 'next/font/local'
import './styles.css'

const courierPrime = localFont({
  src: [
    { path: '../../../public/fonts/SpaceMono-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/SpaceMono-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

const helveticaNeue = localFont({
  src: [{ path: '../../../public/fonts/HelveticaNeueRoman.otf', weight: '400', style: 'normal' }],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: 'Praxis As It Is',
  description: 'A living record of grassroots organising in Nigeria.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <html lang="en" className={`${courierPrime.variable} ${helveticaNeue.variable} bg-paper-dark`}>
      <body className="flex min-h-screen flex-col bg-paper font-display text-ink antialiased">
        <Header
          nav={settings.nav ?? []}
          siteName={settings.siteName ?? ''}
          logoUrl={
            typeof settings.logo === 'object' ? (settings.logo?.url ?? undefined) : undefined
          }
          socialLinks={settings.socialLinks ?? []}
        />
        <main className="flex-1">{children}</main>
        <Footer
          siteName={settings.siteName ?? ''}
          logoUrl={
            typeof settings.logo === 'object' ? (settings.logo?.url ?? undefined) : undefined
          }
          socialLinks={settings.socialLinks ?? []}
        />
      </body>
    </html>
  )
}
