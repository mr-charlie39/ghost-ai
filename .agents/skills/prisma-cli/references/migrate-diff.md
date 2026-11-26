# prisma migrate diff

Compares database schemas and generates diffs (SQL or summary).

## Command

```bash
prisma migrate diff [options]
```

## What It Does

- Compares two sources (`--from-...` and `--to-...`)
- Sources can be:
    - Empty (`empty`)
    - Schema file (`schema`)
    - Migrations directory (`migrations`)
    - Configured Datasource (`config-datasource`)
- Outputs the difference:
    - Human-readable summary (default)
    - SQL script (`--script`)

## Options

| Option | Description |
|--------|-------------|
| `--script` | Render SQL script to stdout |
| `--exit-code` | Exit 2 if changes detected, 0 if empty, 1 if error |
| `--config` | Custom path to your Prisma config file |

### Sources (Must provide one `from` and one `to`)

- `--from-empty`, `--to-empty`
- `--from-schema <path>`, `--to-schema <path>`
- `--from-migrations <path>`, `--to-migrations <path>`
- `--from-config-datasource`, `--to-config-datasource` (uses `prisma.config.ts`)

## Examples

### Generate SQL for a schema change

Compare the configured production database to your local schema. Set the direct production
connection URL in `prisma.config.ts`, for example:

```typescript
export default defineConfig({
  datasource: { url: env('PROD_DATABASE_URL') },
})
```

```bash
prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --script
```

### Review pending migrations

Compare database state to migrations directory:

```bash
prisma migrate diff \
  --from-config-datasource \
  --to-migrations ./prisma/migrations
```

Comparing with a migrations directory requires a shadow database. If the configured database
user cannot create one automatically, provision a separate shadow database and set
`shadowDatabaseUrl` in `prisma.config.ts`. Never use the production database as the shadow
database.

### Create baseline migration

Compare empty state to current schema:

```bash
mkdir -p prisma/migrations/0_init
prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql
```

### Check for drift (CI)

Check if database matches schema:

```bash
prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --exit-code
```

## Use Cases

- **Forward-generating migrations**: Creating SQL without `migrate dev`.
- **Drift detection**: Checking if DB is in sync.
- **Baselining**: Creating initial migration from existing DB.
- **Debugging**: Understanding what `migrate dev` would do.
