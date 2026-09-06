import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';

const EMOJIS = ['🚀', '💻', '🎨', '🎮', '🎧', '📷', '🍕', '⚡'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
    setIsProcessing(false);
  };

  const handleCardClick = (index: number) => {
    if (
      isProcessing || 
      cards[index].isFlipped || 
      cards[index].isMatched
    ) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves(m => m + 1);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (indices: number[]) => {
    const [first, second] = indices;
    if (cards[first].emoji === cards[second].emoji) {
      const newCards = [...cards];
      newCards[first].isMatched = true;
      newCards[second].isMatched = true;
      setCards(newCards);
      setFlippedIndices([]);
      setIsProcessing(false);
      
      if (newCards.every(c => c.isMatched)) {
        setIsWon(true);
      }
    } else {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
        setFlippedIndices([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm">
       {/* Header */}
       <div className="flex justify-between items-center w-full mb-4 sm:mb-6 px-1 sm:px-2">
          <div className="flex items-center gap-2">
             <span className="text-xl sm:text-2xl">🧠</span>
             <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Memory Match</h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Moves: {moves}</span>
             <button 
                onClick={initializeGame}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                title="Restart Game"
             >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
             </button>
          </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full perspective-1000">
          {cards.map((card, index) => (
             <div key={card.id} className="aspect-square relative cursor-pointer group" onClick={() => handleCardClick(index)}>
                <motion.div
                   className="w-full h-full absolute inset-0 preserve-3d"
                   initial={false}
                   animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                   transition={{ duration: 0.4 }}
                   style={{ transformStyle: 'preserve-3d' }}
                >
                   {/* Front (Hidden) */}
                   <div 
                    className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-500/30 rounded-lg sm:rounded-xl flex items-center justify-center backface-hidden shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backfaceVisibility: 'hidden' }}
                   >
                      <span className="text-xl sm:text-2xl opacity-40">?</span>
                   </div>

                   {/* Back (Revealed) */}
                   <div 
                    className="absolute inset-0 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center backface-hidden shadow-md"
                    style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                   >
                      <span className="text-2xl sm:text-3xl">{card.emoji}</span>
                   </div>
                </motion.div>
             </div>
          ))}
       </div>

       {/* Win Message */}
       {isWon && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl p-4 text-center"
          >
             <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mb-2 sm:mb-4 drop-shadow-lg" />
             <h4 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">You Won!</h4>
             <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 font-medium text-sm sm:text-base">Completed in {moves} moves</p>
             <button 
                onClick={initializeGame}
                className="px-6 py-2 sm:px-8 sm:py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 text-sm sm:text-base"
             >
                Play Again
             </button>
          </motion.div>
       )}
    </div>
  );
};

export default MemoryGame;