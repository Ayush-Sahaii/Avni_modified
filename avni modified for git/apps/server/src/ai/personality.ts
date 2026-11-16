import { createHash } from "node:crypto";
import { readFileSync, existsSync, statSync } from "node:fs";

export interface PersonalityState {
  status: "ready" | "disabled";
  text: string;
  checksum: string | null;
  size: number;
  error: string | null;
  loadedAt: string | null;
}

const MAX = 200 * 1024;

export function loadPersonality(path: string): PersonalityState {
  try {
    if (!existsSync(path)) {
      return { status: "disabled", text: "", checksum: null, size: 0, error: "file missing", loadedAt: null };
    }
    const buf = readFileSync(path);
    if (buf.includes(0)) {
      return { status: "disabled", text: "", checksum: null, size: buf.length, error: "NUL bytes", loadedAt: null };
    }
    const text = buf.toString("utf8");
    if (!text.trim()) {
      return { status: "disabled", text: "", checksum: null, size: 0, error: "empty", loadedAt: null };
    }
    if (buf.length > MAX) {
      return { status: "disabled", text: "", checksum: null, size: buf.length, error: "too large", loadedAt: null };
    }
    return {
      status: "ready",
      text,
      checksum: createHash("sha256").update(buf).digest("hex"),
      size: buf.length,
      error: null,
      loadedAt: new Date().toISOString(),
    };
  } catch (err) {
    return { status: "disabled", text: "", checksum: null, size: 0, error: String(err), loadedAt: null };
  }
}

export function technicalWrapper(): string {
  return [
    "Follow the supplied personality specification exactly.",
    "Prefer explicitly specified responses verbatim.",
    "Stay within platform safety limits.",
    "Do not invent a character beyond the specification.",
  ].join(" ");
}

export const AI_UNAVAILABLE = "Chat is temporarily unavailable";
