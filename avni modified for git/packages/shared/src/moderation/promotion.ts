import { hasLink, type MessageView } from "./locks.js";

export type PromotionScope = "bots_only" | "bots_and_via_bot";

export interface PromotionInput extends MessageView {
  thisBotId?: number;
  fromId?: number;
  viaBotId?: number;
  viaBotUsername?: string;
  allowBots?: Array<number | string>;
  allowDomains?: string[];
}

export interface Readiness {
  botIsAdmin: boolean;
  privacyModeOff: boolean;
  botToBotMode: boolean;
  canDelete: boolean;
  ready: boolean;
  missing: string[];
}

export function promotionReadiness(flags: Omit<Readiness, "ready" | "missing">): Readiness {
  const missing: string[] = [];
  if (!flags.botIsAdmin) missing.push("Bot must be a group administrator.");
  if (!flags.privacyModeOff) missing.push("Disable Group Privacy Mode in BotFather.");
  if (!flags.botToBotMode) missing.push("Enable Bot-to-Bot Communication Mode in BotFather.");
  if (!flags.canDelete) missing.push("Grant Delete Messages.");
  return { ...flags, ready: missing.length === 0, missing };
}

function domainAllowed(url: string, allow: string[]): boolean {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
    return allow.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function isPromotional(msg: PromotionInput): boolean {
  const urls = [
    ...(msg.inlineUrlButtons ?? []),
    ...(msg.entities ?? []).filter((e) => e.type === "url" || e.type === "text_link").map((e) => e.url ?? ""),
  ];
  if (hasLink(msg) || urls.length) return true;
  return false;
}

export function shouldDeletePromotion(
  msg: PromotionInput,
  scope: PromotionScope = "bots_only",
): { delete: boolean; reason: string } {
  if (msg.fromId && msg.thisBotId && msg.fromId === msg.thisBotId) {
    return { delete: false, reason: "self" };
  }
  const senderIsOtherBot = Boolean(msg.fromIsBot) && msg.fromId !== msg.thisBotId;
  const via = Boolean(msg.viaBot);
  const promo = isPromotional(msg);
  if (!promo) return { delete: false, reason: "not_promotional" };

  const allowHit =
    (msg.fromId && msg.allowBots?.some((b) => String(b) === String(msg.fromId))) ||
    (msg.viaBotUsername && msg.allowBots?.some((b) => String(b).replace(/^@/, "").toLowerCase() === msg.viaBotUsername!.replace(/^@/, "").toLowerCase()));

  if (allowHit) return { delete: false, reason: "allowlist" };

  if (senderIsOtherBot) return { delete: true, reason: "bot_promo" };

  if (via && scope === "bots_and_via_bot") {
    return { delete: true, reason: "via_bot_promo" };
  }
  if (via && scope === "bots_only") {
    return { delete: false, reason: "human_via_bot_uses_link_lock" };
  }
  return { delete: false, reason: "human" };
}
