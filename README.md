# PJR Farm & Agro Products

**"Nourishing Nature, Enriching Lives."**

A complete, production-structured e-commerce platform for PJR Farm & Agro Products — an integrated farming enterprise (crop cultivation, dairy farming, fresh vegetables, pisciculture, poultry farming, and livestock rearing) established in 2017. The platform includes a full customer storefront and a separate, role-protected admin dashboard.

**Live deployment:** [https://pjr-farm-agro.vercel.app](https://pjr-farm-agro.vercel.app) (Vercel, backed by a Neon Postgres database).

> **Note on stack:** this project uses **Next.js + Prisma/PostgreSQL** (not MongoDB) and ships as a single unified codebase rather than separate frontend/backend services — the sections below are organized to answer the same questions (how to run the UI, how the API layer works, how the database is configured) for that architecture.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Frontend Setup](#frontend-setup)
- [Backend / API Setup](#backend--api-setup)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Development Commands](#development-commands)
- [Production Build & Start](#production-build--start)
- [Deployment](#deployment)
- [Demo Accounts](#demo-accounts)
- [Security Notes](#security-notes)
- [Known Simplifications](#known-simplifications)

## Project Overview

PJR Farm & Agro Products sells fresh, farm-produced goods (eggs, milk, paneer, vegetables, fish, chicken, mutton, rice, etc.) directly from an integrated farm to families. This repository contains:

- **Customer website** — browsing, search/filter/sort, cart, multi-step checkout, order tracking, wishlist, reviews, and a full account dashboard.
- **Admin dashboard** (`/admin`) — products, categories, orders, customers, inventory, coupons, reviews, banners, homepage content, farm sections, contact messages, notifications, analytics/reports with CSV export, and site settings — completely separate from the customer navigation and protected by role-based access control.

## Features

- Public storefront: home, about, our-farming, contact, category/product browsing with filters, cart, checkout, order confirmation.
- Authentication: registration, login, forgot/reset password, change password — passwords hashed with bcrypt, sessions via signed JWT.
- Customer dashboard: order history & tracking, wishlist, saved addresses, profile.
- Admin dashboard: full CRUD over the catalog and content, order lifecycle management with status history, coupon engine, inventory with low-stock alerts, analytics charts, CSV export, and editable site settings (no code changes needed to update contact info, delivery charges, tax, etc.).
- Toast-based UX (no browser `alert()`), skeleton loaders, empty states, responsive layouts (mobile drawer nav/filters, responsive admin tables).

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) — serves both the UI and the API |
| Database / ORM | PostgreSQL (Neon in production) + Prisma ORM |
| Authentication | NextAuth.js (Credentials provider, JWT sessions) + bcryptjs |
| Styling | Tailwind CSS (custom PJR brand theme) |
| Validation | Zod (shared client + server schemas) |
| Charts | Recharts |
| Notifications (UI) | react-hot-toast |
| Icons | lucide-react |

## Project Structure

```
app/(site)/            Customer-facing pages (home, products, cart, checkout, account/*, etc.)
app/admin/              Admin login + protected dashboard ((dashboard) route group)
app/api/                API routes: public, /api/account/** (signed-in users), /api/admin/** (admin only)
components/site/        Customer-facing UI components
components/admin/       Admin dashboard UI components
components/ui/          Shared primitives (Modal, ConfirmDialog, Pagination, EmptyState, Skeletons)
components/providers/   Cart/Wishlist client contexts, NextAuth SessionProvider, Toaster
lib/                    Prisma client, auth config, validation schemas, business logic helpers
prisma/                 schema.prisma, migrations/, seed.ts
public/brand/           Logo files
public/farm/            Farm photography used across the site
public/placeholders/    Designed category-tile SVGs for products without real photography
public/uploads/         Runtime admin uploads (gitignored)
middleware.ts           Route protection for /account/**, /admin/**, /api/admin/**
```

## Installation

Prerequisites: **Node.js 18.18+** (Node 20+ recommended) and **npm**.

```bash
git clone https://github.com/ashritha-d/PJR.git
cd PJR
npm install
cp .env.example .env
# edit .env — set DATABASE_URL to a Postgres connection string and NEXTAUTH_SECRET
# (see Database Configuration and Environment Variables below)
npm run db:migrate
npm run db:seed
npm run dev
```

The app is now running at [http://localhost:3000](http://localhost:3000).

You need a Postgres database even for local development (see [Database Configuration](#database-configuration)) — the quickest way is a free [Neon](https://neon.tech) project, since that's what production uses too.

## Frontend Setup

The frontend is the `app/(site)/**` and `app/admin/**` directory trees — React Server Components + client components rendered by Next.js itself. There is no separate frontend build step or separate dev server: `npm run dev` serves the UI and the API together on the same port.

- Pages are organized by route group: `(site)` for the public/customer experience, `admin` for the dashboard.
- Shared UI building blocks live in `components/` (see Project Structure above).
- Tailwind config and the brand color palette are in `tailwind.config.ts`; global styles in `app/globals.css`.

No extra setup is required beyond `npm install` — Next.js handles bundling, routing, and hot reload.

## Backend / API Setup

There is no standalone backend server — the "backend" is the set of Next.js Route Handlers under `app/api/**`, running in the same process as the frontend:

- `app/api/**` (public) — products, categories, cart, wishlist, checkout, reviews, contact, coupon validation.
- `app/api/account/**` — requires a signed-in session; every query is scoped to `session.user.id`.
- `app/api/admin/**` — requires an authenticated session **and** `role === "ADMIN"`, enforced both in `middleware.ts` and again inside each route handler.

All data access goes through Prisma (`lib/prisma.ts`). Business logic (order totals, coupon math, analytics aggregation) lives in `lib/*.ts` helper modules so it isn't duplicated across routes.

No separate backend installation step is needed — it's installed and started along with the frontend (`npm install` / `npm run dev`).

## Database Configuration

This project uses **PostgreSQL via Prisma**, configured entirely through the `DATABASE_URL` environment variable (`prisma/schema.prisma`'s `datasource db` block declares `provider = "postgresql"`). Production runs on [Neon](https://neon.tech) (serverless Postgres, provisioned through Vercel's marketplace integration); local development can point at the same Neon project or a separate one (e.g. a Neon branch, or any other Postgres instance — a local Docker Postgres works too).

```bash
npm run db:migrate   # create/apply the schema (first run)
npm run db:seed      # load demo categories, products, a sample order, coupon, banners, settings
npm run db:reset     # drop, recreate, and reseed the database (destructive)
```

**Note:** this project previously used SQLite for zero-setup local development. It was switched to Postgres because Vercel's serverless functions have no persistent, writable filesystem for a SQLite file — every write would be lost (or fail) between requests. If you want a fully local, offline dev database again, you can point `DATABASE_URL` at a local Postgres instance instead of Neon; just switch back `provider = "sqlite"` and point `DATABASE_URL` at `file:./dev.db` for a throwaway local-only setup (you'd then need a separate build step to swap it back for deployment).

## Environment Variables

Copy `.env.example` to `.env` and fill in the values you have. **Never commit `.env`.**

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma Postgres connection string (e.g. from Neon, Supabase, Railway) |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign session JWTs — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Base URL of the deployed app (`http://localhost:3000` locally) |
| `EMAIL_SERVER` / `EMAIL_FROM` | No | SMTP provider for password-reset emails (currently the reset link is shown on-screen instead) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | No | Payment gateway keys (UPI/Online payments are currently simulated) |
| `UPLOAD_DRIVER` / `CLOUD_STORAGE_BUCKET` | No | Cloud file storage for admin image uploads (currently saved to local disk) |

See `.env.example` for the full, up-to-date list with inline comments.

## Development Commands

```bash
npm run dev          # start the dev server at http://localhost:3000
npm run lint          # run ESLint
npm run db:generate   # regenerate the Prisma client after a schema change
npm run db:migrate    # create and apply a new migration
npm run db:seed       # (re)load demo data
npm run db:reset       # drop, recreate, and reseed the database
```

## Production Build & Start

```bash
npm run build   # type-checks, lints, and produces an optimized production build
npm run start    # serve the production build (defaults to port 3000)
```

Run `npm run db:migrate` (or the equivalent `prisma migrate deploy` in a CI/CD pipeline) against your production database before starting the app for the first time.

## Deployment

**Current production deployment:** [https://pjr-farm-agro.vercel.app](https://pjr-farm-agro.vercel.app), on Vercel, connected to this GitHub repo's `main` branch (every push redeploys automatically), backed by a Neon Postgres database installed via Vercel's marketplace integration.

To reproduce this setup for your own Vercel account:

1. `vercel link` the project (or import the GitHub repo from the Vercel dashboard) — this creates a Vercel project and connects it to this repo for auto-deploys on push.
2. Add a Postgres database: in the Vercel dashboard, add the **Neon** integration (or any other Postgres) to the project — this injects `DATABASE_URL` and related env vars automatically. (Via CLI: `vercel integration add neon`, then `vercel integration-resource connect <resource> <project> --yes`; installing a *new* marketplace integration requires accepting its terms in the browser once, per Vercel's account-owner consent flow.)
3. Add `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL` (your production URL) as project environment variables.
4. Run `npm run db:migrate` and `npm run db:seed` locally against that same `DATABASE_URL` to set up the schema and demo data (or use `npx prisma migrate deploy` in a CI/CD step).
5. Deploy: `vercel --prod`, or just push to `main`.

This also runs on any other Node-compatible host: `npm ci && npm run build && npm run start` behind a reverse proxy, with the same environment variables and a `prisma migrate deploy` step before first start.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pjrfarm.com` | `Admin@123` |
| Customer | `customer@pjrfarm.com` | `Customer@123` |

Admin dashboard: `/admin/login` (intentionally not linked from the customer navbar). **Change or remove these demo accounts before any real/public deployment.**

## Security Notes

- Passwords are hashed with bcryptjs and never returned by any API response.
- All forms are validated with Zod on both the client and the server (`lib/validations.ts`).
- Customer API routes scope every query to the signed-in user's own ID.
- Admin API routes re-verify `role === "ADMIN"` server-side on every request, independent of the route middleware.
- No secrets, credentials, or `.env` files are committed to this repository — see `.gitignore`.

## Known Simplifications

A few pieces are intentionally simplified because no external, paid credentials exist for this project yet:

- **Payments**: Cash on Delivery is fully functional. UPI/Online payment methods are wired through the full checkout flow and order model but are simulated as successful pending a real payment gateway integration (Razorpay/Stripe).
- **Password reset emails**: a real, expiring token is generated and stored in the database; since no email provider is configured, the reset link is shown directly on-screen instead of emailed.
- **Image uploads**: saved to local disk under `/public/uploads`. Swapping to S3/Cloudinary is a change to one upload route.
- **Notifications**: in-app only (database-backed feed + toasts), not email/SMS/push.
