export type Relation =
  | "husband"
  | "wife"
  | "boyfriend"
  | "girlfriend"
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "brother"
  | "sister"
  | "friend"
  | "bestie"
  | "enemy";

export const SINGLE_SLOT: Relation[] = [
  "husband",
  "wife",
  "boyfriend",
  "girlfriend",
  "father",
  "mother",
];

export const PARTNER: Relation[] = ["husband", "wife", "boyfriend", "girlfriend"];

export function canSetRelation(
  existing: Array<{ userId: number; relation: Relation }>,
  relation: Relation,
  targetId: number,
): { ok: true } | { ok: false; reason: string } {
  if (SINGLE_SLOT.includes(relation)) {
    const taken = existing.find((e) => e.relation === relation);
    if (taken && taken.userId !== targetId) {
      return { ok: false, reason: `That ${relation} slot is already filled.` };
    }
  }
  if (PARTNER.includes(relation)) {
    const other = existing.find((e) => PARTNER.includes(e.relation) && e.relation !== relation);
    if (other) return { ok: false, reason: "A partner slot is already filled." };
  }
  return { ok: true };
}
