export type LudoColor = "red" | "green" | "yellow" | "blue";

export interface Token {
  pathIndex: number; // -1 yard, 0-51 loop relative, 52-57 home column, 58 finished
}

export interface LudoState {
  colors: LudoColor[];
  tokens: Record<LudoColor, Token[]>;
  turn: number;
  dice: number | null;
  extra: boolean;
  sixStreak: number;
  winner: LudoColor | null;
  blocks: boolean;
}

const START: Record<LudoColor, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export function ludoCreate(colors: LudoColor[], blocks = false): LudoState {
  const tokens = {} as Record<LudoColor, Token[]>;
  for (const c of colors) tokens[c] = Array.from({ length: 4 }, () => ({ pathIndex: -1 }));
  return { colors, tokens, turn: 0, dice: null, extra: false, sixStreak: 0, winner: null, blocks };
}

export function ludoRoll(state: LudoState, value: number): LudoState {
  if (state.winner) throw new Error("game over");
  if (value < 1 || value > 6) throw new Error("bad dice");
  if (value === 6) {
    state.sixStreak += 1;
    if (state.sixStreak >= 3) {
      state.sixStreak = 0;
      state.dice = null;
      state.turn = (state.turn + 1) % state.colors.length;
      state.extra = false;
      return state;
    }
    state.extra = true;
  } else {
    state.sixStreak = 0;
    state.extra = false;
  }
  state.dice = value;
  return state;
}

function absPos(color: LudoColor, pathIndex: number): number | null {
  if (pathIndex < 0 || pathIndex >= 52) return null;
  return (START[color] + pathIndex) % 52;
}

export function ludoMoves(state: LudoState): number[] {
  const color = state.colors[state.turn]!;
  const dice = state.dice;
  if (!dice) return [];
  const toks = state.tokens[color]!;
  const out: number[] = [];
  toks.forEach((t, i) => {
    if (t.pathIndex === 58) return;
    if (t.pathIndex === -1) {
      if (dice === 6) out.push(i);
      return;
    }
    const next = t.pathIndex + dice;
    if (next > 58) return;
    if (next === 58 || next <= 57) out.push(i);
  });
  return out;
}

export function ludoMove(state: LudoState, tokenIndex: number): LudoState {
  const color = state.colors[state.turn]!;
  if (!ludoMoves(state).includes(tokenIndex)) throw new Error("illegal");
  const dice = state.dice!;
  const t = state.tokens[color]![tokenIndex]!;
  if (t.pathIndex === -1) t.pathIndex = 0;
  else t.pathIndex += dice;
  if (t.pathIndex === 58) {
    if (state.tokens[color]!.every((x) => x.pathIndex === 58)) state.winner = color;
  } else if (t.pathIndex < 52) {
    const pos = absPos(color, t.pathIndex)!;
    if (!SAFE.has(pos)) {
      for (const oc of state.colors) {
        if (oc === color) continue;
        for (const ot of state.tokens[oc]!) {
          const op = absPos(oc, ot.pathIndex);
          if (op === pos) ot.pathIndex = -1;
        }
      }
    }
  }
  state.dice = null;
  if (!state.extra && !state.winner) state.turn = (state.turn + 1) % state.colors.length;
  state.extra = false;
  return state;
}
