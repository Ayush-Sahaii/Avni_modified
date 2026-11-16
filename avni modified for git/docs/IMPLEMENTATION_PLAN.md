# AVNI — Implementation Plan

Status: **Section 18 extra features were not supplied.** The owner also instructed: implement, do not stop at a plan. Per R8 (latest/specific owner statement wins), implementation proceeds with extra features treated as **not present**. Personality TXT and game posters were **not** attached.

## Owner inputs checklist (Section 20)

| Input | Present |
| --- | --- |
| Personality TXT | No — AI module DISABLED until provided |
| Game posters | No — `ALLOW_MISSING_POSTERS` placeholder art |
| Extra features (Section 18) | No |
| Bot token / DB / Render | No — `.env.example` only |

## Milestones

1. Monorepo, config validation, docs, CI skeleton
2. PostgreSQL schema + migrations + constraint tests
3. Command registry, guards pipeline, moderation/locks
4. Economy, family, whispers
5. Game rooms + engines (TTT, UNO, Chess, Ludo, Scramble, Carrom, Hockey)
6. AI module (blocked without personality file)
7. Mini App + website (monochrome glass)
8. Tests + TEST_REPORT

## Stack (Section 8 — no ADR deviation)

TypeScript, pnpm-style npm workspaces, Fastify, grammY, Drizzle + SQL, React+Vite, Vitest.
