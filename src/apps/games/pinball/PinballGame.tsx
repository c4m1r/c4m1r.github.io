import { useEffect, useRef, useState } from 'react';
import {
  BALL_R, BUMPER_SCORE, BUMPERS, GRAVITY, LANE_X, LANE_Y, TABLE_H, TABLE_W, WALLS,
  collideBumper, collideSegment, flipperSegment, stepFlipper, type Ball, type Flipper,
} from './pinballPhysics';

/**
 * 3D Pinball (Space Cadet) sketch on a canvas. Temporary, not a faithful table.
 * Controls: Z / left arrow and / / right arrow move the flippers (or hold the left and
 * right halves of the table on touch). Hold Space to pull the plunger and release to launch.
 * Three balls per game; the ball that drains is replaced from the launch lane.
 */

const BALLS_PER_GAME = 3;
/** Holding the plunger for this long (ms) gives a full pull. */
const FULL_PULL_MS = 700;
/** Launch speed: base plus pull; the lower bound reaches the top of the lane. */
const LAUNCH_BASE = 14;
const LAUNCH_RANGE = 10;

interface GameRef {
  ball: Ball;
  ready: boolean;
  pull: number;
  pullStart: number | null;
  flippers: Flipper[];
  left: boolean;
  right: boolean;
  ballsLeft: number;
  score: number;
  running: boolean;
}

function freshGame(): GameRef {
  return {
    ball: { x: LANE_X, y: LANE_Y, vx: 0, vy: 0 },
    ready: true,
    pull: 0,
    pullStart: null,
    flippers: [
      { side: 'left', pivot: [105, TABLE_H - 75], angle: 0.45 },
      { side: 'right', pivot: [215, TABLE_H - 75], angle: 0.45 },
    ],
    left: false,
    right: false,
    ballsLeft: BALLS_PER_GAME,
    score: 0,
    running: true,
  };
}

function startPull(game: GameRef) {
  if (game.ready && game.pullStart === null) game.pullStart = performance.now();
}

function releasePull(game: GameRef) {
  if (!game.ready || game.pullStart === null) return;
  const pull = Math.min(1, (performance.now() - game.pullStart) / FULL_PULL_MS);
  game.ball.vy = -(LAUNCH_BASE + pull * LAUNCH_RANGE);
  game.ready = false;
  game.pull = 0;
  game.pullStart = null;
}

function stepPhysics(game: GameRef) {
  const [leftFlipper, rightFlipper] = game.flippers;
  const leftDelta = stepFlipper(leftFlipper, game.left);
  const rightDelta = stepFlipper(rightFlipper, game.right);

  if (game.ready) {
    game.ball.x = LANE_X;
    game.ball.y = LANE_Y;
    game.ball.vx = 0;
    game.ball.vy = 0;
    return;
  }

  const ball = game.ball;
  const substeps = 2;
  for (let s = 0; s < substeps; s += 1) {
    ball.vy += GRAVITY / substeps;
    ball.x += ball.vx / substeps;
    ball.y += ball.vy / substeps;
    for (const wall of WALLS) collideSegment(ball, wall);
    game.flippers.forEach((flipper, index) => {
      const delta = index === 0 ? leftDelta : rightDelta;
      // Kick is stronger when the flipper is swinging up toward the ball.
      const kick = delta < 0 ? Math.abs(delta) * 22 : 0;
      collideSegment(ball, flipperSegment(flipper), kick);
    });
    for (const bumper of BUMPERS) {
      if (collideBumper(ball, bumper)) game.score += BUMPER_SCORE;
    }
  }

  if (ball.y > TABLE_H + BALL_R * 2) {
    game.ballsLeft -= 1;
    game.ready = true;
    game.running = game.ballsLeft > 0;
  }
}

