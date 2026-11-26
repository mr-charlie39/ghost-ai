# prisma debug

Prints information helpful for debugging and bug reports.

## Command

```bash
prisma debug [options]
```

## What It Does

Outputs diagnostic information such as schema and config paths, cache paths, and environment
settings. Use `prisma version` for Prisma CLI, Client, engine, platform, and Node.js details.

## Options

| Option | Description |
|--------|-------------|
| `--schema` | Path to schema file |
| `--config` | Custom path to your Prisma config file |

## Version checks

```bash
prisma version
```

## When to Use

- **Troubleshooting**: Checking configured paths and environment settings
- **Reporting Issues**: Including environment info in GitHub issues
- **Verifying Installation**: Ensuring correct binaries are downloaded
