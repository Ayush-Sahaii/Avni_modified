# Assumptions

- Extra features (Section 18): none supplied.
- In-chat UNO stickers: catalogue exists; **empty until owner supplies file_ids**.
- Posters: seven owner webp files shipped; no Scrabble poster.
- Personality: full file in `config/personality/personality.txt`; no trigger JSON (owner said no).
- SQLite is not used in production. Tests use an in-memory settings store that mimics SQL; live Postgres needs `DATABASE_URL`.
- Master prompt file was truncated after Section 12 in the copy we received.
