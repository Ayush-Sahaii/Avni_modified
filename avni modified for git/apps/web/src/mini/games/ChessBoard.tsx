import { useState } from "react";
import { parseFen, chessMoves, chessPlay, indexToAlgebraic, type ChessState } from "@avni/shared";

function pieceAt(s: ChessState, i: number) {
  return s.board[i];
}

export function ChessBoard() {
  const [state, setState] = useState(() => parseFen());
  const [sel, setSel] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const legal = chessMoves(state);

  return (
    <div>
      <h1>Chess</h1>
      <p style={{ color: "var(--muted)" }}>{state.white ? "White" : "Black"} to move</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          maxWidth: 360,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
        }}
      >
        {Array.from({ length: 64 }, (_, n) => {
          const file = n % 8;
          const rank = 7 - Math.floor(n / 8);
          const i = rank * 8 + file;
          const dark = (file + rank) % 2 === 1;
          const p = pieceAt(state, i);
          const fromAlg = sel !== null ? indexToAlgebraic(sel) : "";
          const uci = fromAlg + indexToAlgebraic(i);
          const can = sel !== null && legal.includes(uci);
          return (
            <button
              key={n}
              type="button"
              aria-label={indexToAlgebraic(i)}
              onClick={() => {
                setErr("");
                if (sel === null) {
                  if (p) setSel(i);
                  return;
                }
                if (sel === i) {
                  setSel(null);
                  return;
                }
                try {
                  setState(chessPlay(state, uci));
                  setSel(null);
                } catch (e) {
                  setErr(String(e));
                  setSel(null);
                }
              }}
              style={{
                aspectRatio: 1,
                border: 0,
                background: can ? "#666" : dark ? "#3a3a3a" : "#cfcfcf",
                color: p && p === p.toUpperCase() ? "#111" : "#fafafa",
                fontSize: 22,
              }}
            >
              {p ?? ""}
            </button>
          );
        })}
      </div>
      <p>{err}</p>
    </div>
  );
}
