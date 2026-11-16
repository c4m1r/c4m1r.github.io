import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const GRID_SIZE = 20;
const BOARD_SIZE = 15; // 15x15 grid for better mobile fit
const SPEED = 150;

type Point = { x: number; y: number };

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 10, y: 7 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 }); // Moving right
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);

  // Sync ref with state for use in interval
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((): Point => {
    return {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const checkCollision = (head: Point) => {
    // Wall collision
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) return true;
    // Self collision
    for (const segment of snake) {
      if (head.x === segment.x && head.y === segment.y) return true;
    }
    return false;
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        if (checkCollision(newHead)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, SPEED);
    return () => clearInterval(intervalId);
  }, [isPlaying, gameOver, food, generateFood]);

  const handleDirection = (newDir: Point) => {
    const currentDir = directionRef.current;
    // Prevent 180 degree turns
    if (newDir.x !== 0 && currentDir.x !== 0) return;
    if (newDir.y !== 0 && currentDir.y !== 0) return;
    setDirection(newDir);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp': handleDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': handleDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': handleDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': handleDirection({ x: 1, y: 0 }); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-4 items-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          🐍 Snake
        </h3>
        <span className="font-mono text-xl font-bold text-indigo-500">{score}</span>
      </div>

      <div 
        className="relative bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-inner mx-auto"
        style={{ width: BOARD_SIZE * GRID_SIZE, height: BOARD_SIZE * GRID_SIZE }}
      >
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-transform hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" /> Start
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm text-center p-4">
            <p className="text-white text-2xl font-bold mb-2">Game Over!</p>
            <p className="text-slate-200 mb-4">Score: {score}</p>
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 hover:bg-slate-100 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" /> Retry
            </button>
          </div>
        )}

        {/* Food */}
        <div 
          className="absolute bg-red-500 rounded-full shadow-sm z-10 transition-all duration-300"
          style={{
            left: food.x * GRID_SIZE,
            top: food.y * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
            transform: 'scale(0.8)'
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div 
            key={`${i}`}
            className={`absolute rounded-sm ${i === 0 ? 'bg-indigo-600 z-10' : 'bg-indigo-400/80'}`}
            style={{
              left: segment.x * GRID_SIZE,
              top: segment.y * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
              borderRadius: i === 0 ? '4px' : '2px'
            }}
          />
        ))}
      </div>
      
      {/* Mobile Controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden w-full max-w-[200px]">
        <div />
        <button 
          className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg active:bg-indigo-100 dark:active:bg-indigo-900/50 flex justify-center"
          onPointerDown={() => handleDirection({ x: 0, y: -1 })}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div />
        <button 
          className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg active:bg-indigo-100 dark:active:bg-indigo-900/50 flex justify-center"
          onPointerDown={() => handleDirection({ x: -1, y: 0 })}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg active:bg-indigo-100 dark:active:bg-indigo-900/50 flex justify-center"
          onPointerDown={() => handleDirection({ x: 0, y: 1 })}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <button 
          className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg active:bg-indigo-100 dark:active:bg-indigo-900/50 flex justify-center"
          onPointerDown={() => handleDirection({ x: 1, y: 0 })}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
        Use Arrow keys to move
      </p>
    </div>
  );
};

export default SnakeGame;