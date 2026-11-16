import { useEffect, useRef, useState } from "react";

const W = 320;
const H = 480;
const GOAL = 90;
const PR = 10;
const SR = 22;

export function Hockey() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    puck: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
    me: { x: W / 2, y: H - 70 },
    bot: { x: W / 2, y: 70 },
    score: [0, 0] as [number, number],
  });
  const [score, setScore] = useState("0 – 0");
  const pointer = useRef<{ id: number | null; x: number; y: number }>({ id: null, x: 0, y: 0 });

  useEffect(() => {
    const cvs = canvasRef.current!;
    const ctx = cvs.getContext("2d")!;
    let raf = 0;
    const loop = () => {
      const s = state.current;
      if (pointer.current.id !== null) {
        s.me.x = Math.min(W - SR, Math.max(SR, pointer.current.x));
        s.me.y = Math.min(H - SR, Math.max(H / 2 + SR, pointer.current.y));
      }
      s.bot.x += (s.puck.x - s.bot.x) * 0.08;
      s.bot.x = Math.min(W - SR, Math.max(SR, s.bot.x));
      s.bot.y = Math.min(H / 2 - SR, Math.max(SR, 50 + (s.puck.y < H / 2 ? 20 : 0)));

      s.puck.x += s.puck.vx;
      s.puck.y += s.puck.vy;
      s.puck.vx *= 0.992;
      s.puck.vy *= 0.992;
      if (s.puck.x < PR || s.puck.x > W - PR) s.puck.vx *= -1;
      s.puck.x = Math.min(W - PR, Math.max(PR, s.puck.x));
      const hit = (sx: number, sy: number) => {
        const dx = s.puck.x - sx;
        const dy = s.puck.y - sy;
        const d = Math.hypot(dx, dy) || 1;
        if (d < PR + SR) {
          const nx = dx / d;
          const ny = dy / d;
          s.puck.x = sx + nx * (PR + SR);
          s.puck.y = sy + ny * (PR + SR);
          s.puck.vx += nx * 6;
          s.puck.vy += ny * 6;
        }
      };
      hit(s.me.x, s.me.y);
      hit(s.bot.x, s.bot.y);
      if (s.puck.y < PR) {
        if (Math.abs(s.puck.x - W / 2) < GOAL / 2) {
          s.score[1] += 1;
          setScore(`${s.score[0]} – ${s.score[1]}`);
          s.puck = { x: W / 2, y: H / 2, vx: 0, vy: 2 };
        } else s.puck.vy = Math.abs(s.puck.vy);
      }
      if (s.puck.y > H - PR) {
        if (Math.abs(s.puck.x - W / 2) < GOAL / 2) {
          s.score[0] += 1;
          setScore(`${s.score[0]} – ${s.score[1]}`);
          s.puck = { x: W / 2, y: H / 2, vx: 0, vy: -2 };
        } else s.puck.vy = -Math.abs(s.puck.vy);
      }

      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.beginPath();
      ctx.moveTo(8, H / 2);
      ctx.lineTo(W - 8, H / 2);
      ctx.stroke();
      ctx.strokeRect(W / 2 - GOAL / 2, 8, GOAL, 14);
      ctx.strokeRect(W / 2 - GOAL / 2, H - 22, GOAL, 14);
      const mallet = (x: number, y: number, fill: string) => {
        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.arc(x, y, SR, 0, Math.PI * 2);
        ctx.fill();
      };
      mallet(s.bot.x, s.bot.y, "#d0d0d0");
      mallet(s.me.x, s.me.y, "#fafafa");
      ctx.beginPath();
      ctx.fillStyle = "#888";
      ctx.arc(s.puck.x, s.puck.y, PR, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <div>
      <h1>Ice Hockey</h1>
      <p style={{ color: "var(--muted)" }}>Bot {score.split(" – ")[0]} · You {score.split(" – ")[1]}</p>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ width: "100%", maxWidth: 360, touchAction: "none", borderRadius: 16, border: "1px solid var(--glass-border)" }}
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          pointer.current = { id: e.pointerId, ...pos(e) };
        }}
        onPointerMove={(e) => {
          if (pointer.current.id !== e.pointerId) return;
          const p = pos(e);
          pointer.current.x = p.x;
          pointer.current.y = p.y;
        }}
        onPointerUp={() => {
          pointer.current.id = null;
        }}
        onPointerCancel={() => {
          pointer.current.id = null;
        }}
      />
    </div>
  );
}
