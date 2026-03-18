# KidsClaw

Educational AI-powered games for kids aged 9-11. Parents sign up, launch a private game server, and kids scan a QR code to start playing — no app install, no login for kids.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) on Vercel |
| Database | Vercel Postgres (Neon) + Drizzle ORM |
| Auth | NextAuth.js v5 with Email (magic link) |
| Email | Resend |
| Background jobs | Inngest (durable step functions) |
| Real-time progress | Server-Sent Events (SSE) |
| VPS provisioning | Hetzner Cloud API |
| SMS | Twilio (optional) |
| CSS | Tailwind CSS |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local` — see `.env.example` for all required keys.

### 3. Set up the database

```bash
npx drizzle-kit push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (auth)/signin/              # Magic link sign-in page
    (parent)/dashboard/         # Parent dashboard
    (parent)/dashboard/provisioning/  # Provisioning progress UI
    (parent)/settings/          # Account settings + danger zone
    play/[token]/               # Kid play page (game selector + WebChat)
    api/
      auth/[...nextauth]/       # NextAuth catch-all
      inngest/                  # Inngest webhook
      instances/                # Provision, status, progress (SSE), retry, delete
      kids/                     # CRUD, regenerate-token, send-link (SMS)
      webhook/provision/        # Cloud-init progress callbacks
  components/
    parent/                     # InstanceCard, KidList, AddKidModal, ProvisioningProgress, QRCode
    kid/                        # GameSelector, WebChat, ChatBubble
  lib/
    auth/config.ts              # NextAuth v5 configuration
    db/schema.ts                # Drizzle schema (families, instances, kids, provision_events)
    db/index.ts                 # Lazy DB connection
    hetzner/client.ts           # Hetzner API (create/delete/get servers)
    hetzner/cloud-init.ts       # Cloud-init script builder
    provisioning/inngest.ts     # Inngest client
    provisioning/steps.ts       # Durable provisioning workflow
    crypto.ts                   # AES-256-GCM encrypt/decrypt
    tokens.ts                   # nanoid kid tokens + play URL builder
  middleware.ts                 # CSP headers for /play/*, rate limit headers for /api/*
```

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Authentication |
| `/api/inngest` | GET/POST/PUT | Inngest webhook |
| `/api/instances/provision` | POST | Start VPS provisioning |
| `/api/instances/status` | GET | Current instance status |
| `/api/instances/progress` | GET | SSE stream of provision events |
| `/api/instances/retry` | POST | Retry failed provisioning |
| `/api/instances` | DELETE | Tear down VPS |
| `/api/webhook/provision` | POST | Cloud-init progress callbacks |
| `/api/kids` | GET/POST | List / add kids |
| `/api/kids/[id]` | PATCH/DELETE | Update / deactivate kid |
| `/api/kids/[id]/regenerate-token` | POST | Generate new play link |
| `/api/kids/[id]/send-link` | POST | Send play link via SMS |

## Onboarding Flow

1. **Parent signs up** — enters email, receives magic link, lands on dashboard
2. **Launch KidsClaw** — clicks button, Inngest provisions a Hetzner VPS (~2 min), real-time progress via SSE
3. **Add kids** — enters kid name/phone, gets QR code + copy link + optional SMS
4. **Kid plays** — opens link on phone/tablet, picks a game, chats with AI game host

## Deployment

Deploy to Vercel and configure:

1. **Vercel Postgres** — connect a Neon database
2. **Environment variables** — all keys from `.env.example`
3. **Inngest** — connect via Vercel integration
4. **DNS** — wildcard `*.play.kidsclaw.club` pointing to VPS IPs (Cloudflare)
5. Run `npx drizzle-kit push` against production DB

## Database Schema

- **families** — id, userId, name
- **instances** — id, familyId, hetznerServerId, ipv4, status, provisionStep, provisionError, gatewayToken (encrypted), provisionSecret (encrypted), subdomain
- **kids** — id, familyId, name, token (22-char nanoid), phone, avatarSeed, active
- **provision_events** — id (serial), instanceId, step, message (append-only log)

## TODOS
- [ ] Test in Vercel preview environment
- [ ] Setup Resend API
- [ ] Setup Twilio API
