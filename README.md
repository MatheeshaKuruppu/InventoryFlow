<div align="center">

# 📦 InventoryFlow

### Modern Inventory Management Dashboard

A premium, frontend-only inventory management platform built with React 19, TypeScript and a hand-crafted design system. Manage products, stock, categories and analytics — all persisted locally in the browser.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure)

</div>

---

## ✨ Overview

**InventoryFlow** is a polished, production-quality inventory dashboard inspired by modern SaaS products like Linear, Notion and the Stripe Dashboard. It is **100% frontend** — there is no backend, database or external service. All data is persisted to the browser's `localStorage` through a clean, reusable storage layer, and the app ships with a realistic demo dataset on first launch.

The project is built to demonstrate strong engineering fundamentals: strict TypeScript, a modular feature-based architecture, reusable primitives, accessible components, and thoughtful UX with loading, empty and error states throughout.

## 🚀 Features

### Core
- **Dashboard** — Animated KPI cards, category distribution (pie), inventory value (bar) and stock status (donut) charts, low-stock alerts and a live activity feed.
- **Products** — Sortable, filterable data table with real-time search (name / ID), category & stock-status filters, pagination (10/page), row actions and **bulk delete / restock**.
- **Categories** — Create, edit and delete categories as rich cards showing product count and inventory value. Deletion is blocked while products are assigned.
- **Stock Management** — Dedicated restock / reduce operations with a live quantity preview, plus a full **stock history audit trail** (previous → new quantity, change, action, timestamp).
- **Settings** — Light / dark theme switcher, CSV export and a guarded "clear all data" action.

### Bonus
- 🏷️ **Auto SKU generator** (`PRD-482910`) with manual override and regenerate.
- 📤 **CSV export** of the full catalog via PapaParse.
- 🕒 **Stock history** logging for every movement.
- 🌗 **Dark mode** persisted to `localStorage` (no flash of incorrect theme).
- 📊 **Recharts** analytics with theme-aware, custom tooltips.
- ☑️ **Bulk actions** — multi-select with a floating action bar.

### Experience & quality
- ✅ **Formik + Yup** validation on every form with animated inline errors.
- 🔔 **Toast notifications** for all create / update / delete / stock / export actions.
- 💀 **Skeleton loaders**, illustrated **empty states**, and **confirmation dialogs** for destructive actions.
- 🎞️ **Framer Motion** page transitions, modal/dropdown animations and KPI count-ups.
- ⌨️ **Keyboard accessible** — focus rings, tab navigation and ARIA labels throughout.
- 📱 **Fully responsive** — mobile-first layouts that scale to tablet, laptop and desktop.

## 🛠 Tech Stack

| Area | Technology |
| --- | --- |
| Framework | **React 19** + **Vite 6** |
| Language | **TypeScript** (strict) |
| Routing | **React Router 7** |
| State | **Zustand** |
| Forms | **Formik** + **Yup** |
| Styling | **Tailwind CSS** + **shadcn/ui**-style primitives (Radix UI) |
| Icons | **Lucide React** |
| Animation | **Framer Motion** |
| Charts | **Recharts** |
| Utilities | **date-fns**, **PapaParse**, **clsx**, **tailwind-merge** |
| Notifications | **Sonner** |
| Persistence | **localStorage** |

## 📁 Project Structure

```
src/
├── app/                  # App root + provider composition
├── components/
│   ├── charts/           # Recharts wrappers (pie, bar, donut, tooltip)
│   ├── forms/            # Formik + Yup forms (product, category, stock)
│   ├── layout/           # Sidebar, topbar, page shell, transitions
│   ├── providers/        # Theme provider
│   └── ui/               # Reusable primitives (button, card, dialog, table…)
├── features/             # Feature modules (self-contained UI + logic)
│   ├── dashboard/        # KPI cards, low-stock, activity, skeletons
│   ├── products/         # Table, toolbar, filters hook, bulk actions
│   ├── categories/       # Category cards + form dialog
│   └── stock/            # Stock operations, history, update dialog
├── hooks/                # useDebounce, useSelection, useCountUp, …
├── lib/                  # cn() helper, Yup validation schemas
├── pages/                # Route-level pages
├── routes/               # Router configuration
├── services/             # Generic localStorage service
├── storage/              # Per-entity storage (product/category/stock/activity)
├── store/                # Zustand inventory store
├── types/                # Domain models (Product, Category, StockHistory…)
└── utils/                # Formatting, analytics, CSV, SKU/id, seed data
```

### Architecture notes
- **Storage layer** (`storage/`) exposes `getAll`, `save`, `update`, `remove` per entity over a single defensive `localStorageService` — corrupt reads never crash the app.
- **Store** (`store/inventoryStore.ts`) is the single source of truth: it owns all mutations, keeps denormalized data in sync, writes through to storage and records an activity/audit trail.
- **Derived data** (metrics, chart series, category stats) lives in pure functions in `utils/analytics.ts` and is memoized in pages.

## 🏁 Getting Started

### Prerequisites
- **Node.js 18+** and npm.

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open the printed local URL (default **http://localhost:5173**).

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run the TypeScript compiler with no emit |
| `npm run lint` | Lint the project |

## 📖 Usage

1. **First launch** seeds a realistic demo catalog so every chart and table is populated.
2. **Add products** from the Products page — a SKU is auto-generated (and editable).
3. **Manage stock** from the Stock page; every change is recorded in the history log.
4. **Organize** products with categories and **filter / search / sort** from the Products table.
5. **Export** your catalog to CSV or **reset** everything from Settings.
6. Toggle **dark mode** in Settings or via the topbar — your preference persists.

> All data lives in your browser's `localStorage`. Clearing site data or using the "Clear all data" action resets the app.

## 📸 Screenshots

> _Add screenshots or a screen recording here._

| Dashboard | Products |
| --- | --- |
| _`docs/dashboard.png`_ | _`docs/products.png`_ |

| Categories | Stock & History |
| --- | --- |
| _`docs/categories.png`_ | _`docs/stock.png`_ |

## 📄 License

This project was built as a frontend engineering showcase and is provided as-is for demonstration and educational purposes.

---

<div align="center">
Built with React, TypeScript & Tailwind CSS.
</div>
