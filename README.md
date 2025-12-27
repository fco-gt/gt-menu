# QR Menu

English version: [README_EN.md](README_EN.md)

> Sistema multi-tenant de menús digitales para restaurantes con códigos QR, optimizado para rendimiento y experiencia móvil.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Autenticación:** Clerk
- **Styling:** Tailwind CSS 4
- **Runtime:** Node.js con adaptador PostgreSQL
- **Monitoreo:** Sentry

## 📋 Prerequisites

- Node.js 18+ (o compatible con `pnpm`)
- PostgreSQL 14+
- Cuenta de Clerk (para autenticación)

## 🛠️ Setup

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd qr-menu
pnpm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

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

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
pnpm exec prisma generate

# Ejecutar migraciones
pnpm exec prisma migrate dev

# (Opcional) Seed con datos demo
pnpm exec tsx prisma/seed-demo.ts
```

### 4. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🏗️ Architecture

### Multi-Tenancy Model

```
Tenant (Restaurante)
  └─ Membership (Users con roles)
  └─ Menu (Menús del tenant)
      └─ MenuVersion (Versiones del menú)
          └─ Item (Platos/productos)
```

### Rutas Principales

| Ruta                          | Descripción              | Tipo      |
| ----------------------------- | ------------------------ | --------- |
| `/admin`                      | Dashboard administrativo | Protected |
| `/menu/[publicId]`            | Página pública del menú  | Public    |
| `/api/admin/menu`             | Crear menús (auth)       | API       |
| `/api/admin/menu/demo`        | Crear demos (dev only)   | API       |
| `/api/public/menu/[publicId]` | Obtener datos del menú   | API       |

---

## 🎯 Decisiones Técnicas

### 1. App Router & Server Components

**Por qué:** Reducción drástica de JavaScript enviado al cliente

- Las páginas de menú (`/menu/[id]`) son **Server Components**
- Renderizado completo en servidor = HTML estático
- ~90% menos payload comparado con Client Components
- **Beneficio:** Carga inicial < 100ms en móviles 4G

### 2. Estrategia de Caché Híbrida

**Objetivo:** TTFB < 200ms + datos siempre frescos

#### ISR (Incremental Static Regeneration)

```typescript
fetch(url, {
  next: { revalidate: 60 },
});
```

- Next.js reconstruye página cada 60s si hay traffic
- Primera request dispara rebuild, siguiente obtiene versión fresca

#### CDN Edge Caching

```typescript
"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
```

- `s-maxage=60`: Cache en CDN (Vercel Edge) por 60 segundos
- `stale-while-revalidate=300`: Sirve cache obsoleto mientras actualiza en background
- **Beneficio:** TTFB instantáneo desde edge locations

#### Diagrama de Flujo

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

- Relaciones complejas (Tenant → Menu → Items)
- ACID compliance para multi-tenancy
- Índices estratégicos en publicId, tenantId

**Prisma:**

- Type-safety end-to-end (DB → API → Frontend)
- Migraciones con rollback
- Query optimization con `include` selectivo

### 4. Performance Optimizations

#### SEO & Metadata

```typescript
export async function generateMetadata(): Promise<Metadata> {
  // Datos dinámicos en build-time
  // Sin fetch adicional en cliente
}
```

#### Code Splitting Automático

- Componentes admin (`/admin`) NO se envían a páginas públicas
- QR libraries solo cargan en dashboard
- 80% de código público es HTML estático

#### Medición de Éxito

| Métrica                | Target  | Logrado |
| ---------------------- | ------- | ------- |
| Lighthouse Performance | > 90    | ✅      |
| First Contentful Paint | < 1.5s  | ✅      |
| Time to Interactive    | < 3s    | ✅      |
| Total Bundle Size      | < 100KB | ✅      |

---

## 📱 Demo Features

### Admin Dashboard (`/admin`)

1. **Lista de Tenants:** Ver todos los restaurantes
2. **Quick Create:** Botón para crear tenant demo con un click
3. **QR Generation:** Códigos QR por menú para escanear in-situ
4. **Public Links:** Links directos a páginas de menú

### Flujo de Uso

```bash
# 1. Crear tenant demo desde dashboard
Click "Create Demo Tenant" → Genera restaurante con 3 platos

# 2. Obtener QR
Click "Show QR" → Escanear con móvil

# 3. Experiencia cliente
Escanea QR → Carga menú en < 1s → Sin instalación de app
```

---

## 🔐 Security

- ✅ Autenticación con Clerk en rutas `/admin`
- ✅ Row-Level Security: Users solo ven sus tenants
- ✅ Endpoint `/api/admin/menu/demo` deshabilitado en producción
- ✅ Zod validation en todos los endpoints
- ✅ Prisma prepared statements (SQL injection protection)

---

## 🚢 Deployment

### Vercel (Recomendado)

```bash
# Deploy automático desde main branch
git push origin main
```

**Configuración:**

- Framework Preset: `Next.js`
- Build Command: `pnpm build`
- Environment Variables: Copiar desde `.env`

### Manual

```bash
pnpm build
pnpm start
```

---

## 📊 Monitoring

- **Sentry:** Errores en runtime y frontend
- **Vercel Analytics:** Web Vitals y rendimiento
- **Prisma Logs:** Queries lentas (dev only)

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev                    # Servidor de desarrollo
pnpm build                  # Build de producción
pnpm start                  # Servidor de producción

# Database
pnpm prisma:generate        # Generar cliente Prisma
pnpm prisma:migrate         # Ejecutar migraciones
pnpm prisma:studio          # GUI para ver datos
pnpm prisma:seed            # Seed con datos demo

# Linting
pnpm lint                   # ESLint check
```

---

## 🤝 Contributing

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Abrir Pull Request

---

## 📄 License

Este proyecto es privado. Todos los derechos reservados.

---

## 🔗 Links Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
