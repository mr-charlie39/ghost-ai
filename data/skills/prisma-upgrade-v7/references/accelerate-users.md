# Existing Prisma Accelerate Users

Prisma Accelerate is scheduled to retire on December 1, 2026. Do not treat it as an ongoing
setup recommendation for new Prisma 7 apps. Existing users should follow Prisma's
[official removal and migration guide](https://www.prisma.io/docs/accelerate/keep-your-database)
and move to a direct database connection before retirement; caching behavior provided by
Accelerate will not remain after the service is removed.

## Important

**Do NOT pass Accelerate URLs to driver adapters.**

Driver adapters (like `PrismaPg`) expect direct database connection strings. They will fail with `prisma://` or `prisma+postgres://` URLs.

## Existing deployments before retirement

### 1. Keep your Accelerate URL

```env
# .env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
# or
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
```

### 2. Install Accelerate extension

```bash
npm install @prisma/extension-accelerate
```

### 3. Configure prisma.config.ts

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),  // Accelerate URL works here
  },
})
```

### 4. Instantiate client with accelerateUrl

```typescript
import { PrismaClient } from '../generated/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use accelerateUrl instead of adapter
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate())
```

## What NOT to Do

```typescript
// ❌ WRONG - Don't use adapter with Accelerate URL
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL  // This will fail with prisma://
})
```

## Migrations

Prisma CLI migration commands require a direct database connection. Configure the migration
URL separately from the runtime Accelerate URL:

```env
DATABASE_URL="prisma+postgres://..."   # Existing app runtime, until migration
DIRECT_DATABASE_URL="postgresql://..." # Direct database connection for migrations
```

```typescript
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: env('DIRECT_DATABASE_URL'),  // Direct URL for CLI
  },
})
```

## Prisma Postgres (Cloud)

If using Prisma Postgres cloud database:

### Same approach

```typescript
import { PrismaClient } from '../generated/client'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,  // prisma+postgres:// URL
}).$extends(withAccelerate())
```

## Moving to a direct connection

Before the retirement date, replace the Accelerate client with a provider-appropriate driver
adapter and point it at the direct connection:

```typescript
// Change from accelerateUrl to adapter
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL  // Direct postgres:// URL
})

export const prisma = new PrismaClient({ adapter })
```

Review application code that uses `cacheStrategy`; migrate or remove that behavior as part of
the transition because Accelerate caching will not be available after retirement.
