/**
 * Simple pinball physics for the 3D Pinball (Space Cadet) sketch.
 * Fixed one-step update per frame; the ball is a circle, the table is line segments
 * (walls and flippers) and round bumpers. Temporary sketch, not a faithful table.
 */

export const TABLE_W = 360;
export const TABLE_H = 560;
export const BALL_R = 7;
export const GRAVITY = 0.22;
export const RESTITUTION = 0.45;
export const BUMPER_BOUNCE = 1.25;
export const FLIPPER_LEN = 62;
export const FLIPPER_REST = 0.45;
export const FLIPPER_UP = -0.42;
export const FLIPPER_SPEED = 0.22;
export const BUMPER_SCORE = 100;

export type Vec = [number, number];
export interface Segment { a: Vec; b: Vec }
export interface Bumper { x: number; y: number; r: number }
export interface Flipper { side: 'left' | 'right'; pivot: Vec; angle: number }

export const WALLS: Segment[] = [
  { a: [10, TABLE_H - 150], b: [10, 20] },
  { a: [10, 20], b: [TABLE_W - 60, 20] },
  { a: [TABLE_W - 60, 20], b: [TABLE_W - 10, 70] },
  { a: [TABLE_W - 10, 70], b: [TABLE_W - 10, TABLE_H - 40] },
  { a: [TABLE_W - 60, 20], b: [TABLE_W - 60, TABLE_H - 40] },
  { a: [TABLE_W - 60, TABLE_H - 40], b: [TABLE_W - 10, TABLE_H - 40] },
  { a: [10, TABLE_H - 150], b: [88, TABLE_H - 60] },
  { a: [TABLE_W - 60, TABLE_H - 150], b: [230, TABLE_H - 60] },
];

export const BUMPERS: Bumper[] = [
  { x: 110, y: 170, r: 16 },
  { x: 200, y: 130, r: 16 },
  { x: 160, y: 250, r: 16 },
];

export const LANE_X = TABLE_W - 35;
export const LANE_Y = TABLE_H - 40 - BALL_R;

export function flipperEnd(flipper: Flipper): Vec {
  const dir = flipper.side === 'left' ? 1 : -1;
  return [
    flipper.pivot[0] + dir * FLIPPER_LEN * Math.cos(flipper.angle),
    flipper.pivot[1] + FLIPPER_LEN * Math.sin(flipper.angle),
  ];
}

export function flipperSegment(flipper: Flipper): Segment {
  return { a: flipper.pivot, b: flipperEnd(flipper) };
}

export function closestPoint(seg: Segment, p: Vec): Vec {
  const [ax, ay] = seg.a;
  const [bx, by] = seg.b;
  const abx = bx - ax;
  const aby = by - ay;
  const len2 = abx * abx + aby * aby || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - ax) * abx + (p[1] - ay) * aby) / len2));
  return [ax + abx * t, ay + aby * t];
}

export interface Ball { x: number; y: number; vx: number; vy: number }

/** Resolves one circle-vs-segment contact; `boost` adds flipper kick along the normal. */
export function collideSegment(ball: Ball, seg: Segment, boost = 0): boolean {
  const [cx, cy] = closestPoint(seg, [ball.x, ball.y]);
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist >= BALL_R || dist === 0) return false;
  const nx = dx / dist;
  const ny = dy / dist;
  const push = BALL_R - dist;
  ball.x += nx * push;
  ball.y += ny * push;
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn < 0) {
    ball.vx -= (1 + RESTITUTION) * vn * nx;
    ball.vy -= (1 + RESTITUTION) * vn * ny;
  }
  if (boost > 0) {
    ball.vx += nx * boost;
    ball.vy += ny * boost;
  }
  return true;
}

/** Bumper contact; returns true when the ball touched the bumper this step. */
export function collideBumper(ball: Ball, bumper: Bumper): boolean {
  const dx = ball.x - bumper.x;
  const dy = ball.y - bumper.y;
  const dist = Math.hypot(dx, dy);
  const minDist = BALL_R + bumper.r;
  if (dist >= minDist || dist === 0) return false;
  const nx = dx / dist;
  const ny = dy / dist;
  ball.x += nx * (minDist - dist);
  ball.y += ny * (minDist - dist);
  const vn = ball.vx * nx + ball.vy * ny;
  ball.vx -= (1 + BUMPER_BOUNCE) * Math.min(vn, 0) * nx;
  ball.vy -= (1 + BUMPER_BOUNCE) * Math.min(vn, 0) * ny;
  return true;
}

/** Advances flipper angles toward their targets; returns the per-step angle change. */
export function stepFlipper(flipper: Flipper, pressed: boolean): number {
  const target = pressed ? FLIPPER_UP : FLIPPER_REST;
  const delta = Math.max(-FLIPPER_SPEED, Math.min(FLIPPER_SPEED, target - flipper.angle));
  flipper.angle += delta;
  return delta;
}
