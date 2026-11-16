# UNO sticker mode — missing owner inputs

Telegram can send stickers by `file_id` (`sendSticker`). There is **no** sticker pack in this repo.

To enable real sticker UNO:

1. Create or own a sticker set in @Stickers (original art, not Mattel).
2. For each card code (`red-0`…`wild4`), in a private chat with the bot as Dev: reply to that sticker with `!setunosticker red-5`.
3. Catalogue is in-memory (`unoStickers` map); persist to `action_media` when Postgres is connected.

Until every card has a `file_id`, `stickerPlayPayload` returns a **text** notice. Inline buttons are a **different** mode and are not sticker UNO.

Required from owner: 108+ sticker `file_id`s or a sticker set name.
