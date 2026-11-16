# ADR 0001 — Follow Section 8 stack

Status: Accepted

No deviation from Section 8.1. Redis is not added. Single process. Postgres is the system of record.

npm workspaces are used instead of pnpm/Turborepo because the sandbox has npm; behaviour is equivalent.
