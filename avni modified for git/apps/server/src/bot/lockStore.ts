import type { LockAction, LockCategory } from "@avni/shared";

export const enabledLocks = new Map<string, Partial<Record<LockCategory, { enabled: boolean; action: LockAction }>>>();

export function setLock(chatId: number, cat: LockCategory, enabled: boolean, action: LockAction) {
  const cur = enabledLocks.get(String(chatId)) ?? {};
  if (cat === "all" && !enabled) {
    enabledLocks.set(String(chatId), {});
    return;
  }
  cur[cat] = { enabled, action };
  enabledLocks.set(String(chatId), cur);
}

export function locksOf(chatId: number) {
  return enabledLocks.get(String(chatId)) ?? {};
}
