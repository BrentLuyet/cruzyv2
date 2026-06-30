# Cruzy Website + Cruzy+ Portal

This repository contains **two separate pieces**:

| Folder | What it is | Tech |
|--------|------------|------|
| [`cruzy-site/`](cruzy-site/) | The public **marketing website** (home, ships, plans, explore, contact, join, etc.) | Static HTML / CSS / JS |
| [`cruzy-nextjs/`](cruzy-nextjs/) | The **Cruzy+ member portal** (login, account, password reset, payments, rewards, authorized users) | Next.js 14 · React 18 · TypeScript · Tailwind |

> The marketing site and the portal are independent. The marketing site can be hosted/edited on a CMS (e.g. WordPress) while the portal runs as its own Next.js app, with a "Login" link connecting the two.

---

## `cruzy-site/` — Marketing site

Plain static files. Open `cruzy-site/index.html` in a browser, or serve the folder with any static web server. No build step.

---

## `cruzy-nextjs/` — Cruzy+ Portal

A Next.js app. It connects to **Salesforce** (member data), **Authorize.net** (payments), and sends email via SMTP.

### Requirements
- Node.js 18+ (Next.js 14)
- npm

### Setup
```bash
cd cruzy-nextjs
npm install
cp .env.example .env.local   # then fill in real values (see below)
npm run dev                  # http://localhost:3000
```

### Build / run for production
```bash
npm run build
npm run start
```

### Environment variables
Secrets are **not** committed to this repo. Create `cruzy-nextjs/.env.local` from `.env.example` and fill in the real values (ask the project owner for these):

**Salesforce** (OAuth client-credentials — see `cruzy-nextjs/SALESFORCE_AUTH.md`)
- `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_INSTANCE_URL`
- `SF_ACCESS_TOKEN` — optional, local-dev only (static CLI token)

**Authorize.net (payments)**
- `AUTHNET_API_LOGIN_ID`, `AUTHNET_TRANSACTION_KEY` (server-side)
- `NEXT_PUBLIC_AUTHNET_API_LOGIN_ID`, `NEXT_PUBLIC_AUTHNET_CLIENT_KEY`, `NEXT_PUBLIC_AUTHNET_ENV` (client-side)

**Auth & app**
- `JWT_SECRET` — secret used to sign login tokens
- `NEXT_PUBLIC_BASE_URL` — the portal's public URL (e.g. `https://portal.cruzy.com`)
- `NEXT_PUBLIC_MEMBERSHIP_PRICE` — membership price shown at checkout

> ⚠️ Never commit `.env.local`. It is git-ignored on purpose.

---

## Tracking / analytics
The marketing site already includes Google tracking (`gtag`). To track the **full funnel** (marketing site → portal signup/payment), install the same analytics/GTM container on the portal too, enable cross-domain tracking, and fire conversion events on signup and successful payment.
