export interface HockeySnap {
  puck: { x: number; y: number; vx: number; vy: number };
  strikers: Array<{ x: number; y: number }>;
  score: [number, number];
  seq: number;
}

export const HW = 1;
export const HH = 1.5;
export const PR = 0.03;
export const SR = 0.06;
export const GOAL = 0.28;

export function hockeyInit(): HockeySnap {
  return {
    puck: { x: 0.5, y: 0.75, vx: 0, vy: 0 },
    strikers: [
      { x: 0.5, y: 1.2 },
      { x: 0.5, y: 0.3 },
    ],
    score: [0, 0],
    seq: 0,
  };
}

export function clampStriker(seat: number, x: number, y: number) {
  const cx = Math.min(1 - SR, Math.max(SR, x));
  const mid = HH / 2;
  if (seat === 0) {
    return { x: cx, y: Math.min(HH - SR, Math.max(mid + SR, y)) };
  }
  return { x: cx, y: Math.min(mid - SR, Math.max(SR, y)) };
}

export function hockeyStep(s: HockeySnap, dt: number): HockeySnap {
  const puck = { ...s.puck };
  puck.x += puck.vx * dt;
  puck.y += puck.vy * dt;
  puck.vx *= 0.995;
  puck.vy *= 0.995;
  if (puck.x < PR) {
    puck.x = PR;
    puck.vx = Math.abs(puck.vx);
  }
  if (puck.x > HW - PR) {
    puck.x = HW - PR;
    puck.vx = -Math.abs(puck.vx);
  }
  const score: [number, number] = [...s.score];
  let reset = false;
  if (puck.y < PR) {
    if (Math.abs(puck.x - 0.5) < GOAL / 2) {
      score[0] += 1;
      reset = true;
    } else puck.vy = Math.abs(puck.vy);
  }
  if (puck.y > HH - PR) {
    if (Math.abs(puck.x - 0.5) < GOAL / 2) {
      score[1] += 1;
      reset = true;
    } else puck.vy = -Math.abs(puck.vy);
  }
  if (reset) {
    puck.x = 0.5;
    puck.y = 0.75;
    puck.vx = 0;
    puck.vy = 0;
  }
  for (const st of s.strikers) {
    const dx = puck.x - st.x;
    const dy = puck.y - st.y;
    const d = Math.hypot(dx, dy) || 1e-6;
    if (d < PR + SR) {
      const nx = dx / d;
      const ny = dy / d;
      puck.x = st.x + nx * (PR + SR);
      puck.y = st.y + ny * (PR + SR);
      puck.vx += nx * 1.8;
      puck.vy += ny * 1.8;
    }
  }
  return { puck, strikers: s.strikers.map((p) => ({ ...p })), score, seq: s.seq + 1 };
}
