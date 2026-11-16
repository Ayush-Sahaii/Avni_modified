import { useState } from "react";
import { scrabbleCreate, placeWord, premium, type ScrabbleState } from "@avni/shared";

export function ScrabbleBoard() {
  const [state, setState] = useState<ScrabbleState>(() => scrabbleCreate(1));
  const [sel, setSel] = useState<number | null>(null);
  const [pending, setPending] = useState<Array<{ rackIndex: number; r: number; c: number }>>([]);
  const [msg, setMsg] = useState("Place a dictionary word");

  return (
    <div>
      <h1>Scrabble</h1>
      <p style={{ color: "var(--muted)" }}>Score {state.scores[0]} · bag {state.bag.length}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(15, 1fr)",
          gap: 1,
          maxWidth: 360,
          background: "#222",
        }}
      >
        {state.board.map((ch, i) => {
          const r = Math.floor(i / 15);
          const c = i % 15;
          const prem = premium(r, c);
          const pend = pending.find((p) => p.r === r && p.c === c);
          return (
            <button
              key={i}
              type="button"
              aria-label={`sq ${r},${c}`}
              onClick={() => {
                if (sel === null || ch) return;
                setPending((p) => [...p, { rackIndex: sel, r, c }]);
                setSel(null);
              }}
              style={{
                aspectRatio: 1,
                border: 0,
                fontSize: 9,
                background: prem === "tw" ? "#555" : prem === "dw" ? "#444" : prem === "tl" ? "#333" : "#1a1a1a",
                color: "#fff",
              }}
            >
              {pend ? state.racks[0]![pend.rackIndex] : ch ?? ""}
            </button>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        {state.racks[0]!.map((ch, i) => (
          <button
            key={i}
            className={sel === i ? "btn btn-primary" : "btn btn-ghost"}
            type="button"
            onClick={() => setSel(i)}
          >
            {ch}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary"
        type="button"
        style={{ marginTop: 8 }}
        onClick={() => {
          try {
            setState(placeWord(state, pending));
            setPending([]);
            setMsg("Played");
          } catch (e) {
            setMsg(String(e));
          }
        }}
      >
        Submit word
      </button>
      <p>{msg}</p>
    </div>
  );
}
