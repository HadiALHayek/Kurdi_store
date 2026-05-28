# Kurdi Store

Dark-tech PC parts e-commerce experience with a guided compatibility-based PC Builder and admin CRUD dashboard.

## Stack

- React + TypeScript + Vite
- Tailwind CSS + brand CSS variables
- Zustand global stores
- React Router v6
- Lucide React
- localStorage + sessionStorage persistence

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

## Routes

- `/` - Public Store listing
- `/builder` - Guided PC Builder
- `/admin` - Admin Login
- `/admin/dashboard` - Admin Dashboard

## Admin Access

- Password: `admin123`
- Session key: `kurdi_admin_session`

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
