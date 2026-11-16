import type { PersonalityState } from "./personality.js";
import { technicalWrapper } from "./personality.js";

export function assembleSystemPrompt(p: PersonalityState): string | null {
  if (p.status !== "ready" || !p.text) return null;
  return `${technicalWrapper()}\n\n--- PERSONALITY SPECIFICATION (verbatim) ---\n${p.text}`;
}

/** No canned personality replies in code. File examples are tone-only until owner confirms a trigger sidecar. */
export function triggerLayer(_normalizedUserText: string): string | null {
  return null;
}
