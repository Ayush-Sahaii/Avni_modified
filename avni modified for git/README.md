# Avni

Telegram bot, Mini App, public site, and multiplayer games.

**GitHub:** upload **this folder** (the one with `package.json`). See **`GITHUB.md`**.

## Quick start

```bash
cp .env.example .env
npm install
npm test
npm run dev:web
```

Secrets and BotFather/Supabase steps: **`ENV_SETUP_GUIDE.md`**.

Personality: `config/personality/personality.txt` (do not put persona text in source).  
Posters: `apps/web/public/posters/`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright (needs Chromium libs) |
| `npm run dev:web` | Vite site + Mini App |
| `npm run dev:server` | Fastify webhook/API/WS |

Node 20+.
