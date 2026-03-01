# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PharmaChain — a blockchain-based pharmaceutical supply chain tracking system. Drugs move through a lifecycle: **Manufactured → Distributed → Wholesaled → Sold**. Role-based access (Admin, Manufacturer, Distributor, Wholesaler) is enforced on-chain via Solidity and in the UI.

## Commands

```bash
npm run dev       # Dev server (Turbopack)
npm run build     # Production build (Turbopack)
npm start         # Start production server
npm run lint      # ESLint (flat config, no args needed)
npm run generate  # Generate Drizzle migrations from schema changes
npm run migrate   # Apply Drizzle migrations to the database
```

No test framework is configured.

## Tech Stack

- **Next.js 16** with App Router, React 19, TypeScript (strict), Turbopack
- **React Compiler** enabled via `babel-plugin-react-compiler`
- **Tailwind CSS 4** with PostCSS, oklch color space, CSS variables, dark mode via `next-themes`
- **shadcn/ui** (New York style, RSC-enabled) — components in `src/components/ui/`
- **Drizzle ORM** with PostgreSQL (`pg`) — schema in `src/db/schema.ts`, migrations in `drizzle/`
- **ethers.js 6** for blockchain interaction via MetaMask `BrowserProvider`
- **react-hook-form** for form handling, **axios** for HTTP requests
- **Recharts** for dashboard charts
- **Icons:** lucide-react (primary), @tabler/icons-react, react-icons

## Architecture

### Route Structure (App Router)

```
src/app/
├── (auth)/login/          # Login page
├── (dashboard)/           # Layout with collapsible sidebar + breadcrumbs
│   ├── dashboard/         # Main dashboard with charts
│   ├── products/          # Product list, [productId] detail
│   ├── transactions/      # Transaction list, [txHash] detail
│   ├── reports/
│   └── users/
├── admin/                 # Separate admin layout
│   ├── admins/
│   ├── manufacturers/
│   ├── distributors/
│   └── wholesalers/
└── page.tsx               # Landing page
```

Route groups `(auth)` and `(dashboard)` share different layouts. The dashboard layout (`src/app/(dashboard)/layout.tsx`) wraps pages with `SidebarProvider`, `AppSidebar`, breadcrumbs, and theme toggle. The admin section has its own layout and sidebar.

### Blockchain Layer

```
src/blockchain/
├── contract.ts            # getSupplyChainContract() — MetaMask connection + ethers Contract
├── addresses.ts           # Hardcoded contract address
└── contracts/
    ├── SupplyChain.sol    # Main contract (extends Admin → Roles)
    ├── SupplyChain.json   # ABI
    ├── roles/Admin.sol    # Role add/remove + events
    ├── libraries/Roles.sol # Access control mappings + modifiers
    └── structs/DrugStruct.sol
```

**Contract interaction pattern:** Client components call `useSupplyChainContract()` hook (`src/hooks/use-supply-chain-contract.ts`) which wraps each contract call with loading/error state management. The hook calls `getSupplyChainContract()` from `contract.ts`, which connects to MetaMask and returns an ethers `Contract` instance.

### Smart Contract Roles & Key Functions

- **Admin:** `addAdmin`, `removeAdmin`, `addManufacturer/Distributor/Wholesaler`, `removeManufacturer/Distributor/Wholesaler`
- **Manufacturer:** `registerDrug`, `approveDistributor`, `getMyDrugs`, `getAllDistributorRequests`
- **Distributor:** `requestDrug`, `approveWholesaler`, `sendDrugToAllWholesalers`
- **Wholesaler:** `viewBroadcastedDrugs`, `requestDrugFromDistributor`, `sellToCustomer`
- **Public:** `verifyDrug`, `verifyDrugByQR`, `rejectDrug`

Drug stages enum: `Manufactured(0)`, `Distributed(1)`, `Wholesaled(2)`, `Sold(3)`

### Database Layer

```
src/db/
├── schema.ts    # Drizzle schema — usersTable with roles (manufacturer, distributor, pharmacist, admin)
└── index.ts     # DB connection via DATABASE_URL env var
drizzle/         # Generated migrations
drizzle.config.ts
```

User records (fullName, organization, email, phone, role, walletId) are stored in PostgreSQL. The `usersTable` links on-chain wallet addresses to off-chain user profiles.

### API Routes

- `GET /api/user` — list all users, or check existence by `?email=` or `?walletId=` query params
- `POST /api/user` — create a new user (checks for duplicate email/wallet)

### Component Patterns

- Server Components are the default; client components use `"use client"` directive
- shadcn/ui components live in `src/components/ui/` — add new ones via `npx shadcn@latest add <component>`
- Feature components are organized by domain: `src/components/admin/`, `src/components/products/`, `src/components/users/`, `src/components/landingpage/`
- `src/components/common/WalletButton.tsx` handles MetaMask wallet connection UI

## Path Aliases

```
@/* → src/*
```

Configured aliases for shadcn/ui: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`

## Key Conventions

- File naming: kebab-case (e.g., `app-sidebar.tsx`, `use-supply-chain-contract.ts`)
- Component naming: PascalCase exports from kebab-case files
- Class merging utility: `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- Solidity version: `^0.8.19`
- Contract address is hardcoded in `src/blockchain/addresses.ts`, not from env vars
- `DATABASE_URL` env var required for PostgreSQL connection (used by Drizzle ORM)
- Dual data sources: on-chain drug/role data via smart contract, off-chain user profiles via PostgreSQL
