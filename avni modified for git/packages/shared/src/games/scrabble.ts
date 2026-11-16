export const SCRABBLE_BAG: Record<string, { count: number; score: number }> = {
  A: { count: 9, score: 1 }, B: { count: 2, score: 3 }, C: { count: 2, score: 3 },
  D: { count: 4, score: 2 }, E: { count: 12, score: 1 }, F: { count: 2, score: 4 },
  G: { count: 3, score: 2 }, H: { count: 2, score: 4 }, I: { count: 9, score: 1 },
  J: { count: 1, score: 8 }, K: { count: 1, score: 5 }, L: { count: 4, score: 1 },
  M: { count: 2, score: 3 }, N: { count: 6, score: 1 }, O: { count: 8, score: 1 },
  P: { count: 2, score: 3 }, Q: { count: 1, score: 10 }, R: { count: 6, score: 1 },
  S: { count: 4, score: 1 }, T: { count: 6, score: 1 }, U: { count: 4, score: 1 },
  V: { count: 2, score: 4 }, W: { count: 2, score: 4 }, X: { count: 1, score: 8 },
  Y: { count: 2, score: 4 }, Z: { count: 1, score: 10 }, _: { count: 2, score: 0 },
};

export const DICT = new Set(
  [
    "HELLO", "WORLD", "GAME", "PLAY", "WORD", "TILE", "BOARD", "SCORE", "AVNI",
    "CHAT", "ROOM", "TURN", "MOVE", "DRAW", "PASS", "STAR", "TREE", "RAIN", "WIND",
    "FIRE", "WATER", "EARTH", "LIGHT", "NIGHT", "DAY", "OPEN", "CLOSE", "READ",
    "WRITE", "CODE", "TEST", "LOCK", "LINK", "BOT", "USER", "TEAM", "WIN", "LOSE",
    "QUEEN", "KING", "PAWN", "ROOK", "CARD", "DICE", "LUDO", "HOCKEY", "CARROM",
    "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "CAN", "HER", "WAS",
    "ONE", "OUR", "OUT", "HAS", "HAD", "HOT", "HAT", "CAT", "BAT", "RAT", "SAT",
    "ATE", "EAT", "TEA", "SEA", "SEE", "SET", "NET", "TEN", "PEN", "PIN", "PAN",
    "MAN", "MAP", "NAP", "TAP", "TOP", "POT", "DOT", "DOG", "GOD", "LOG", "LEG",
    "LET", "GET", "GOT", "GOO", "TOO", "TOE", "TONE", "NOTE", "NONE", "DONE",
    "BONE", "LONE", "LINE", "FINE", "FIND", "MIND", "MINE", "NINE", "WINE", "WIND",
  ].concat(["QI", "ZA", "AX", "EX", "OX", "JO", "KA", "KI"]),
);

export type CellMult = "none" | "dl" | "tl" | "dw" | "tw";

export function premium(r: number, c: number): CellMult {
  if ((r === 7 && c === 7) || [0, 7, 14].includes(r) && [0, 7, 14].includes(c) && !(r === 7 && c === 7)) {
    if (r === 7 && c === 7) return "dw";
    if ((r === 0 || r === 14) && (c === 0 || c === 14)) return "tw";
  }
  const tw = [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]];
  if (tw.some(([a, b]) => a === r && b === c)) return "tw";
  const dw = [[1, 1], [2, 2], [3, 3], [4, 4], [13, 13], [12, 12], [11, 11], [10, 10], [1, 13], [2, 12], [3, 11], [4, 10], [13, 1], [12, 2], [11, 3], [10, 4]];
  if (dw.some(([a, b]) => a === r && b === c)) return "dw";
  if ((r + c) % 8 === 3) return "dl";
  if ((r + c) % 7 === 1 && r !== 7) return "tl";
  return "none";
}

export interface ScrabbleState {
  board: (string | null)[];
  racks: string[][];
  bag: string[];
  scores: number[];
  turn: number;
  first: boolean;
}

function makeBag(): string[] {
  const b: string[] = [];
  for (const [ch, { count }] of Object.entries(SCRABBLE_BAG)) {
    for (let i = 0; i < count; i++) b.push(ch);
  }
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

export function scrabbleCreate(players = 2): ScrabbleState {
  const bag = makeBag();
  const racks = Array.from({ length: players }, () => bag.splice(0, 7));
  return { board: Array(225).fill(null), racks, bag, scores: Array(players).fill(0), turn: 0, first: true };
}

export function scoreWord(letters: Array<{ r: number; c: number; ch: string; fresh: boolean }>): number {
  let wordMult = 1;
  let sum = 0;
  for (const L of letters) {
    const sc = SCRABBLE_BAG[L.ch]?.score ?? 0;
    const prem = L.fresh ? premium(L.r, L.c) : "none";
    if (prem === "dl") sum += sc * 2;
    else if (prem === "tl") sum += sc * 3;
    else sum += sc;
    if (L.fresh && prem === "dw") wordMult *= 2;
    if (L.fresh && prem === "tw") wordMult *= 3;
  }
  return sum * wordMult;
}

export function placeWord(
  state: ScrabbleState,
  tiles: Array<{ rackIndex: number; r: number; c: number }>,
): ScrabbleState {
  if (tiles.length === 0) throw new Error("empty");
  const rack = state.racks[state.turn]!.slice();
  const board = state.board.slice();
  const placed: Array<{ r: number; c: number; ch: string; fresh: boolean }> = [];
  for (const t of tiles) {
    const ch = rack[t.rackIndex];
    if (!ch) throw new Error("bad rack");
    const idx = t.r * 15 + t.c;
    if (board[idx]) throw new Error("occupied");
    board[idx] = ch === "_" ? "A" : ch;
    placed.push({ r: t.r, c: t.c, ch: board[idx]!, fresh: true });
    rack[t.rackIndex] = "";
  }
  const word = placed
    .sort((a, b) => a.r - b.r || a.c - b.c)
    .map((p) => p.ch)
    .join("");
  if (!DICT.has(word) && word.length > 1) throw new Error("not in dictionary");
  if (word.length === 1 && state.first) throw new Error("first word too short");
  const pts = scoreWord(placed);
  const nextRack = rack.filter(Boolean);
  while (nextRack.length < 7 && state.bag.length) nextRack.push(state.bag.shift()!);
  const racks = state.racks.slice();
  racks[state.turn] = nextRack;
  const scores = state.scores.slice();
  scores[state.turn] += pts;
  return {
    ...state,
    board,
    racks,
    scores,
    turn: (state.turn + 1) % state.racks.length,
    first: false,
  };
}

export function publicScrabble(state: ScrabbleState, viewer: number) {
  return {
    board: state.board,
    rack: state.racks[viewer] ?? [],
    scores: state.scores,
    turn: state.turn,
    bag: state.bag.length,
  };
}
