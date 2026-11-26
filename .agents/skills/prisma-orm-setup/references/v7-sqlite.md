# SQLite Setup

Configure **Prisma ORM 7** with SQLite. For an existing Prisma 6 app, keep its configuration and use the [Prisma 6 docs](https://www.prisma.io/docs/orm/v6); the configuration and adapter examples below are for 7.

## Prerequisites

- None (file-based)

## 1. Schema Configuration

In `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

## 2. Config Configuration

In `prisma.config.ts`:

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 3. Environment Variable

In `.env`:

```env
DATABASE_URL="file:./dev.db"
```

### Connection String Format

```
file:PATH
```

- **PATH**: Relative path to the database file. Check `prisma.config.ts` if you need to confirm how your app resolves it.

## Driver Adapter

Use a driver adapter for the standard SQL workflow.

1. Install adapter and driver:
   ```bash
   npm install @prisma/adapter-better-sqlite3@7 better-sqlite3
   ```

2. Instantiate Prisma Client with the adapter:
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

   const adapter = new PrismaBetterSqlite3({
     url: process.env.DATABASE_URL!,
   })

   const prisma = new PrismaClient({ adapter })
   ```

## Using Driver Adapter (LibSQL / Turso)

For edge compatibility or Turso, this adapter connects the application runtime to Turso. The
Prisma 7 CLI schema operations still use the local SQLite URL in `prisma.config.ts`; `migrate dev`
and `db push` do not apply changes to the remote Turso database.

1. Install:
   ```bash
   npm install @prisma/adapter-libsql@7 @libsql/client
   ```

2. Instantiate:
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaLibSQL } from '@prisma/adapter-libsql'

   const adapter = new PrismaLibSQL({
     url: process.env.TURSO_DATABASE_URL,
     authToken: process.env.TURSO_AUTH_TOKEN,
   })
   const prisma = new PrismaClient({ adapter })
   ```

To apply a schema change to Turso, generate and review SQL with the Prisma 7 CLI, then execute
that SQL using the remote libSQL client. For a new, empty database:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

```typescript
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url || !authToken) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required')

const client = createClient({ url, authToken })
try {
  await client.executeMultiple(await readFile('migration.sql', 'utf8'))
} finally {
  client.close()
}
```

For an existing database, generate the diff from a schema snapshot that matches its current
state, review any destructive SQL, and apply through the same remote client. Do not treat the
local SQLite file as the Turso database.

## Limitations

- **Enums**: Prisma supports enum fields, but SQLite does not enforce enum values at the database level.
- **No Scalar Lists**: `String[]` is not supported directly.
- **Concurrency**: Write operations lock the file.

## Common Issues

### "Database file not found"

Check the resolved file path for both the CLI and the runtime adapter; relative paths can resolve differently. Use an explicit path to the intended file rather than silently creating a second database.

## References

- [Prisma 7 SQLite documentation](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite)
