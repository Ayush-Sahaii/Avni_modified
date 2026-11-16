# Two-device Hockey / Carrom (not run in this sandbox)

1. Deploy server with `PUBLIC_BASE_URL` and open Mini App on phone A and B.
2. Phone A: create room (`WS` `{"type":"create","game":"hockey"}`) — copy `roomId`.
3. Phone B: `{"type":"join","roomId":"...","userId":<telegram id>}`.
4. Both send `input` at ~60 Hz. Own mallet is local; opponent + puck from `hockey` snapshots.
5. Kill network on A, restore, `join` with same `userId` — seat must match.
6. Leave idle 24h — room swept.

**Status:** procedure only. Two-device verification has **not** been performed here.
