import { useState } from "react";
import { ludoCreate, ludoRoll, ludoMoves, ludoMove, type LudoState, type LudoColor } from "@avni/shared";

const COLORS: LudoColor[] = ["red", "green", "yellow", "blue"];
const FILL: Record<LudoColor, string> = {
  red: "#c4c4c4",
  green: "#8a8a8a",
  yellow: "#f0f0f0",
  blue: "#5a5a5a",
};

export function LudoBoard() {
  const [state, setState] = useState<LudoState>(() => ludoCreate(["red", "green"]));
  const [msg, setMsg] = useState("Roll to start");
  const color = state.colors[state.turn]!;

  return (
    <div>
      <h1>Ludo</h1>
      <p style={{ color: "var(--muted)" }}>
        {state.winner ? `${state.winner} wins` : `${color} to play · dice ${state.dice ?? "—"}`}
      </p>
      <svg viewBox="0 0 15 15" width="100%" style={{ maxWidth: 360, background: "#111", borderRadius: 16 }}>
        {COLORS.map((c, i) => {
          const x = i % 2 === 0 ? 0 : 9;
          const y = i < 2 ? 0 : 9;
          return <rect key={c} x={x} y={y} width={6} height={6} fill={FILL[c]} opacity={0.35} />;
        })}
        <rect x={6} y={0} width={3} height={15} fill="#222" />
        <rect x={0} y={6} width={15} height={3} fill="#222" />
        {state.colors.flatMap((c) =>
          state.tokens[c]!.map((t, i) => {
            const gx = c === "red" || c === "blue" ? 1 + (i % 2) : 10 + (i % 2);
            const gy = c === "red" || c === "green" ? 1 + Math.floor(i / 2) : 10 + Math.floor(i / 2);
            const on = t.pathIndex >= 0;
            return (
              <circle
                key={`${c}${i}`}
                cx={on ? 7.5 : gx + 0.5}
                cy={on ? 7.5 - (c === "red" ? 0 : 0) + (t.pathIndex % 5) * 0.2 : gy + 0.5}
                r={0.4}
                fill={FILL[c]}
                stroke="#fff"
                strokeWidth={0.05}
                onClick={() => {
                  try {
                    const next = structuredClone(state);
                    ludoMove(next, i);
                    setState({ ...next });
                    setMsg("Moved");
                  } catch (e) {
                    setMsg(String(e));
                  }
                }}
              />
            );
          }),
        )}
      </svg>
      <button
        className="btn btn-primary"
        type="button"
        style={{ marginTop: 12 }}
        onClick={() => {
          const next = structuredClone(state);
          const v = 1 + Math.floor(Math.random() * 6);
          ludoRoll(next, v);
          setState({ ...next });
          setMsg(`Rolled ${v}. Moves: ${ludoMoves(next).join(", ") || "none"}`);
        }}
      >
        Roll
      </button>
      <p>{msg}</p>
    </div>
  );
}
