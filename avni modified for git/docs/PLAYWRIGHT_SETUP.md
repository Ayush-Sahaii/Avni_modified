# Playwright / Lighthouse — sandbox blocker

Chromium failed with `libnspr4.so`. This environment cannot `apt-get`.

On a normal Ubuntu/Debian host or CI image:

```bash
sudo apt-get install -y libnspr4 libnss3 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libgbm1 libasound2
npx playwright install chromium
npm run test:e2e
npx lighthouse http://127.0.0.1:5173 --preset=desktop --quiet --chrome-flags="--headless"
```

Tests live in `tests/e2e/site.spec.ts`. They have **not** passed here.
