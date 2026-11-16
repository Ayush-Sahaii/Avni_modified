export type UnoColor = "red" | "yellow" | "green" | "blue";
export type UnoValue =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "skip" | "reverse" | "draw2" | "wild" | "wild4";

export interface UnoCard {
  id: string;
  color: UnoColor | "black";
  value: UnoValue;
}

export interface UnoPlayer {
  seat: number;
  hand: UnoCard[];
  calledUno: boolean;
}

export interface UnoState {
  players: UnoPlayer[];
  deck: UnoCard[];
  discard: UnoCard[];
  currentColor: UnoColor;
  direction: 1 | -1;
  current: number;
  pendingDraw: number;
  winnerOrder: number[];
  consecutiveTimeouts: number[];
}

let seq = 0;
function card(color: UnoCard["color"], value: UnoValue): UnoCard {
  seq += 1;
  return { id: `${color}-${value}-${seq}`, color, value };
}

export function buildDeck(): UnoCard[] {
  seq = 0;
  const colors: UnoColor[] = ["red", "yellow", "green", "blue"];
  const deck: UnoCard[] = [];
  for (const c of colors) {
    deck.push(card(c, "0"));
    for (const v of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"] as UnoValue[]) {
      deck.push(card(c, v), card(c, v));
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push(card("black", "wild"));
    deck.push(card("black", "wild4"));
  }
  return shuffle(deck);
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

export function unoCreate(playerCount: number, rng: () => number = Math.random): UnoState {
  let deck = buildDeck();
  if (rng !== Math.random) {
    deck = deterministicShuffle(buildDeck(), rng);
  }
  const players: UnoPlayer[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({ seat: i, hand: deck.splice(0, 7), calledUno: false });
  }
  let start = deck.shift()!;
  while (start.value === "wild4") {
    deck.push(start);
    start = deck.shift()!;
  }
  const color: UnoColor = start.color === "black" ? "red" : start.color;
  return {
    players,
    deck,
    discard: [start],
    currentColor: color,
    direction: 1,
    current: 0,
    pendingDraw: 0,
    winnerOrder: [],
    consecutiveTimeouts: Array(playerCount).fill(0),
  };
}

function deterministicShuffle(deck: UnoCard[], rng: () => number): UnoCard[] {
  const b = deck.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

export function top(state: UnoState): UnoCard {
  return state.discard[state.discard.length - 1]!;
}

export function canPlay(state: UnoState, card: UnoCard, hand: UnoCard[]): boolean {
  if (card.value === "wild") return true;
  if (card.value === "wild4") {
    return !hand.some((c) => c.color === state.currentColor);
  }
  if (card.color === state.currentColor) return true;
  if (card.value === top(state).value) return true;
  return false;
}

function nextSeat(state: UnoState, from = state.current, steps = 1): number {
  const n = state.players.length;
  let s = from;
  for (let i = 0; i < steps; i++) {
    do {
      s = (s + state.direction + n) % n;
    } while (state.winnerOrder.includes(s) && state.winnerOrder.length < n - 1);
  }
  return s;
}

function draw(state: UnoState, n: number): UnoCard[] {
  const out: UnoCard[] = [];
  for (let i = 0; i < n; i++) {
    if (!state.deck.length) {
      const keep = state.discard.pop()!;
      state.deck = shuffle(state.discard);
      state.discard = [keep];
    }
    const c = state.deck.shift();
    if (c) out.push(c);
  }
  return out;
}

export function playCard(
  state: UnoState,
  seat: number,
  cardId: string,
  chosenColor?: UnoColor,
  wild4Legal = true,
): UnoState {
  if (seat !== state.current) throw new Error("not your turn");
  const p = state.players[seat]!;
  const idx = p.hand.findIndex((c) => c.id === cardId);
  if (idx < 0) throw new Error("card not in hand");
  const card = p.hand[idx]!;
  const legalWild4 = canPlay(state, card, p.hand);
  if (card.value !== "wild4" && !canPlay(state, { ...card, value: card.value === "wild4" ? "wild" : card.value }, p.hand.filter((_, i) => i !== idx).concat(card))) {
    if (!canPlay(state, card, p.hand)) throw new Error("illegal card");
  }
  if (card.value !== "wild4" && !canPlay(state, card, p.hand)) throw new Error("illegal card");
  if (card.value === "wild4" && !wild4Legal && !legalWild4) {
    /* bluff allowed */
  } else if (card.value === "wild4" && !legalWild4 && wild4Legal === false) {
    /* still allowed as bluff */
  }
  p.hand.splice(idx, 1);
  state.discard.push(card);
  if (card.color !== "black") state.currentColor = card.color;
  else {
    if (!chosenColor) throw new Error("choose a colour");
    state.currentColor = chosenColor;
  }
  if (p.hand.length === 1 && !p.calledUno) {
    /* catch window remains open until next action */
  }
  if (p.hand.length === 0) {
    state.winnerOrder.push(seat);
    if (state.winnerOrder.length >= state.players.length - 1) return state;
  }
  applyEffect(state, card);
  return state;
}

function applyEffect(state: UnoState, card: UnoCard) {
  if (card.value === "skip") {
    state.current = nextSeat(state, state.current, 2);
    return;
  }
  if (card.value === "reverse") {
    if (state.players.length === 2) {
      state.current = nextSeat(state, state.current, 2);
      return;
    }
    state.direction = state.direction === 1 ? -1 : 1;
    state.current = nextSeat(state);
    return;
  }
  if (card.value === "draw2") {
    const t = nextSeat(state);
    state.players[t]!.hand.push(...draw(state, 2));
    state.current = nextSeat(state, t);
    return;
  }
  if (card.value === "wild4") {
    state.pendingDraw = 4;
    state.current = nextSeat(state);
    return;
  }
  state.current = nextSeat(state);
}

export function challengeWild4(state: UnoState, challenger: number): "caught" | "wrong" {
  const card = top(state);
  if (card.value !== "wild4") throw new Error("no wild4");
  const bluffer = nextSeat({ ...state, direction: (state.direction === 1 ? -1 : 1) as 1 | -1, current: state.current });
  const prev = (state.current - state.direction + state.players.length) % state.players.length;
  const blufferSeat = prev;
  const hadColor = state.players[blufferSeat]!.hand.some((c) => c.color === state.currentColor);
  if (hadColor) {
    state.players[blufferSeat]!.hand.push(...draw(state, 4));
    state.pendingDraw = 0;
    return "caught";
  }
  state.players[challenger]!.hand.push(...draw(state, 6));
  state.pendingDraw = 0;
  state.current = nextSeat(state);
  return "wrong";
}

export function drawOne(state: UnoState, seat: number): UnoCard | null {
  if (seat !== state.current) throw new Error("not your turn");
  const [c] = draw(state, 1);
  if (!c) return null;
  state.players[seat]!.hand.push(c);
  if (canPlay(state, c, state.players[seat]!.hand)) return c;
  state.current = nextSeat(state);
  return null;
}

export function callUno(state: UnoState, seat: number) {
  const p = state.players[seat]!;
  if (p.hand.length === 1) p.calledUno = true;
}

export function catchUno(state: UnoState, catcher: number, target: number) {
  const p = state.players[target]!;
  if (p.hand.length === 1 && !p.calledUno && catcher !== target) {
    p.hand.push(...draw(state, 2));
  }
}

export function publicUnoView(state: UnoState, viewer: number) {
  return {
    current: state.current,
    currentColor: state.currentColor,
    direction: state.direction,
    top: top(state),
    counts: state.players.map((p) => p.hand.length),
    hand: state.players[viewer]?.hand ?? [],
    winners: state.winnerOrder,
  };
}
