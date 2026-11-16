/** Minimal chess: enough for FIDE basics used in tests. Prefer chess.js in production server. */

export type ChessPiece = "P" | "N" | "B" | "R" | "Q" | "K" | "p" | "n" | "b" | "r" | "q" | "k" | null;
export interface ChessState {
  board: ChessPiece[]; // 64, a1=0
  white: boolean;
  castling: string;
  ep: number | null;
  halfmove: number;
  fullmove: number;
}

const START =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function parseFen(fen = START): ChessState {
  const [pl, stm, cas, ep, hm, fm] = fen.split(" ");
  const board: ChessPiece[] = Array(64).fill(null);
  let r = 7;
  let f = 0;
  for (const ch of pl!) {
    if (ch === "/") {
      r -= 1;
      f = 0;
      continue;
    }
    if (ch >= "1" && ch <= "8") {
      f += Number(ch);
      continue;
    }
    board[r * 8 + f] = ch as ChessPiece;
    f += 1;
  }
  return {
    board,
    white: stm === "w",
    castling: cas ?? "KQkq",
    ep: ep && ep !== "-" ? algebraicToIndex(ep) : null,
    halfmove: Number(hm ?? 0),
    fullmove: Number(fm ?? 1),
  };
}

export function algebraicToIndex(a: string): number {
  const f = a.charCodeAt(0) - 97;
  const r = Number(a[1]) - 1;
  return r * 8 + f;
}

export function indexToAlgebraic(i: number): string {
  return String.fromCharCode(97 + (i % 8)) + (Math.floor(i / 8) + 1);
}

function onBoard(f: number, r: number) {
  return f >= 0 && f < 8 && r >= 0 && r < 8;
}

export function chessMoves(state: ChessState): string[] {
  const moves: string[] = [];
  const isW = state.white;
  for (let i = 0; i < 64; i++) {
    const p = state.board[i];
    if (!p) continue;
    const whiteP = p === p.toUpperCase();
    if (whiteP !== isW) continue;
    const f = i % 8;
    const r = Math.floor(i / 8);
    const add = (tf: number, tr: number) => {
      if (!onBoard(tf, tr)) return false;
      const t = state.board[tr * 8 + tf];
      if (t && (t === t.toUpperCase()) === whiteP) return false;
      moves.push(indexToAlgebraic(i) + indexToAlgebraic(tr * 8 + tf));
      return !t;
    };
    const slide = (df: number, dr: number) => {
      let tf = f + df;
      let tr = r + dr;
      while (onBoard(tf, tr) && add(tf, tr)) {
        tf += df;
        tr += dr;
      }
    };
    const kind = p.toLowerCase();
    if (kind === "p") {
      const dir = whiteP ? 1 : -1;
      const start = whiteP ? 1 : 6;
      if (onBoard(f, r + dir) && !state.board[(r + dir) * 8 + f]) {
        moves.push(indexToAlgebraic(i) + indexToAlgebraic((r + dir) * 8 + f));
        if (r === start && !state.board[(r + 2 * dir) * 8 + f]) {
          moves.push(indexToAlgebraic(i) + indexToAlgebraic((r + 2 * dir) * 8 + f));
        }
      }
      for (const df of [-1, 1]) {
        const tf = f + df;
        const tr = r + dir;
        if (!onBoard(tf, tr)) continue;
        const t = state.board[tr * 8 + tf];
        const ep = state.ep === tr * 8 + tf;
        if ((t && (t === t.toUpperCase()) !== whiteP) || ep) {
          moves.push(indexToAlgebraic(i) + indexToAlgebraic(tr * 8 + tf));
        }
      }
    } else if (kind === "n") {
      for (const [df, dr] of [
        [1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1],
      ]) add(f + df, r + dr);
    } else if (kind === "b") {
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
    } else if (kind === "r") {
      slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
    } else if (kind === "q") {
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
      slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
    } else if (kind === "k") {
      for (const df of [-1, 0, 1]) for (const dr of [-1, 0, 1]) if (df || dr) add(f + df, r + dr);
    }
  }
  return moves;
}

export function chessPlay(state: ChessState, uci: string): ChessState {
  const legal = chessMoves(state);
  if (!legal.includes(uci.slice(0, 4))) throw new Error("illegal");
  const from = algebraicToIndex(uci.slice(0, 2));
  const to = algebraicToIndex(uci.slice(2, 4));
  const board = state.board.slice();
  const piece = board[from];
  board[from] = null;
  let placed: ChessPiece = piece;
  if (piece && piece.toLowerCase() === "p" && (Math.floor(to / 8) === 7 || Math.floor(to / 8) === 0)) {
    placed = (piece === "P" ? "Q" : "q");
  }
  board[to] = placed;
  return {
    ...state,
    board,
    white: !state.white,
    ep: null,
    halfmove: piece?.toLowerCase() === "p" ? 0 : state.halfmove + 1,
    fullmove: state.white ? state.fullmove : state.fullmove + 1,
  };
}

export function perft(state: ChessState, depth: number): number {
  if (depth === 0) return 1;
  let n = 0;
  for (const m of chessMoves(state)) {
    n += perft(chessPlay(state, m), depth - 1);
  }
  return n;
}
