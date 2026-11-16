/** Process-local store used when DATABASE_URL is unset. Not for production multi-instance. */

export const wallets = new Map<number, number>();
export const xpMap = new Map<number, number>();
export const aiHistory = new Map<number, Array<{ role: "user" | "assistant"; content: string }>>();
export const chatOff = new Set<number>();

export function coinsOf(id: number): number {
  if (!wallets.has(id)) wallets.set(id, 100);
  return wallets.get(id)!;
}

export function addCoins(id: number, delta: number): number {
  const n = coinsOf(id) + delta;
  if (n < 0) throw new Error("insufficient funds");
  wallets.set(id, n);
  return n;
}

export function remember(chatId: number, turn: { role: "user" | "assistant"; content: string }) {
  const list = aiHistory.get(chatId) ?? [];
  list.push(turn);
  while (list.length > 10) list.shift();
  aiHistory.set(chatId, list);
}
