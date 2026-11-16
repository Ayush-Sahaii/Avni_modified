# Risks

- Master prompt file truncated after Section 12 (no 13–22 body). Assumptions documented.
- Telegram bot-to-bot promotion lock cannot be verified without two real bots (MANUAL).
- Hockey 60 Hz physics and 1-frame input latency need real devices.
- Personality missing: AI blocked.
- No live DATABASE_URL: tests use sqlite-in-memory is **forbidden** for production; unit tests mock the DB layer; schema SQL is still shipped.
- Scope is very large; engines and UI are complete for core paths, some visual polish is iterative.