function draw(ctx: CanvasRenderingContext2D, game: GameRef, width: number, height: number) {
  const scale = Math.min(width / TABLE_W, height / TABLE_H);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, TABLE_W, TABLE_H);

  const bg = ctx.createLinearGradient(0, 0, 0, TABLE_H);
  bg.addColorStop(0, '#0d1b4b');
  bg.addColorStop(1, '#1a0b33');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TABLE_W, TABLE_H);

  ctx.strokeStyle = '#9fb4ff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const wall of WALLS) {
    ctx.beginPath();
    ctx.moveTo(wall.a[0], wall.a[1]);
    ctx.lineTo(wall.b[0], wall.b[1]);
    ctx.stroke();
  }

  for (const bumper of BUMPERS) {
    const g = ctx.createRadialGradient(bumper.x - 4, bumper.y - 4, 2, bumper.x, bumper.y, bumper.r);
    g.addColorStop(0, '#ffd166');
    g.addColorStop(1, '#c2410c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bumper.x, bumper.y, bumper.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 9;
  for (const flipper of game.flippers) {
    const seg = flipperSegment(flipper);
    ctx.beginPath();
    ctx.moveTo(seg.a[0], seg.a[1]);
    ctx.lineTo(seg.b[0], seg.b[1]);
    ctx.stroke();
  }

  // Plunger lane: the pull is shown as a bar under the launch position.
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(LANE_X - 6, TABLE_H - 40 - game.pull * 60, 12, game.pull * 60);

  const ballGradient = ctx.createRadialGradient(game.ball.x - 2, game.ball.y - 2, 1, game.ball.x, game.ball.y, BALL_R);
  ballGradient.addColorStop(0, '#ffffff');
  ballGradient.addColorStop(1, '#7c8799');
  ctx.fillStyle = ballGradient;
  ctx.beginPath();
  ctx.arc(game.ball.x, game.ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
}

export function PinballGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameRef>(freshGame());
  const [hud, setHud] = useState({ score: 0, ballsLeft: BALLS_PER_GAME, over: false });

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const game = gameRef.current;
      if (event.key === 'z' || event.key === 'Z' || event.key === 'ArrowLeft') game.left = true;
      if (event.key === '/' || event.key === 'ArrowRight') game.right = true;
      if (event.key === ' ') {
        event.preventDefault();
        startPull(game);
      }
    };
    const up = (event: KeyboardEvent) => {
      const game = gameRef.current;
      if (event.key === 'z' || event.key === 'Z' || event.key === 'ArrowLeft') game.left = false;
      if (event.key === '/' || event.key === 'ArrowRight') game.right = false;
      if (event.key === ' ') releasePull(game);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = { score: -1, ballsLeft: -1, over: false };
    const loop = () => {
      const game = gameRef.current;
      if (game.running) stepPhysics(game);
      game.pull = game.pullStart === null ? 0 : Math.min(1, (performance.now() - game.pullStart) / FULL_PULL_MS);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) draw(ctx, game, canvas.width, canvas.height);

      const over = !game.running;
      if (game.score !== last.score || game.ballsLeft !== last.ballsLeft || over !== last.over) {
        last = { score: game.score, ballsLeft: game.ballsLeft, over };
        setHud({ score: game.score, ballsLeft: game.ballsLeft, over });
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const restart = () => {
    gameRef.current = freshGame();
    setHud({ score: 0, ballsLeft: BALLS_PER_GAME, over: false });
  };

  const holdFlipper = (side: 'left' | 'right', pressed: boolean) => {
    if (side === 'left') gameRef.current.left = pressed;
    else gameRef.current.right = pressed;
  };

  return (
    <div className="flex h-full flex-col gap-2 bg-[#05070f] p-2 text-white" data-game="pinball">
      <header className="flex items-center justify-between text-sm">
        <span>Score: <strong data-testid="score">{hud.score}</strong></span>
        <span>Balls: <strong data-testid="balls">{hud.ballsLeft}</strong>{hud.over ? ' — Game over' : ''}</span>
        <button type="button" onClick={restart} className="rounded bg-white/15 px-3 py-1">New game</button>
      </header>

      <canvas
        ref={canvasRef}
        width={360}
        height={560}
        data-testid="table"
        className="mx-auto h-full max-h-[560px] w-auto max-w-full flex-1 touch-none"
      />

      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          type="button"
          onPointerDown={() => holdFlipper('left', true)}
          onPointerUp={() => holdFlipper('left', false)}
          onPointerLeave={() => holdFlipper('left', false)}
          className="rounded bg-white/15 py-2"
        >
          Left flipper (Z)
        </button>
        <button
          type="button"
          onPointerDown={() => startPull(gameRef.current)}
          onPointerUp={() => releasePull(gameRef.current)}
          onPointerLeave={() => releasePull(gameRef.current)}
          className="rounded bg-white/15 py-2"
        >
          Launch (Space)
        </button>
        <button
          type="button"
          onPointerDown={() => holdFlipper('right', true)}
          onPointerUp={() => holdFlipper('right', false)}
          onPointerLeave={() => holdFlipper('right', false)}
          className="rounded bg-white/15 py-2"
        >
          Right flipper (/)
        </button>
      </div>
    </div>
  );
}

