# Final checklist vs master prompt

Legend: **I** implemented · **U** unit · **Int** mocked integration · **Live** live-verified · **B** blocked · **N** not implemented / partial

## Telegram bot

| Item | Status |
| --- | --- |
| Webhook path + secret 403 | I U (secret compare). Live B |
| Command registry `/` `!` `.` aliases | I U |
| Help generated from registry | I U |
| Moderation commands (kick/ban/…) | I partial (replies/usage; no live Telegram API punish) |
| Locks, aliases, default delete | I U |
| Edited messages same lock path | I (same handler) |
| Promotion lock | I U. Live two-bot B |
| Per-category approvals schema | I SQL. Runtime UI partial |
| Force-subscribe getChatMember | I Int mock. Live B |
| Welcome/goodbye/filters/flood | Schema + dashboard fields; flood runtime N |
| Economy /truth /dare /coins | I U (memory wallets) |
| Family constraints | I U (engine). Bot commands thin |
| Inline whispers | N |
| AI personality file verbatim | I U |
| Groq provider | I U mock. Live B |
| Dev ! commands subset | I partial |
| !setunosticker | I U |

## Games

| Item | Status |
| --- | --- |
| TTT | I U + Mini App |
| UNO engine + Mini App + in-chat buttons | I U. Stickers B (no pack) |
| Chess FIDE chess.js perft 3 | I U |
| Ludo engine + Mini App | I U |
| Carrom physics + Mini App + WS shot | I U. Two-device B |
| Hockey sim + local 1:1 + WS room | I U Int FakeClients. Two-device B |
| Scrabble engine + Mini App | I U |
| Word scramble | I U |
| Seat rooms WS | I Int. Not phones |

## Apps

| Item | Status |
| --- | --- |
| Website glass marketing | I (not Lighthouse) |
| Mini App nav + posters | I |
| Group dashboard tabs + save API | I U settings repo |
| Postgres schema 001_init.sql | I. Live migrate B |
| pg Pool when DATABASE_URL | I untested live |
| Playwright / Lighthouse | B libnspr4 |

## Owner assets

| Personality.txt | Present |
| 7 posters | Present |
| Extra features §18 | None |
| Secrets | None in workspace |

**Vitest:** last run in this audit below. **Live: none.**
