import { useEffect, useState } from 'react';
import { GameMenuBar } from '../GameMenuBar';
import { useNewGameShortcut } from '../gameHooks';
import {
  applyMove, chooseComputerMove, computerTakesDouble, hasWon, initialState, legalMoves, pipCount, rollDice,
  type BackgammonState, type Move, type Player,
} from './backgammonLogic';

/**
 * Internet Backgammon (XP, 7) sketch: you play White (bottom of the board) against the computer (Black).
 * Roll, then click a checker (or the bar) and a highlighted point or the Bear off button.
 * Double offers the cube (the computer takes or drops); Resign gives the game to the computer.
 * A match runs to MATCH_LENGTH points. Temporary sketch of the classic layout.
 */

const MATCH_LENGTH = 3;

type Selection = number | 'bar' | null;
interface Cube { value: number; owner: Player | null }

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function removeDie(dice: number[], die: number): number[] {
  const index = dice.indexOf(die);
  return index < 0 ? dice : [...dice.slice(0, index), ...dice.slice(index + 1)];
}

function Die({ value }: { value: number }) {
  const lit = PIP_LAYOUT[value] ?? [];
  return (
    <span
      className="inline-grid h-[30px] w-[30px] grid-cols-3 grid-rows-3 place-items-center rounded-[6px] p-[4px] shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
      style={{ background: 'radial-gradient(circle at 35% 30%, #fffdf5, #e9dcb8 70%, #cbb88a)', border: '1px solid #6b5a33' }}
    >
      {Array.from({ length: 9 }).map((_, cell) => (
        <span
          key={cell}
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: lit.includes(cell) ? '#1a1a1a' : 'transparent' }}
        />
      ))}
    </span>
  );
}

