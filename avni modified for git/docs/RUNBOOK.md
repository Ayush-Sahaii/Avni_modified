# Runbook

## Deploy

Build, migrate SQL, set env, start server, register webhook.

## Rollback

Redeploy previous release. Migrations are forward-only; restore from backup if a migration must be undone.

## Restore

`pnpm run db:export` is planned as `pg_dump` of permanent tables. Restore with `psql` into a new database, swap `DATABASE_URL`.

## Incidents

1. Check `/healthz` and `/readyz`
2. Toggle `!maintenance on`
3. Inspect logs; never log message text
