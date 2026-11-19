import { useEffect, useRef, useState } from 'react';

type Point = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
const SIZE = 16;
const START: Point[] = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
const DELTA: Record<Direction, Point> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

function makeFood(snake: Point[]): Point {
  const free: Point[] = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(START);
  const [food, setFood] = useState<Point>({ x: 10, y: 8 });
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef<Direction>('right');
  snakeRef.current = snake;
  foodRef.current = food;

  const reset = () => {
    snakeRef.current = START;
    foodRef.current = { x: 10, y: 8 };
    directionRef.current = 'right';
    setSnake(START);
    setFood({ x: 10, y: 8 });
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const handleKey = (event: KeyboardEvent) => {
      const keys: Record<string, Direction> = {
        ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
        ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
      };
      const next = keys[event.code];
      if (!next) return;
      event.preventDefault();
      const current = directionRef.current;
      if ((current === 'up' && next === 'down') || (current === 'down' && next === 'up') ||
          (current === 'left' && next === 'right') || (current === 'right' && next === 'left')) return;
      directionRef.current = next;
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const current = snakeRef.current;
      const delta = DELTA[directionRef.current];
      const head = { x: current[0].x + delta.x, y: current[0].y + delta.y };
      const eating = head.x === foodRef.current.x && head.y === foodRef.current.y;
      const collisionBody = eating ? current : current.slice(0, -1);
      if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE ||
          collisionBody.some((part) => part.x === head.x && part.y === head.y)) {
        setRunning(false);
        setGameOver(true);
        return;
      }
      const next = [head, ...current.slice(0, eating ? current.length : -1)];
      snakeRef.current = next;
      setSnake(next);
      if (eating) {
        setScore((value) => value + 10);
        const nextFood = makeFood(next);
        foodRef.current = nextFood;
        setFood(nextFood);
      }
    }, 145);
    return () => window.clearInterval(timer);
  }, [running]);

  return (
    <div className="h-full w-full flex flex-col items-center gap-3 bg-[#101820] p-4 text-white">
      <div className="flex w-full max-w-[520px] items-center justify-between">
        <div><h2 className="text-lg font-bold tracking-wider text-emerald-300">SNAKE</h2><p className="text-xs text-slate-400">WASD / Arrow keys</p></div>
        <div className="text-right"><div className="text-[10px] uppercase text-slate-400">Score</div><strong className="font-mono text-xl">{score}</strong></div>
      </div>
      <div className="relative grid aspect-square w-full max-w-[520px] overflow-hidden rounded border-4 border-slate-600 bg-[#07110d]" style={{ gridTemplateColumns: 'repeat(16,minmax(0,1fr))' }}>
        {Array.from({ length: SIZE * SIZE }, (_, index) => (
          <div key={index} className="aspect-square border border-white/[0.035]" />
        ))}
        {snake.map((part, index) => (
          <div key={index} className={index === 0 ? 'absolute rounded-sm bg-lime-300 shadow-[0_0_12px_#a3e635]' : 'absolute rounded-sm bg-emerald-600'}
            style={{ left: `${part.x * 6.25}%`, top: `${part.y * 6.25}%`, width: '6.25%', height: '6.25%' }} />
        ))}
        <div className="absolute rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" style={{ left: `${food.x * 6.25}%`, top: `${food.y * 6.25}%`, width: '6.25%', height: '6.25%' }} />
        {!running && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65 text-center">
          <strong className="text-lg">{gameOver ? 'Game Over' : 'Ready?'}</strong>
          <button type="button" onClick={reset} className="rounded bg-emerald-500 px-5 py-2 text-sm font-bold text-black hover:bg-emerald-400">{gameOver ? 'Play again' : 'Start game'}</button>
        </div>}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => { if (!running) reset(); else { directionRef.current = 'up'; } }} className="rounded border border-slate-500 px-3 py-1 text-xs">↑</button>
        <button type="button" onClick={() => { if (!running) reset(); else { directionRef.current = 'left'; } }} className="rounded border border-slate-500 px-3 py-1 text-xs">←</button>
        <button type="button" onClick={() => { if (!running) reset(); else { directionRef.current = 'down'; } }} className="rounded border border-slate-500 px-3 py-1 text-xs">↓</button>
        <button type="button" onClick={() => { if (!running) reset(); else { directionRef.current = 'right'; } }} className="rounded border border-slate-500 px-3 py-1 text-xs">→</button>
      </div>
    </div>
  );
}
