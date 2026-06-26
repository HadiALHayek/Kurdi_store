# Kurdi Store

Dark-tech PC parts e-commerce experience with a guided compatibility-based PC Builder and admin CRUD dashboard.

## Stack

- React + TypeScript + Vite
- Tailwind CSS + brand CSS variables
- Zustand global stores
- React Router v6
- Lucide React
- Vercel serverless API + Supabase (customer leads)
- localStorage + sessionStorage persistence (products, builder, admin session)

## Run

```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint
npm run build
```

### Local API development

Customer leads require the Vercel API routes and Supabase. Use Vercel CLI:

```bash
npx vercel dev
```

This serves the Vite app and `/api/*` routes together. Copy `.env.example` to `.env` and fill in the values.

`npm run dev` alone serves the frontend only; quote submissions and admin customer list need `vercel dev` or a deployed environment.

## Routes

- `/` - Public Store listing
- `/builder` - Guided PC Builder
- `/admin` - Admin Login
- `/admin/dashboard` - Admin Dashboard

## Admin Access

- Default password: `admin123` (change after first login in Admin → Settings)
- Client session: `kurdi_admin_session` (sessionStorage)
- Server session: HttpOnly cookie set by `POST /api/admin/login`

Set `ADMIN_PASSWORD` in Vercel env to match your admin dashboard password so the API session works after login.

## Customer Leads API

Quote requests from the PC builder (and footer callback) are stored in Supabase and shared across devices.

| Endpoint | Auth | Description |
| --- | --- | --- |
| `POST /api/leads` | Public | Submit name + Syrian phone (`09xxxxxxxx`) + build summary |
| `GET /api/leads` | Admin cookie | List all quote requests |
| `DELETE /api/leads` | Admin cookie | Clear all leads |
| `DELETE /api/leads/:id` | Admin cookie | Remove one lead |
| `POST /api/admin/login` | Password body | Set HttpOnly admin session cookie |
| `POST /api/admin/logout` | — | Clear admin session cookie |

### Environment variables

Copy `.env.example` to `.env` for local `vercel dev`, and add the same keys in the Vercel project dashboard for production:

| Variable | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only, never expose to client) |
| `ADMIN_PASSWORD` | Yes | Must match admin dashboard password |
| `JWT_SECRET` | Yes | Random string for signing admin session cookies |
| `VITE_LEADS_API_ENABLED` | No | Set to `false` to disable API calls (local-only fallback) |

### Supabase setup

1. Create a free [Supabase](https://supabase.com) project.
2. Run the SQL in `supabase/migrations/001_quote_requests.sql` in the SQL editor.
3. Copy project URL and service role key into env vars.

## Deploy to Vercel

1. Push the repo to GitHub and import in [Vercel](https://vercel.com).
2. Add all env vars from `.env.example`.
3. Deploy — Vercel serves the static Vite build and `/api` serverless functions automatically.

## Logo Setup

Add your logo to:

- `public/kurdi-logo.png`

This path is used by Navbar, Admin Login, Builder header, and favicon.

## Compatibility Spec Reference

| Key | Applies To | Example Values | Rule Usage |
| --- | --- | --- | --- |
| `socket` | CPU, Motherboard | `AM5`, `AM4`, `LGA1700`, `LGA1851` | CPU-Motherboard socket compatibility |
| `memoryType` | Motherboard, RAM | `DDR4`, `DDR5` | RAM filtering by CPU/Motherboard |
| `tdp` | CPU, GPU | `120`, `200` | PSU requirement and cooling checks |
| `wattage` | PSU | `650`, `850` | Must be >= CPU tdp + GPU tdp + 100 |
| `formFactor` | Motherboard, Case | `ATX`, `mATX`, `ITX` | Case support matrix |
| `tdpSupport` | Cooling | `125`, `170`, `250` | Cooler must support CPU thermal load |

## Persistence Keys

- Products: `kurdi_products_v1`
- Builder: `kurdi_builder_v1`
- Admin Session: `kurdi_admin_session`
- Unsynced leads (offline fallback): `kurdi_customers_unsynced_v1`
