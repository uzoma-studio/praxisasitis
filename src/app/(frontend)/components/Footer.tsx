'use client'

import { motion } from 'motion/react'
import { SiX, SiInstagram, SiFacebook, SiTiktok, SiYoutube } from 'react-icons/si'
import type { IconType } from 'react-icons'

type SocialLink = { platform: string; url: string }

const socialIcon: Record<string, IconType> = {
  x: SiX,
  instagram: SiInstagram,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  youtube: SiYoutube,
}

export function Footer({
  siteName,
  logoUrl,
  socialLinks,
}: {
  siteName: string
  logoUrl?: string
  socialLinks?: SocialLink[]
}) {
  return (
    <footer className=" bg-paper-dark text-ink">
      {/* Top: logo, tagline, socials */}
      <div className="flex flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-4 text-center w-full md:flex-row md:items-center md:gap-8 md:text-left">
          <a href="/" className="flex items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                style={{ height: '40px', width: 'auto', maxHeight: '40px' }}
                className="object-contain"
              />
            ) : (
              <span className="font-display text-3xl font-bold uppercase leading-none">
                {siteName.split(' ').map((word, i) => (
                  <span key={i} className="block">
                    {word}
                  </span>
                ))}
              </span>
            )}
          </a>
          <div className="text-xs lg:py-0 py-4">
            <p className="opacity-70">
              A living record of grassroots <br></br> organising in Nigeria.
            </p>
            <p className="font-bold">Follow us today</p>
          </div>
        </div>

        {socialLinks && socialLinks.length > 0 && (
          <div className="flex gap-3">
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
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper"
                >
                  <Icon size={16} />
                </motion.a>
              )
            })}
          </div>
        )}
      </div>
      {/* Divider */}
      <div className="border-t border-ink" />

      {/* Bottom: nav + copyright */}
      <div className="flex flex-col items-center gap-4 px-6 py-8 text-[11px] font-bold uppercase tracking-wide md:flex-row md:justify-between md:gap-0">
        <a href="/about">About</a>
        <a href="/map">Map</a>
        <a href="/archives">Archive</a>
        <a href="/add-post">Add a Post</a>
        <p className="font-normal text-black normal-case ">
          © {new Date().getFullYear()} {siteName.replace(/\s+/g, '')}
        </p>
      </div>
    </footer>
  )
}
