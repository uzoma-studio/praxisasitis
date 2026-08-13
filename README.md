# Praxis As It Is

A living record of grassroots organising in Nigeria.

Built with [Next.js](https://nextjs.org) and [Payload CMS](https://payloadcms.com).

## Tech stack

- **Framework**: Next.js (App Router)
- **CMS**: Payload CMS
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Animation**: Motion (Framer Motion)

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your `MONGODB_URL` and any other required values (Payload secret, S3/media storage credentials, etc.).

### 3. Run the dev server

```bash
pnpm dev
```

Open `http://localhost:3000` for the site, and `http://localhost:3000/admin` for the Payload admin panel. Follow the on-screen instructions to create your first admin user.

## Project structure

- `src/app/(frontend)` — public-facing site (Header, Footer, Hero, post listings, etc.)
- `src/app/(payload)` or `src/collections` — Payload config, collections, and globals *(adjust to match your actual structure)*

### Collections

- **Posts** 
- **Issue Tags** 
- **FAQ**
- **Site Settings** (global) — logo, nav, social links, tagline, etc.

