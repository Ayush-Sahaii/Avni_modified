import { Chess, type Square } from "chess.js";

export function fideNew() {
  return new Chess();
}

export function fideFen(g: Chess) {
  return g.fen();
}

export function fideMoves(g: Chess, from?: Square) {
  return g.moves({ verbose: true, square: from });
}

export function fideMove(fen: string, from: string, to: string, promotion?: string) {
  const g = new Chess(fen);
  const m = g.move({ from, to, promotion: (promotion ?? "q") as "q" });
  if (!m) throw new Error("illegal");
  return {
    fen: g.fen(),
    san: m.san,
    checkmate: g.isCheckmate(),
    stalemate: g.isStalemate(),
    draw: g.isDraw(),
    insufficient: g.isInsufficientMaterial(),
    threefold: g.isThreefoldRepetition(),
    inCheck: g.inCheck(),
  };
}

export function fidePerft(fen: string, depth: number): number {
  const g = new Chess(fen);
  const walk = (d: number): number => {
    if (d === 0) return 1;
    let n = 0;
    for (const m of g.moves({ verbose: true })) {
      g.move(m);
      n += walk(d - 1);
      g.undo();
    }
    return n;
  };
  return walk(depth);
}
