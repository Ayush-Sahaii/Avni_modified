import { useState } from "react";
import { unoCreate, playCard, drawOne, callUno, publicUnoView, type UnoState, type UnoColor } from "@avni/shared";

export function UnoTable() {
  const [state, setState] = useState<UnoState>(() => unoCreate(2));
  const [msg, setMsg] = useState("");
  const view = publicUnoView(state, 0);

  const bump = (s: UnoState, m: string) => {
    setState({ ...s, players: s.players.map((p) => ({ ...p, hand: p.hand.slice() })) });
    setMsg(m);
  };

  return (
    <div>
      <h1>Cards</h1>
      <p style={{ color: "var(--muted)" }}>
        Colour {view.currentColor} · you {view.counts[0]} · opp {view.counts[1]}
      </p>
      <div className="glass card">
        Top: {view.top.color} {view.top.value}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {view.hand.map((c) => (
          <button
            key={c.id}
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              try {
                const color: UnoColor | undefined = c.color === "black" ? "red" : undefined;
                playCard(state, 0, c.id, color);
                bump(state, "Played");
              } catch (e) {
                setMsg(String(e));
              }
            }}
          >
            {c.color} {c.value}
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" type="button" onClick={() => {
          drawOne(state, 0);
          bump(state, "Drew");
        }}>
          Draw
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => {
          callUno(state, 0);
          bump(state, "UNO");
        }}>
          Call UNO
        </button>
      </div>
      <p>{msg}</p>
    </div>
  );
}
