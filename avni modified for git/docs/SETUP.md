# Setup

## BotFather

1. Create the bot, copy the token to `TELEGRAM_BOT_TOKEN`.
2. Disable Group Privacy Mode if you need promotion lock and filters on all messages.
3. Enable Bot-to-Bot Communication Mode (required to *see* other bots’ group messages).
4. Enable inline mode; set inline feedback to 100% for whispers.
5. Set domain / menu button to `MINI_APP_URL`.
6. Set webhook: `PUBLIC_BASE_URL/telegram/webhook` with `WEBHOOK_SECRET`.

## Admin rights per feature

- Locks / filters / del: Delete messages
- Mute / kick / ban / warn actions: Restrict members
- Pin: Pin messages
- Promote: Add new admins

## Promotion lock readiness

The lock cannot fire on other bots’ messages unless Telegram delivers those updates. The Mini App Readiness tab lists: privacy mode, bot-to-bot mode, admin status.

## Supabase

Create a project, use the **pooled** connection string as `DATABASE_URL`. Run `packages/db/migrations/001_init.sql`. Enable RLS and grant nothing to `anon`. The server uses the service connection only.

## Render

One web service, Node 20, start `node apps/server/dist/index.js` after build. Health: `/healthz`, ready: `/readyz`.
