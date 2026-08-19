'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HiMenu, HiX } from 'react-icons/hi'
import { SiX, SiInstagram, SiFacebook, SiTiktok, SiYoutube } from 'react-icons/si'
import type { IconType } from 'react-icons'

type NavItem = { label: string; href: string }
type SocialLink = { platform: string; url: string }

const socialIcon: Record<string, IconType> = {
  x: SiX,
  instagram: SiInstagram,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  youtube: SiYoutube,
}

// Guards against a nav href stored without a leading slash — without this,
// a value like "map" resolves *relative to the current page*, so it opens
// correctly from "/" but breaks into "/archives/map" from a page like
// "/archives/[slug]". See SiteSettings' field-level validation for the
// data-side half of this fix.
const normalizeHref = (href: string) => (href.startsWith('/') ? href : `/${href}`)

const menuVariants: any = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    clipPath: 'inset(0 0 100% 0)',
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  },
}

const listVariants: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

// Match on label so it works regardless of href
const isAddPost = (item: NavItem) => item.label.toLowerCase() === 'add a post'

export function Header({
  nav,
  siteName,
  logoUrl,
  socialLinks,
}: {
  nav: NavItem[]
  siteName: string
  logoUrl?: string
  socialLinks?: SocialLink[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 grid grid-cols-3 items-center border-b border-ink bg-paper md:grid-cols-[1fr_8fr_1fr]">
      {/* Left: logo — bordered on desktop, plain on mobile */}
      <a href="/" className="flex h-full items-center px-6 py-4 md:border-r md:border-ink">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            style={{ height: '40px', width: 'auto', maxHeight: '40px' }}
            className="object-contain"
          />
        ) : (
          <span className="text-sm font-bold uppercase leading-tight">
            {siteName.split(' ').map((word, i) => (
              <span key={i} className="block">
                {word}
              </span>
            ))}
          </span>
        )}
      </a>

      {/* Center: desktop nav only — bordered both sides, wider column */}
      <nav className="hidden h-full items-center justify-center gap-8 border-r border-ink font-display text-xs font-bold uppercase tracking-wide text-ink md:flex">
        {nav.map((item) =>
          isAddPost(item) ? (
            <a
              key={item.href}
              href={normalizeHref(item.href)}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-paper transition-opacity hover:opacity-80"
            >
              <span className="text-sm leading-none">+</span>
              {item.label}
            </a>
          ) : (
            <a key={item.href} href={normalizeHref(item.href)}>
              {item.label}
            </a>
          ),
        )}
      </nav>

      {/* Mobile hamburger — sits in the center column on mobile */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="col-start-3 flex h-11 w-11 mx-4 items-center justify-center justify-self-end rounded-xl bg-ink text-paper md:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'menu'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <HiX size={20} /> : <HiMenu size={20} />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Right: social icons — desktop only, hidden on mobile (moved into the panel) */}
      <div className="hidden h-full items-center justify-end gap-3 px-6 py-4 md:flex">
        {socialLinks?.map((social) => {
          const Icon = socialIcon[social.platform]
          if (!Icon) return null
          return (
            <motion.a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper"
            >
              <Icon size={14} />
            </motion.a>
          )
        })}
      </div>

      {/* Mobile menu panel — full-page takeover below the header */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-0 top-[72px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto bg-paper md:hidden"
          >
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-1 flex-col justify-center gap-1 px-6"
            >
              {nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={normalizeHref(item.href)}
                  variants={itemVariants}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-3 border-b border-ink/10 py-4 font-display text-4xl font-bold uppercase tracking-tight text-ink transition-colors active:text-ink/60"
                >
                  <span className="text-sm font-normal tabular-nums text-ink/40">
                    {isAddPost(item) ? '+' : String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </motion.a>
              ))}
            </motion.div>

            {socialLinks && socialLinks.length > 0 && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex gap-3 border-t border-ink px-6 py-6"
              >
                {socialLinks.map((social) => {
                  const Icon = socialIcon[social.platform]
                  if (!Icon) return null
                  return (
                    <motion.a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper"
                    >
                      <Icon size={16} />
                    </motion.a>
                  )
                })}
              </motion.div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
