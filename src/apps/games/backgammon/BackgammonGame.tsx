import { useEffect, useState } from 'react';
import { GameMenuBar } from '../GameMenuBar';
import { useNewGameShortcut } from '../gameHooks';
import {
  applyMove, chooseComputerMove, hasWon, initialState, legalMoves, rollDice,
  type BackgammonState, type Move, type Player,
} from './backgammonLogic';

/**
 * Internet Backgammon (XP, 7) sketch: you play White against the computer (Black).
 * Roll, then click a checker (or the bar) and a highlighted point or the off tray.
 * The turn passes when no legal move is left. No doubling cube.
 */

type Selection = number | 'bar' | null;

function removeDie(dice: number[], die: number): number[] {
  const index = dice.indexOf(die);
  return index < 0 ? dice : [...dice.slice(0, index), ...dice.slice(index + 1)];
}

function Checker({ player, label }: { player: Player; label?: string }) {
  return (
    <span
      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-[9px] ${
        player === 'W' ? 'border-[#555] bg-[#f4f1e8] text-[#222]' : 'border-[#000] bg-[#2a2a2a] text-[#eee]'
      }`}
    >
      {label}
    </span>
  );
}

function Point({
  index,
  board,
  top,
  highlighted,
  selected,
  onClick,
}: {
  index: number;
  board: BackgammonState;
  top: boolean;
  highlighted: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const value = board.points[index];
  const count = Math.abs(value);
  const owner: Player = value > 0 ? 'W' : 'B';
  const shown = Math.min(count, 5);
  const dark = index % 2 === 0;
  const triangleColour = dark ? '#8b4513' : '#e8c890';
  const clip = top ? 'polygon(0 0, 100% 0, 50% 100%)' : 'polygon(50% 0, 100% 100%, 0 100%)';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`point ${index + 1}`}
      data-testid={`point-${index}`}
      className="relative flex h-full min-w-0 flex-1 flex-col items-center bg-transparent p-0"
    >
      <span className="absolute inset-0" style={{ background: triangleColour, clipPath: clip }} />
      {highlighted && <span className="absolute inset-0 border-2 border-[#ffff00]" style={{ clipPath: clip }} />}
      <span className={`relative z-10 flex h-full w-full flex-col gap-[2px] py-1 ${top ? '' : 'justify-end'}`}>
        {Array.from({ length: shown }).map((_, i) => (
          <span key={i} className={`flex justify-center ${selected && i === shown - 1 ? 'opacity-70' : ''}`}>
            <Checker player={owner} label={i === shown - 1 && count > 5 ? String(count) : undefined} />
          </span>
        ))}
      </span>
    </button>
  );
}

export function BackgammonGame() {
  const [board, setBoard] = useState<BackgammonState>(initialState);
  const [dice, setDice] = useState<number[]>([]);
  const [rolled, setRolled] = useState<number[]>([]);
  const [turn, setTurn] = useState<Player>('W');
  const [selected, setSelected] = useState<Selection>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [status, setStatus] = useState('Roll the dice to begin.');

  const humanMoves = turn === 'W' && dice.length > 0 && !winner ? legalMoves(board, 'W', dice) : [];
  const targets = (selected === null ? [] : humanMoves.filter((move) => move.from === selected));

  const newGame = () => {
    setBoard(initialState());
    setDice([]);
    setRolled([]);
    setTurn('W');
    setSelected(null);
    setWinner(null);
    setStatus('Roll the dice to begin.');
  };

  useNewGameShortcut(newGame);

  // The computer rolls and plays its whole turn after a short pause.
  useEffect(() => {
    if (turn !== 'B' || winner) return;
    const timer = window.setTimeout(() => {
      const shown = rollDice();
      setRolled(shown);
      let current = board;
      let remaining = shown;
      while (remaining.length > 0) {
        const move = chooseComputerMove(current, 'B', remaining);
        if (!move) break;
        current = applyMove(current, 'B', move);
        remaining = removeDie(remaining, move.die);
        if (hasWon(current, 'B')) break;
      }
      setBoard(current);
      if (hasWon(current, 'B')) {
        setWinner('B');
        setStatus('The computer won.');
      } else {
        setTurn('W');
        setDice([]);
        setStatus('Your turn: roll the dice.');
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [turn, winner, board]);

  const roll = () => {
    if (turn !== 'W' || dice.length > 0 || winner) return;
    const values = rollDice();
    setRolled(values);
    setSelected(null);
    if (legalMoves(board, 'W', values).length === 0) {
      setDice([]);
      setTurn('B');
      setStatus('No legal moves. Computer turn.');
      return;
    }
    setDice(values);
    setStatus('Click a checker, then a highlighted point.');
  };

  const playMove = (move: Move) => {
    const next = applyMove(board, 'W', move);
    const left = removeDie(dice, move.die);
    setBoard(next);
    setSelected(null);
    if (hasWon(next, 'W')) {
      setWinner('W');
      setDice([]);
      setStatus('You won!');
      return;
    }
    if (left.length === 0 || legalMoves(next, 'W', left).length === 0) {
      setDice([]);
      setTurn('B');
      setStatus('Computer turn.');
      return;
    }
    setDice(left);
  };

  const clickPoint = (index: number) => {
    if (turn !== 'W' || dice.length === 0 || winner) return;
    const target = targets.find((move) => move.to === index);
    if (target) {
      playMove(target);
      return;
    }
    if (board.points[index] > 0 && humanMoves.some((move) => move.from === index)) {
      setSelected(index);
      return;
    }
    setSelected(null);
  };

  const clickBar = () => {
    if (turn !== 'W' || dice.length === 0 || board.bar.W === 0) return;
    setSelected(selected === 'bar' ? null : 'bar');
  };

  const clickOff = () => {
    const target = targets.find((move) => move.to === 'off');
    if (target) playMove(target);
  };

  const topLeft = [23, 22, 21, 20, 19, 18];
  const topRight = [17, 16, 15, 14, 13, 12];
  const bottomLeft = [0, 1, 2, 3, 4, 5];
  const bottomRight = [6, 7, 8, 9, 10, 11];

  const renderRow = (indices: number[], top: boolean) =>
    indices.map((index) => (
      <Point
        key={index}
        index={index}
        board={board}
        top={top}
        highlighted={targets.some((move) => move.to === index)}
        selected={selected === index}
        onClick={() => clickPoint(index)}
      />
    ));

  return (
    <div className="flex h-full flex-col bg-[#3a6b3a] text-white">
      <GameMenuBar menus={[{ label: 'Game', items: [{ label: 'New Game', onSelect: newGame }] }]} />
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3" data-game="backgammon">
        <div className="flex items-center justify-between text-sm">
          <span>
            Dice:{' '}
            <span className="inline-flex gap-1 align-middle" data-testid="dice">
              {rolled.length === 0 && <span>—</span>}
              {rolled.map((die, i) => (
                <span key={i} className="inline-flex h-5 w-5 items-center justify-center rounded border border-black bg-white text-xs font-bold text-black">
                  {die}
                </span>
              ))}
            </span>
          </span>
          <button
            type="button"
            onClick={roll}
            disabled={turn !== 'W' || dice.length > 0 || Boolean(winner)}
            className="rounded bg-white/15 px-3 py-1 disabled:opacity-40"
            data-testid="roll"
          >
            Roll
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded border-4 border-[#5a3a1a] bg-[#4b2e12] p-2">
          <div className="flex h-[150px]">
            <div className="flex flex-1">{renderRow(topLeft, true)}</div>
            <div className="flex w-[34px] flex-col items-center justify-center gap-1 bg-[#2e1a08]" onClick={clickBar} role="presentation" data-testid="bar">
              <span className="text-[9px] text-white/60">BAR</span>
              {Array.from({ length: board.bar.B }).map((_, i) => <Checker key={`b${i}`} player="B" />)}
              {Array.from({ length: board.bar.W }).map((_, i) => (
                <span key={`w${i}`} className={selected === 'bar' ? 'ring-2 ring-[#ffff00] rounded-full' : ''}>
                  <Checker player="W" />
                </span>
              ))}
            </div>
            <div className="flex flex-1">{renderRow(topRight, true)}</div>
          </div>
          <div className="flex h-[150px]">
            <div className="flex flex-1">{renderRow(bottomLeft, false)}</div>
            <div className="w-[34px] bg-[#2e1a08]" />
            <div className="flex flex-1">{renderRow(bottomRight, false)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>
            White off: <strong data-testid="off-w">{board.off.W}</strong> · Black off: <strong data-testid="off-b">{board.off.B}</strong>
          </span>
          <button
            type="button"
            onClick={clickOff}
            disabled={!targets.some((move) => move.to === 'off')}
            className="rounded bg-white/15 px-3 py-1 disabled:opacity-40"
            data-testid="off"
          >
            Bear off
          </button>
        </div>
        <p className="text-xs text-white/80" data-testid="status">{status}</p>
      </div>
    </div>
  );
}
