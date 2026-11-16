import { helpText, parseLockAction, parseLockCategory, TRUTHS, DARES, levelFromXp } from "@avni/shared";
import { addCoins, coinsOf, xpMap } from "../store/memory.js";
import type { PersonalityState } from "../ai/personality.js";

const mini = () => process.env.MINI_APP_URL ?? process.env.PUBLIC_BASE_URL;

export function reply(chatId: unknown, text: string, extra?: Record<string, unknown>) {
  return { method: "sendMessage", chat_id: chatId, text, ...extra };
}

export function handleNamedCommand(opts: {
  name: string;
  text: string;
  fromId: number;
  chatId: unknown;
  isDev: boolean;
  personality: PersonalityState;
  setMaintenance: (v: boolean) => void;
}): Record<string, unknown> | null {
  const { name, text, fromId, chatId, isDev, personality } = opts;
  const appBtn = {
    reply_markup: { inline_keyboard: [[{ text: "Open Mini App", web_app: { url: mini() } }]] },
  };

  switch (name) {
    case "help":
      return reply(chatId, helpText());
    case "start":
      return reply(chatId, "Welcome to Avni. Open the Mini App to play and manage your groups.", appBtn);
    case "id":
      return reply(chatId, `User ID: ${fromId}\nChat ID: ${String(chatId)}`);
    case "webapp":
    case "games":
    case "ludo":
    case "carrom":
    case "icehockey":
    case "scrabble":
    case "uno":
    case "chess":
    case "tictactoe":
    case "scramble":
      return reply(chatId, "Open this game in the Mini App.", appBtn);
    case "coins":
      return reply(chatId, `Balance: ${coinsOf(fromId)} coins.`);
    case "give": {
      const n = Number(text.split(/\s+/).pop());
      if (!Number.isFinite(n) || n <= 0) return reply(chatId, "Usage: /give <user> <amount>");
      try {
        addCoins(fromId, -n);
        return reply(chatId, `Sent ${n} coins.`);
      } catch {
        return reply(chatId, "Not enough coins.");
      }
    }
    case "level": {
      const xp = xpMap.get(fromId) ?? 0;
      const lv = levelFromXp(xp);
      return reply(chatId, `Level ${lv.level} · ${xp} XP (${lv.into}/${lv.need} to next).`);
    }
    case "truth":
      return reply(chatId, TRUTHS[Math.floor(Math.random() * TRUTHS.length)]!);
    case "dare":
      return reply(chatId, DARES[Math.floor(Math.random() * DARES.length)]!);
    case "reset":
      return reply(chatId, "Chat memory cleared.");
    case "lock": {
      const parts = text.split(/\s+/).slice(1);
      const cat = parseLockCategory(parts[0] ?? "");
      if (!cat) return reply(chatId, "Usage: /lock <category> [delete|mute|kick|ban]");
      return reply(chatId, `Lock ${cat} enabled with action ${parseLockAction(parts[1])}.`);
    }
    case "unlock": {
      const cat = parseLockCategory(text.split(/\s+/)[1] ?? "");
      if (!cat) return reply(chatId, "Usage: /unlock <category>");
      return reply(chatId, `Lock ${cat} disabled.`);
    }
    case "locks":
      return reply(chatId, "No locks enabled. Use /lock <category>.");
    case "maintenance":
      if (!isDev) return { ok: true, silent: true };
      opts.setMaintenance(/on/i.test(text));
      return reply(chatId, `Maintenance ${/on/i.test(text) ? "on" : "off"}.`);
    case "reloadpersonality":
      if (!isDev) return { ok: true, silent: true };
      return reply(chatId, `Personality status: ${personality.status} size=${personality.size}`);
    default:
      return null;
  }
}
