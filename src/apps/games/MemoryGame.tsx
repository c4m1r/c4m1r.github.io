import { useState } from 'react';

const SYMBOLS = ['🍒', '🚀', '🎮', '🛰️', '💾', '👾', '⭐', '🧩'];
interface MemoryCard { id: number; symbol: string; }

function shuffleDeck(): MemoryCard[] {
  return [...SYMBOLS, ...SYMBOLS]
    .map((symbol, index) => ({ symbol, sort: Math.random(), id: index }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ symbol, id }) => ({ symbol, id }));
}

export function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(shuffleDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const flip = (index: number) => {
    if (locked || flipped.includes(index) || matched.includes(cards[index].symbol)) return;
    if (flipped.length === 1) {
      const nextFlipped = [flipped[0], index];
      const isMatch = cards[flipped[0]]?.symbol === cards[index]?.symbol;
      setMoves((value) => value + 1);
      setLocked(true);
      setFlipped(nextFlipped);
      window.setTimeout(() => {
        if (isMatch) {
          const symbol = cards[index]?.symbol;
          if (symbol) setMatched((current) => current.includes(symbol) ? current : [...current, symbol]);
        }
        setFlipped([]);
        setLocked(false);
      }, isMatch ? 450 : 900);
    } else setFlipped([index]);
  };

  const reset = () => {
    setCards(shuffleDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  };

  const won = matched.length === SYMBOLS.length;
  return (
    <div className="h-full w-full overflow-auto bg-[#ece9d8] p-4 text-[#222]">
      <header className="mx-auto mb-4 flex max-w-[520px] items-center justify-between">
        <div><h2 className="text-lg font-bold text-[#173b79]">Memory</h2><p className="text-xs text-gray-600">Find all matching pairs</p></div>
        <div className="text-right"><div className="text-[10px] uppercase text-gray-500">Moves</div><strong className="font-mono text-xl">{moves}</strong></div>
      </header>
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        {cards.map((card, index) => {
          const visible = flipped.includes(index) || matched.includes(card.symbol);
          return <button key={card.id} type="button" onClick={() => flip(index)} aria-label={visible ? card.symbol : 'Reveal card'}
            className={`aspect-square rounded border-2 text-2xl shadow-sm transition-all sm:text-4xl ${visible ? 'border-[#7d9ac6] bg-white' : 'border-[#777] bg-gradient-to-br from-[#4778bd] to-[#183c75] text-white hover:brightness-110'}`}>
            {visible ? card.symbol : '✦'}
          </button>;
        })}
      </div>
      {won && <div className="mx-auto mt-4 max-w-[520px] rounded border border-green-700 bg-green-100 p-3 text-center text-sm font-bold text-green-900">All pairs found in {moves} moves!</div>}
      <div className="mt-4 flex justify-center"><button type="button" onClick={reset} className="rounded border border-[#777] bg-[#e6e2d3] px-4 py-2 text-xs shadow-[inset_1px_1px_#fff,inset_-1px_-1px_#888] hover:bg-white">New game</button></div>
    </div>
  );
}
