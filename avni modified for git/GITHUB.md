# Upload this project to GitHub

## Root folder to upload

Upload **the entire contents of this project root** — the folder that contains `package.json`, `apps/`, `packages/`, `config/`, `docs/`, `.env.example`, and `.gitignore`.

In this workspace that folder is:

```text
/home/user
```

Do **not** upload only `docs/` or a single file. Do **not** upload `node_modules/`, `.env`, or `uploads/`.

---

## What is included (keep these)

- `apps/server` — Telegram webhook, API, WebSocket rooms  
- `apps/web` — website + Mini App + `public/posters/*.webp`  
- `packages/shared` — commands, locks, game engines  
- `packages/db/migrations/001_init.sql`  
- `config/personality/personality.txt`  
- `assets/posters/`  
- `tests/` and Vitest/Playwright configs  
- `.github/workflows/ci.yml`  
- `.env.example`, `ENV_SETUP_GUIDE.md`, `README.md`, `docs/`  
- `package.json` **and** `package-lock.json`

## What is excluded (`.gitignore`)

`node_modules`, `dist`, `.env` (secrets), `uploads`, `test-results`, caches.

---

## Push to an **existing** GitHub repo

On your computer, copy this project into a clone of your repo (replace URLs/paths):

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git avni-github
cd avni-github

# Copy everything from the project root EXCEPT node_modules and .env
# If this tree is already the clone, skip copy.

git add -A
git status   # confirm .env is NOT listed; personality.txt and posters ARE listed
git commit -m "Avni platform: bot, Mini App, games, docs"
git push origin HEAD
```

If the repo already has commits, pull first (`git pull --rebase`) then add/commit/push.

Do not force-push unless you intend to overwrite remote history.

---

## After GitHub has the files

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO
cp .env.example .env
# edit .env — see ENV_SETUP_GUIDE.md
npm install
npm test
npm run dev:web      # Mini App / site
# npm run dev:server  # needs .env secrets
```

Apply `packages/db/migrations/001_init.sql` on Supabase, then set the Telegram webhook as in `docs/SETUP.md`.
