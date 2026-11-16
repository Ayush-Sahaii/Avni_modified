import { resolveCommand, categoriesTriggered, decideEnforcement, shouldDeletePromotion, type MessageView } from "@avni/shared";
import type { PersonalityState } from "../ai/personality.js";
import { completeChat } from "../ai/groq.js";
import { aiHistory, chatOff, remember } from "../store/memory.js";
import { handleNamedCommand, reply } from "./commands.js";
import { locksOf, setLock } from "./lockStore.js";
import { startUno, unoCallback } from "./inChatUno.js";
import { forceSubByChat } from "./forceSubStore.js";
import { forceSubscribeCheck } from "../telegram/api.js";

export interface BotCtx {
  personality: PersonalityState;
  setMaintenance: (v: boolean) => void;
  maintenance: () => boolean;
}

const DEV_IDS = () =>
  (process.env.DEV_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);

export async function handleUpdate(
  update: Record<string, unknown>,
  ctx: BotCtx,
): Promise<Record<string, unknown> | null> {
  const cq = update.callback_query as { data?: string; message?: { chat?: { id?: number } }; id?: string } | undefined;
  if (cq?.data?.startsWith("uno:")) {
    const chatId = cq.message?.chat?.id ?? 0;
    const out = unoCallback(chatId, cq.data.slice(4));
    return { method: "answerCallbackQuery", callback_query_id: cq.id, text: out.text };
  }

  const message = (update.message ?? update.edited_message) as Record<string, unknown> | undefined;
  if (!message) return { ok: true, ignored: true };

  const text = String(message.text ?? message.caption ?? "");
  const from = (message.from ?? {}) as { id?: number; is_bot?: boolean };
  const chat = (message.chat ?? {}) as { id?: number; type?: string };
  const botUsername = process.env.BOT_USERNAME ?? "AvniBot";
  const isDev = DEV_IDS().includes(from.id ?? 0);
  const fromId = from.id ?? 0;

  const cmd = resolveCommand(text, botUsername);
  if (cmd) {
    if (cmd.permission === "dev" && !isDev) return { ok: true, silent: true };
    if (text.startsWith("!") && !isDev) return { ok: true, silent: true };
    if (cmd.name === "chatoff") {
      chatOff.add(chat.id ?? 0);
      return reply(chat.id, "AI chat is off in this chat.");
    }
    if (cmd.name === "chaton") {
      chatOff.delete(chat.id ?? 0);
      return reply(chat.id, "AI chat is on in this chat.");
    }
    if (cmd.name === "setunosticker" || text.startsWith("!setunosticker")) {
      if (!isDev) return { ok: true, silent: true };
      const code = text.split(/\s+/)[1] ?? "";
      const sticker = (message as { reply_to_message?: { sticker?: { file_id?: string } } }).reply_to_message?.sticker?.file_id;
      if (!sticker || !code) return reply(chat.id, "Reply to a sticker: !setunosticker red-5");
      const { setUnoSticker } = await import("./unoStickers.js");
      setUnoSticker(code, sticker);
      return reply(chat.id, `Stored sticker file_id for ${code}.`);
    }
    if (cmd.name === "uno") {
      const v = startUno(chat.id ?? 0);
      return reply(chat.id, `UNO started. Colour ${v.currentColor}. Use Mini App for the full table.`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Draw", callback_data: "uno:draw" }],
            ...v.hand.slice(0, 6).map((c) => [{ text: `${c.color} ${c.value}`, callback_data: `uno:play:${c.id}` }]),
          ],
        },
      });
    }
    if (cmd.name === "lock") {
      const handled = handleNamedCommand({
        name: cmd.name,
        text,
        fromId,
        chatId: chat.id,
        isDev,
        personality: ctx.personality,
        setMaintenance: ctx.setMaintenance,
      });
      const cat = text.split(/\s+/)[1];
      const { parseLockCategory, parseLockAction } = await import("@avni/shared");
      const c = parseLockCategory(cat ?? "");
      if (c && chat.id) setLock(chat.id, c, true, parseLockAction(text.split(/\s+/)[2]));
      return handled;
    }
    if (cmd.name === "unlock") {
      const { parseLockCategory } = await import("@avni/shared");
      const c = parseLockCategory(text.split(/\s+/)[1] ?? "");
      if (c && chat.id) setLock(chat.id, c, false, "delete");
    }
    const handled = handleNamedCommand({
      name: cmd.name,
      text,
      fromId,
      chatId: chat.id,
      isDev,
      personality: ctx.personality,
      setMaintenance: ctx.setMaintenance,
    });
    if (handled) return handled;
    return reply(chat.id, cmd.help);
  }

  const view: MessageView = {
    text,
    fromIsBot: Boolean(from.is_bot),
    isCommandToThisBot: false,
    viaBot: Boolean((message as { via_bot?: unknown }).via_bot),
  };
  const promo = shouldDeletePromotion({
    ...view,
    fromId,
    thisBotId: Number(process.env.BOT_ID ?? 0),
  });
  const enabled = locksOf(chat.id ?? 0);
  if (promo.delete && enabled.promotion?.enabled) {
    return { method: "deleteMessage", chat_id: chat.id, message_id: message.message_id, reason: promo.reason };
  }
  const decision = decideEnforcement({
    triggered: categoriesTriggered(view),
    enabled,
    exempt: isDev,
  });
  if (decision) {
    return { method: "deleteMessage", chat_id: chat.id, message_id: message.message_id };
  }

  if (from.is_bot) return { ok: true };
  const fs = forceSubByChat.get(String(chat.id ?? 0));
  if (fs?.enabled && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const sub = await forceSubscribeCheck({
        channelId: fs.channelId,
        userId: fromId,
        failOpen: fs.failOpen,
      });
      if (!sub.ok) {
        return reply(chat.id, "Join the required channel before chatting.");
      }
    } catch (err) {
      console.error("forcesub", err);
      if (!fs.failOpen) return reply(chat.id, "Could not verify channel membership.");
    }
  }
  if (chatOff.has(chat.id ?? 0)) return { ok: true };

  const named = process.env.BOT_DISPLAY_NAME ?? "Avni";
  const addressed =
    chat.type === "private" ||
    text.toLowerCase().includes(named.toLowerCase()) ||
    Boolean(message.reply_to_message);
  if (!addressed) return { ok: true };

  const history = aiHistory.get(chat.id ?? 0) ?? [];
  const out = await completeChat({
    personality: ctx.personality,
    userText: text,
    history,
  });
  if (out.source === "model") {
    remember(chat.id ?? 0, { role: "user", content: text });
    remember(chat.id ?? 0, { role: "assistant", content: out.text });
  }
  return reply(chat.id, out.text);
}
