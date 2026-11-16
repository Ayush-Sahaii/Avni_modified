/** Catalogue of Telegram sticker file_ids keyed by card code (e.g. red-5, wild4). Empty until Devs reply-save stickers. */

export const unoStickers = new Map<string, string>();

export function setUnoSticker(code: string, fileId: string) {
  if (!fileId) throw new Error("missing file_id");
  unoStickers.set(code.toLowerCase(), fileId);
}

export function getUnoSticker(code: string): string | undefined {
  return unoStickers.get(code.toLowerCase());
}

export function stickerPlayPayload(code: string): { method: "sendSticker"; sticker: string } | { method: "sendMessage"; text: string } {
  const id = getUnoSticker(code);
  if (!id) {
    return {
      method: "sendMessage",
      text: `No sticker on file for ${code}. A Dev must reply to a sticker with !setunosticker ${code}. This is not sticker UNO until the catalogue is filled.`,
    };
  }
  return { method: "sendSticker", sticker: id };
}
