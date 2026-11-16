# Architecture

Telegram HTTPS webhook → Fastify `/telegram/webhook` (secret) → command registry / guards → modules → Postgres.

Mini App → `/app` React tree → REST + WebSocket `/ws` → RoomHub → shared engines.

Website → same Vite app, marketing routes.

```
apps/server   HTTP, WS, webhook, rooms, jobs
apps/web      website + Mini App
packages/shared  commands, locks, engines, env
packages/db   SQL migrations
```