function Checker({ player, label }: { player: Player; label?: string }) {
  const white = player === 'W';
  return (
    <span
      className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
      style={{
        background: white
          ? 'radial-gradient(circle at 35% 30%, #ffffff, #dcdcdc 55%, #9c9c9c)'
          : 'radial-gradient(circle at 35% 30%, #7a7a7a, #2a2a2a 55%, #000000)',
        border: `1px solid ${white ? '#777' : '#000'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.7)',
        color: white ? '#222' : '#eee',
      }}
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
  const fill = dark ? 'linear-gradient(180deg, #6a3512, #3e1e08)' : 'linear-gradient(180deg, #efd9a6, #c9a66a)';
  const clip = top ? 'polygon(0 0, 100% 0, 50% 100%)' : 'polygon(50% 0, 100% 100%, 0 100%)';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`point ${index + 1}`}
      data-testid={`point-${index}`}
      className="relative flex h-full min-w-0 flex-1 flex-col items-center bg-transparent p-0"
    >
      <span className="absolute inset-0" style={{ background: fill, clipPath: clip }} />
      {highlighted && <span className="absolute inset-0 z-0" style={{ background: 'rgba(255,255,0,0.35)', clipPath: clip }} />}
      <span className={`relative z-10 flex h-full w-full flex-col gap-[2px] py-[3px] ${top ? '' : 'justify-end'}`}>
        {Array.from({ length: shown }).map((_, i) => (
          <span key={i} className={`flex justify-center ${selected && i === shown - 1 ? 'opacity-70' : ''}`}>
            <Checker player={owner} label={i === shown - 1 && count > 5 ? String(count) : undefined} />
          </span>
        ))}
      </span>
      <span className={`absolute left-0 right-0 z-10 text-center text-[9px] text-[#f5e6c4] ${top ? '-top-[11px]' : '-bottom-[11px]'}`}>
        {index + 1}
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
  const [cube, setCube] = useState<Cube>({ value: 1, owner: null });
  const [score, setScore] = useState<Record<Player, number>>({ W: 0, B: 0 });
  const [gameWinner, setGameWinner] = useState<Player | null>(null);
  const [matchWinner, setMatchWinner] = useState<Player | null>(null);
  const [log, setLog] = useState<string[]>(['Roll the dice to begin.']);
  const [chatOn, setChatOn] = useState(true);

  const say = (text: string) => setLog((previous) => [...previous.slice(-60), text]);

  const humanMoves = turn === 'W' && dice.length > 0 && !gameWinner ? legalMoves(board, 'W', dice) : [];
  const targets = selected === null ? [] : humanMoves.filter((move) => move.from === selected);
  const canDouble = turn === 'W' && dice.length === 0 && !gameWinner && (cube.owner === null || cube.owner === 'W');

  const endGame = (winner: Player, points: number) => {
    setGameWinner(winner);
    setDice([]);
    setSelected(null);
    const total = { ...score, [winner]: score[winner] + points };
    setScore(total);
    if (total[winner] >= MATCH_LENGTH) setMatchWinner(winner);
    say(winner === 'W' ? `You win ${points} point${points > 1 ? 's' : ''}.` : `The computer wins ${points} point${points > 1 ? 's' : ''}.`);
  };

  const nextGame = () => {
    setBoard(initialState());
    setDice([]);
    setRolled([]);
    setTurn('W');
    setSelected(null);
    setCube({ value: 1, owner: null });
    setGameWinner(null);
    say('New game.');
  };

  const newMatch = () => {
    setScore({ W: 0, B: 0 });
    setMatchWinner(null);
    setLog(['New match to ' + MATCH_LENGTH + ' points.']);
    nextGame();
  };

  useNewGameShortcut(newMatch);

  // The computer rolls and plays its whole turn after a short pause.
  useEffect(() => {
    if (turn !== 'B' || gameWinner) return;
    const timer = window.setTimeout(() => {
      const shown = rollDice();
      setRolled(shown);
      say(`Computer rolled ${shown.join('-')}.`);
      let current = board;
      let remaining = shown;
      while (remaining.length > 0) {
        const move = chooseComputerMove(current, 'B', remaining);
        if (!move) break;
        current = applyMove(current, 'B', move);
        remaining = removeDie(remaining, move.die);
        if (move.hit) say('Computer hits your checker.');
        if (hasWon(current, 'B')) break;
      }
      setBoard(current);
      if (hasWon(current, 'B')) {
        setTurn('B');
        endGame('B', cube.value);
        return;
      }
      setTurn('W');
      setDice([]);
      say('Your turn: roll the dice.');
    }, 800);
    return () => window.clearTimeout(timer);
    // endGame and say read the latest score through the render that scheduled this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameWinner, board]);

  const roll = () => {
    if (turn !== 'W' || dice.length > 0 || gameWinner) return;
    const values = rollDice();
    setRolled(values);
    setSelected(null);
    say(`You rolled ${values.join('-')}.`);
    if (legalMoves(board, 'W', values).length === 0) {
      setDice([]);
      setTurn('B');
      say('No legal moves. Computer turn.');
      return;
    }
    setDice(values);
  };

  const doubleCube = () => {
    if (!canDouble) return;
    if (computerTakesDouble(board)) {
      const value = cube.value * 2;
      setCube({ value, owner: 'B' });
      say(`Computer accepts the double. Cube is now ${value}.`);
    } else {
      say('Computer drops the double.');
      endGame('W', cube.value);
    }
  };

  const resign = () => {
    if (gameWinner) return;
    say('You resign.');
    endGame('B', cube.value);
  };

  const playMove = (move: Move) => {
    const next = applyMove(board, 'W', move);
    const left = removeDie(dice, move.die);
    setBoard(next);
    setSelected(null);
    if (move.hit) say('You hit a checker.');
    if (hasWon(next, 'W')) {
      setDice([]);
      endGame('W', cube.value);
      return;
    }
    if (left.length === 0 || legalMoves(next, 'W', left).length === 0) {
      setDice([]);
      setTurn('B');
      return;
    }
    setDice(left);
  };

  const clickPoint = (index: number) => {
    if (turn !== 'W' || dice.length === 0 || gameWinner) return;
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

  const bearOff = () => {
    const target = targets.find((move) => move.to === 'off');
    if (target) playMove(target);
  };

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

  const topLeft = [23, 22, 21, 20, 19, 18];
  const topRight = [17, 16, 15, 14, 13, 12];
  const bottomLeft = [0, 1, 2, 3, 4, 5];
  const bottomRight = [6, 7, 8, 9, 10, 11];
  const playable = turn === 'W' && dice.length === 0 && !gameWinner;

  return (
    <div className="flex h-full flex-col bg-[#2b1a0c] text-[#f5e6c4]">
      <GameMenuBar
        menus={[
          { label: 'Game', items: [
            { label: 'New Match', onSelect: newMatch },
            { label: 'Next Game', disabled: !gameWinner || Boolean(matchWinner), onSelect: nextGame },
            { label: 'Resign', disabled: turn !== 'W' || Boolean(gameWinner), onSelect: resign },
          ] },
          { label: 'Help', items: [
            { label: 'About Internet Backgammon', onSelect: () => say('Internet Backgammon sketch: you are White, the computer is Black.') },
          ] },
        ]}
      />
      <div className="flex min-h-0 flex-1 gap-2 p-2" data-game="backgammon">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col rounded-md border-[6px] border-[#4a2a10] p-[6px]" style={{ background: 'linear-gradient(180deg, #3a2010, #241206)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)' }}>
            <div className="flex min-h-0 flex-1">
              <div className="flex flex-1">{renderRow(topLeft, true)}</div>
              <div
                className="flex w-[22px] flex-col items-center justify-center gap-1"
                style={{ background: 'linear-gradient(90deg, #2a1608, #5a3416, #2a1608)' }}
                onClick={clickBar}
                role="presentation"
                data-testid="bar"
              >
                {Array.from({ length: board.bar.B }).map((_, i) => <Checker key={`b${i}`} player="B" />)}
                {Array.from({ length: board.bar.W }).map((_, i) => (
                  <span key={`w${i}`} className={selected === 'bar' ? 'rounded-full ring-2 ring-[#ffff00]' : ''}>
                    <Checker player="W" />
                  </span>
                ))}
              </div>
              <div className="flex flex-1">{renderRow(topRight, true)}</div>
            </div>
            <div className="flex min-h-0 flex-1">
              <div className="flex flex-1">{renderRow(bottomLeft, false)}</div>
              <div className="w-[22px]" style={{ background: 'linear-gradient(90deg, #2a1608, #5a3416, #2a1608)' }} />
              <div className="flex flex-1">{renderRow(bottomRight, false)}</div>
            </div>
          </div>

          <div className="flex h-[92px] gap-2">
            <div className="flex min-w-0 flex-1 flex-col rounded border border-[#4a2a10] bg-white/95 p-1 text-[11px] text-black">
              {chatOn ? (
                <div className="flex-1 overflow-y-auto" data-testid="chat">
                  {log.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              ) : (
                <div className="flex-1 text-gray-500">Chat is off.</div>
              )}
            </div>
            <div className="flex w-[70px] flex-col justify-center gap-1 text-[11px]">
              <label className="flex items-center gap-1"><input type="radio" name="chat" checked={chatOn} onChange={() => setChatOn(true)} />on</label>
              <label className="flex items-center gap-1"><input type="radio" name="chat" checked={!chatOn} onChange={() => setChatOn(false)} />off</label>
            </div>
          </div>
        </div>

        <aside className="flex w-[150px] shrink-0 flex-col gap-2 text-[11px]">
          <div className="rounded border border-[#4a2a10] p-2">
            <div className="font-bold">White (You)</div>
            <div>Pips: <strong data-testid="pips-w">{pipCount(board, 'W')}</strong></div>
            <div>Score: <strong data-testid="score-w">{score.W}</strong></div>
            <div>Off: <strong data-testid="off-w">{board.off.W}</strong></div>
          </div>
          <div className="rounded border border-[#4a2a10] p-2">
            <div className="font-bold">Black (Computer)</div>
            <div>Pips: <strong data-testid="pips-b">{pipCount(board, 'B')}</strong></div>
            <div>Score: <strong data-testid="score-b">{score.B}</strong></div>
            <div>Off: <strong data-testid="off-b">{board.off.B}</strong></div>
          </div>
          <div className="text-center">Match points: <strong>{MATCH_LENGTH}</strong></div>
          <div className="flex items-center justify-between rounded border border-[#4a2a10] p-2">
            <span>Cube</span>
            <strong data-testid="cube">{cube.value}{cube.owner ? ` (${cube.owner === 'W' ? 'you' : 'computer'})` : ''}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Dice</span>
            <span className="flex gap-1" data-testid="dice">
              {rolled.map((die, i) => <Die key={i} value={die} />)}
            </span>
          </div>
          <button type="button" onClick={roll} disabled={!playable} data-testid="roll" className="rounded border border-[#c9a66a] bg-white/10 px-2 py-1 disabled:opacity-40">Roll</button>
          <button type="button" onClick={doubleCube} disabled={!canDouble} data-testid="double" className="rounded border border-[#c9a66a] bg-white/10 px-2 py-1 disabled:opacity-40">Double</button>
          <button type="button" onClick={resign} disabled={turn !== 'W' || Boolean(gameWinner)} data-testid="resign" className="rounded border border-[#c9a66a] bg-white/10 px-2 py-1 disabled:opacity-40">Resign</button>
          <button type="button" onClick={bearOff} disabled={!targets.some((move) => move.to === 'off')} data-testid="off" className="rounded border border-[#c9a66a] bg-white/10 px-2 py-1 disabled:opacity-40">Bear off</button>
          {gameWinner && !matchWinner && (
            <button type="button" onClick={nextGame} className="rounded border border-[#c9a66a] bg-white/10 px-2 py-1">Next game</button>
          )}
          {matchWinner && (
            <div className="text-center font-bold" data-testid="match-over">{matchWinner === 'W' ? 'You won the match!' : 'The computer won the match.'}</div>
          )}
        </aside>
      </div>
    </div>
  );
}
