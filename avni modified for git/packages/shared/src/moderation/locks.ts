export const LOCK_CATEGORIES = [
  "all",
  "text",
  "link",
  "sticker",
  "photo",
  "video",
  "file",
  "gif",
  "voice",
  "media",
  "biolink",
  "promotion",
] as const;

export type LockCategory = (typeof LOCK_CATEGORIES)[number];
export type LockAction = "delete" | "mute" | "kick" | "ban";

export const LOCK_ALIASES: Record<string, LockCategory> = {
  all: "all",
  everything: "all",
  text: "text",
  texts: "text",
  link: "link",
  links: "link",
  url: "link",
  urls: "link",
  sticker: "sticker",
  stickers: "sticker",
  photo: "photo",
  photos: "photo",
  pic: "photo",
  pics: "photo",
  image: "photo",
  images: "photo",
  video: "video",
  videos: "video",
  file: "file",
  files: "file",
  document: "file",
  documents: "file",
  doc: "file",
  docs: "file",
  gif: "gif",
  gifs: "gif",
  animation: "gif",
  voice: "voice",
  voices: "voice",
  voicemessage: "voice",
  vm: "voice",
  media: "media",
  biolink: "biolink",
  bio: "biolink",
  biolinks: "biolink",
  bio_link: "biolink",
  promotion: "promotion",
  promo: "promotion",
  promotions: "promotion",
  botpromo: "promotion",
  botlink: "promotion",
  botlinks: "promotion",
  antipromo: "promotion",
  botads: "promotion",
  ads: "promotion",
};

export const COMMON_TLDS = new Set([
  "com", "org", "net", "io", "co", "in", "uk", "us", "dev", "app", "me", "info", "xyz", "ai",
]);

export interface MessageView {
  text?: string;
  caption?: string;
  entities?: Array<{ type: string; url?: string }>;
  captionEntities?: Array<{ type: string; url?: string }>;
  hasPhoto?: boolean;
  hasVideo?: boolean;
  hasVideoNote?: boolean;
  hasDocument?: boolean;
  hasAnimation?: boolean;
  hasAudio?: boolean;
  hasSticker?: boolean;
  hasVoice?: boolean;
  isCommandToThisBot?: boolean;
  fromIsBot?: boolean;
  viaBot?: boolean;
  inlineUrlButtons?: string[];
  bio?: string;
}

const URL_RE =
  /(?:https?:\/\/|www\.)[^\s<>]+|(?:t\.me|telegram\.me|telegram\.dog)\/[^\s<>]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(com|org|net|io|co|in|uk|us|dev|app|me|info|xyz|ai)\b/i;

export function hasLink(msg: MessageView): boolean {
  const blobs = [msg.text, msg.caption, ...(msg.inlineUrlButtons ?? [])].filter(Boolean).join(" ");
  if (URL_RE.test(blobs)) return true;
  const ents = [...(msg.entities ?? []), ...(msg.captionEntities ?? [])];
  for (const e of ents) {
    if (e.type === "url" || e.type === "text_link") return true;
  }
  return false;
}

export function hasBioLink(bio?: string): boolean {
  if (!bio) return false;
  return URL_RE.test(bio);
}

export function categoriesTriggered(msg: MessageView): LockCategory[] {
  const hit: LockCategory[] = [];
  const texty = Boolean(msg.text) && !msg.isCommandToThisBot;
  if (texty) hit.push("text");
  if (hasLink(msg)) hit.push("link");
  if (msg.hasSticker) hit.push("sticker");
  if (msg.hasPhoto) hit.push("photo");
  if (msg.hasVideo || msg.hasVideoNote) hit.push("video");
  if ((msg.hasDocument && !msg.hasAnimation) || msg.hasAudio) hit.push("file");
  if (msg.hasAnimation) hit.push("gif");
  if (msg.hasVoice) hit.push("voice");
  if (msg.hasPhoto || msg.hasVideo || msg.hasVideoNote || ((msg.hasDocument && !msg.hasAnimation) || msg.hasAudio) || msg.hasAnimation) {
    hit.push("media");
  }
  if (hasBioLink(msg.bio)) hit.push("biolink");
  const promoLink = hasLink(msg) || (msg.inlineUrlButtons && msg.inlineUrlButtons.length > 0);
  if (msg.fromIsBot && promoLink) hit.push("promotion");
  if (msg.viaBot && promoLink) hit.push("promotion");
  return hit;
}

export function parseLockCategory(raw: string): LockCategory | null {
  return LOCK_ALIASES[raw.toLowerCase()] ?? null;
}

export function parseLockAction(raw?: string): LockAction {
  if (!raw) return "delete";
  const a = raw.toLowerCase();
  if (a === "mute" || a === "kick" || a === "ban" || a === "delete") return a;
  return "delete";
}

export function parseMuteSeconds(raw?: string): number {
  if (!raw) return 3600;
  const m = raw.match(/^(\d+)\s*(s|m|h|d|w)?$/i);
  if (!m) return 3600;
  const n = Number(m[1]);
  const u = (m[2] ?? "m").toLowerCase();
  const mul = u === "s" ? 1 : u === "m" ? 60 : u === "h" ? 3600 : u === "d" ? 86400 : 604800;
  const sec = n * mul;
  if (sec < 60) return 60;
  if (sec > 365 * 86400) return 365 * 86400;
  return sec;
}

export interface EnforcementDecision {
  category: LockCategory;
  action: LockAction;
  delete: true;
}

export function decideEnforcement(opts: {
  triggered: LockCategory[];
  enabled: Partial<Record<LockCategory, { enabled: boolean; action: LockAction }>>;
  exempt: boolean;
}): EnforcementDecision | null {
  if (opts.exempt) return null;
  const allOn = opts.enabled.all?.enabled;
  const cats = allOn ? [...LOCK_CATEGORIES.filter((c) => c !== "all"), ...opts.triggered] : opts.triggered;
  const unique = [...new Set(cats)];
  for (const cat of unique) {
    if (cat === "all") continue;
    const rule = opts.enabled[cat];
    const on = allOn || rule?.enabled;
    if (!on) continue;
    const action = rule?.action ?? opts.enabled.all?.action ?? "delete";
    return { category: cat, action, delete: true };
  }
  return null;
}
