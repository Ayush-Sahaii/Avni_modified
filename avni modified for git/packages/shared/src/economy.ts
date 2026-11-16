export function applyLedger(balance: number, delta: number, infinite = false): number {
  if (infinite) return balance;
  const next = balance + delta;
  if (next < 0) throw new Error("insufficient funds");
  return next;
}

export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let remaining = xp;
  let need = 100;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = Math.floor(need * 1.15);
  }
  return { level, into: remaining, need };
}
