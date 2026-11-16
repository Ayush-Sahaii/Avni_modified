/** Deterministic circle physics for carrom / hockey tests. */

export interface Body {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  mass: number;
}

export function stepBodies(bodies: Body[], dt: number, friction: number, walls: { w: number; h: number }): Body[] {
  return bodies.map((b) => {
    let { x, y, vx, vy } = b;
    vx *= Math.max(0, 1 - friction * dt);
    vy *= Math.max(0, 1 - friction * dt);
    x += vx * dt;
    y += vy * dt;
    if (x < b.r) {
      x = b.r;
      vx = Math.abs(vx);
    }
    if (x > walls.w - b.r) {
      x = walls.w - b.r;
      vx = -Math.abs(vx);
    }
    if (y < b.r) {
      y = b.r;
      vy = Math.abs(vy);
    }
    if (y > walls.h - b.r) {
      y = walls.h - b.r;
      vy = -Math.abs(vy);
    }
    return { ...b, x, y, vx, vy };
  });
}

export function collide(a: Body, b: Body): [Body, Body] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1e-6;
  if (dist >= a.r + b.r) return [a, b];
  const nx = dx / dist;
  const ny = dy / dist;
  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const rel = dvx * nx + dvy * ny;
  if (rel > 0) {
    const impulse = (2 * rel) / (a.mass + b.mass);
    a = { ...a, vx: a.vx - impulse * b.mass * nx, vy: a.vy - impulse * b.mass * ny };
    b = { ...b, vx: b.vx + impulse * a.mass * nx, vy: b.vy + impulse * a.mass * ny };
  }
  const overlap = a.r + b.r - dist;
  return [
    { ...a, x: a.x - nx * overlap * 0.5, y: a.y - ny * overlap * 0.5 },
    { ...b, x: b.x + nx * overlap * 0.5, y: b.y + ny * overlap * 0.5 },
  ];
}

export function simulate(bodies: Body[], steps: number, dt: number, friction: number, walls: { w: number; h: number }): Body[] {
  let cur = bodies;
  for (let i = 0; i < steps; i++) {
    cur = stepBodies(cur, dt, friction, walls);
    for (let a = 0; a < cur.length; a++) {
      for (let b = a + 1; b < cur.length; b++) {
        const [na, nb] = collide(cur[a]!, cur[b]!);
        cur[a] = na;
        cur[b] = nb;
      }
    }
  }
  return cur;
}

export function inPocket(x: number, y: number, pockets: Array<{ x: number; y: number; r: number }>): boolean {
  return pockets.some((p) => Math.hypot(x - p.x, y - p.y) < p.r);
}

export function hockeyGoal(puck: Body, w: number, h: number, goalW: number): -1 | 0 | 1 {
  if (puck.y - puck.r <= 0 && Math.abs(puck.x - w / 2) < goalW / 2) return 1;
  if (puck.y + puck.r >= h && Math.abs(puck.x - w / 2) < goalW / 2) return -1;
  return 0;
}
