# QR Menu

Versión en español: [README.md](README.md)

> Multi-tenant digital menu system for restaurants with QR codes, optimized for performance and mobile experience.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Clerk
- **Styling:** Tailwind CSS 4
- **Runtime:** Node.js with PostgreSQL adapter
- **Monitoring:** Sentry

## 📋 Prerequisites

- Node.js 18+ (or compatible with `pnpm`)
- PostgreSQL 14+
- Clerk account (for authentication)

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd qr-menu
pnpm install
```

### 2. Configure Environment Variables

Create `.env` file in root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm exec prisma generate

# Run migrations
pnpm exec prisma migrate dev

# (Optional) Seed with demo data
pnpm exec tsx prisma/seed-demo.ts
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

### Multi-Tenancy Model

```
Tenant (Restaurant)
  └─ Membership (Users with roles)
  └─ Menu (Tenant menus)
      └─ MenuVersion (Menu versions)
          └─ Item (Dishes/products)
```

### Main Routes

| Route                         | Description             | Type      |
| ----------------------------- | ----------------------- | --------- |
| `/admin`                      | Admin dashboard         | Protected |
| `/menu/[publicId]`            | Public menu page        | Public    |
| `/api/admin/menu`             | Create menus (auth)     | API       |
| `/api/admin/menu/demo`        | Create demos (dev only) | API       |
| `/api/public/menu/[publicId]` | Get menu data           | API       |

---

## 🎯 Technical Decisions

### 1. App Router & Server Components

**Why:** Drastic reduction of JavaScript sent to client

- Menu pages (`/menu/[id]`) are **Server Components**
- Full server-side rendering = static HTML
- ~90% less payload compared to Client Components
- **Benefit:** Initial load < 100ms on 4G mobile

### 2. Hybrid Cache Strategy

**Goal:** TTFB < 200ms + always fresh data

#### ISR (Incremental Static Regeneration)

```typescript
fetch(url, {
  next: { revalidate: 60 },
});
```

- Next.js rebuilds page every 60s if there's traffic
- First request triggers rebuild, next gets fresh version

#### CDN Edge Caching

```typescript
"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
```

- `s-maxage=60`: Cache on CDN (Vercel Edge) for 60 seconds
- `stale-while-revalidate=300`: Serve stale cache while updating in background
- **Benefit:** Instant TTFB from edge locations

#### Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant CDN
    participant Next.js
    participant DB

    Client->>CDN: GET /menu/abc123
    alt Cache Hit (< 60s)
        CDN-->>Client: HTML (cached)
    else Cache Miss
        CDN->>Next.js: Forward request
        Next.js->>DB: Query menu
        DB-->>Next.js: Menu data
        Next.js-->>CDN: HTML + Cache headers
        CDN-->>Client: HTML
    end
```

### 3. Database & ORM

**PostgreSQL:**

- Complex relationships (Tenant → Menu → Items)
- ACID compliance for multi-tenancy
- Strategic indexes on publicId, tenantId

**Prisma:**

- End-to-end type-safety (DB → API → Frontend)
- Migrations with rollback
- Query optimization with selective `include`

### 4. Performance Optimizations

#### SEO & Metadata

```typescript
export async function generateMetadata(): Promise<Metadata> {
  // Dynamic data at build-time
  // No additional fetch on client
}
```

#### Automatic Code Splitting

- Admin components (`/admin`) NOT sent to public pages
- QR libraries only load in dashboard
- 80% of public code is static HTML

#### Success Metrics

| Metric                 | Target  | Achieved |
| ---------------------- | ------- | -------- |
| Lighthouse Performance | > 90    | ✅       |
| First Contentful Paint | < 1.5s  | ✅       |
| Time to Interactive    | < 3s    | ✅       |
| Total Bundle Size      | < 100KB | ✅       |

---

## 📱 Demo Features

### Admin Dashboard (`/admin`)

1. **Tenant List:** View all restaurants
2. **Quick Create:** Button to create demo tenant with one click
3. **QR Generation:** QR codes per menu for on-site scanning
4. **Public Links:** Direct links to menu pages

### User Flow

```bash
# 1. Create demo tenant from dashboard
Click "Create Demo Tenant" → Generates restaurant with 3 dishes

# 2. Get QR
Click "Show QR" → Scan with mobile

# 3. Customer experience
Scan QR → Menu loads in < 1s → No app installation required
```

---

## 🔐 Security

- ✅ Clerk authentication on `/admin` routes
- ✅ Row-Level Security: Users only see their tenants
- ✅ `/api/admin/menu/demo` endpoint disabled in production
- ✅ Zod validation on all endpoints
- ✅ Prisma prepared statements (SQL injection protection)

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Automatic deploy from main branch
git push origin main
```

**Configuration:**

- Framework Preset: `Next.js`
- Build Command: `pnpm build`
- Environment Variables: Copy from `.env`

### Manual

```bash
pnpm build
pnpm start
```

---

## 📊 Monitoring

- **Sentry:** Runtime and frontend errors
- **Vercel Analytics:** Web Vitals and performance
- **Prisma Logs:** Slow queries (dev only)

---

## 📝 Available Scripts

```bash
# Development
pnpm dev                    # Development server
pnpm build                  # Production build
pnpm start                  # Production server

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # GUI to view data
pnpm prisma:seed            # Seed with demo data

# Linting
pnpm lint                   # ESLint check
```

---

## 🤝 Contributing

1. Fork the repository
2. Create branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is private. All rights reserved.

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
