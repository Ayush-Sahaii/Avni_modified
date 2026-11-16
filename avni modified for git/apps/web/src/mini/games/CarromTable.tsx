import { useEffect, useRef, useState } from "react";
import { simulate, inPocket, type Body } from "@avni/shared";

const S = 320;
const pockets = [
  { x: 18, y: 18, r: 16 },
  { x: S - 18, y: 18, r: 16 },
  { x: 18, y: S - 18, r: 16 },
  { x: S - 18, y: S - 18, r: 16 },
];

function setup(): Body[] {
  const coins: Body[] = [];
  coins.push({ id: "striker", x: S / 2, y: S - 48, vx: 0, vy: 0, r: 12, mass: 1.4 });
  coins.push({ id: "queen", x: S / 2, y: S / 2, vx: 0, vy: 0, r: 8, mass: 1 });
  let n = 0;
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2;
    coins.push({
      id: `c${n++}`,
      x: S / 2 + Math.cos(ang) * 18,
      y: S / 2 + Math.sin(ang) * 18,
      vx: 0,
      vy: 0,
      r: 8,
      mass: 1,
    });
  }
  return coins;
}

export function CarromTable() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodies = useRef<Body[]>(setup());
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [info, setInfo] = useState("Pull back the striker to shoot");

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "#16120e";
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = "#cfc6b8";
      ctx.strokeRect(12, 12, S - 24, S - 24);
      pockets.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = "#050505";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      for (const b of bodies.current) {
        ctx.beginPath();
        ctx.fillStyle = b.id === "striker" ? "#eee" : b.id === "queen" ? "#bbb" : "#888";
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pt = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * S, y: ((e.clientY - r.top) / r.height) * S };
  };

  return (
    <div>
      <h1>Carrom</h1>
      <p style={{ color: "var(--muted)" }}>{info}</p>
      <canvas
        ref={canvasRef}
        width={S}
        height={S}
        style={{ width: "100%", maxWidth: 360, touchAction: "none", borderRadius: 16 }}
        onPointerDown={(e) => {
          drag.current = pt(e);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (!drag.current) return;
          const p = pt(e);
          const striker = bodies.current[0]!;
          striker.vx = (drag.current.x - p.x) * 0.35;
          striker.vy = (drag.current.y - p.y) * 0.35;
          bodies.current = simulate(bodies.current, 180, 1 / 60, 0.55, { w: S, h: S }).filter(
            (b) => b.id === "striker" || !inPocket(b.x, b.y, pockets),
          );
          setInfo(`Coins left ${bodies.current.length - 1}`);
          drag.current = null;
        }}
      />
    </div>
  );
}
