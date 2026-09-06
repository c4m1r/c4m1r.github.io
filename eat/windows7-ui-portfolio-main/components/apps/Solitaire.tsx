"use client";

import React, { useState, useEffect } from 'react';
import { useDesktopStore } from '@/store/useDesktopStore';

type Suit = '♥' | '♦' | '♣' | '♠';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type Color = 'red' | 'black';

interface Card {
  id: string;
  suit: Suit;
  value: Value;
  color: Color;
  rank: number;
  faceUp: boolean;
}

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: { [key in Suit]: Card[] };
  tableau: Card[][];
}

const SUITS: Suit[] = ['♥', '♦', '♣', '♠'];
const VALUES: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
    VALUES.forEach((value, index) => {
      deck.push({ id: `${value}-${suit}`, suit, value, color, rank: index + 1, faceUp: false });
    });
  });
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function Solitaire() {
  const { focusWindow } = useDesktopStore();
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Selection state: tracks which card is selected and where it came from
  const [selected, setSelected] = useState<{
    card: Card;
    source: 'waste' | { type: 'foundation', suit: Suit } | { type: 'tableau', col: number };
    cardIndex: number; // For tableau multi-card moves
  } | null>(null);

  const startNewGame = () => {
    const deck = createDeck();
    const tableau: Card[][] = Array.from({ length: 7 }, () => []);
    
    // Deal tableau
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.pop()!;
        if (row === col) card.faceUp = true;
        tableau[col].push(card);
      }
    }

    setGameState({
      stock: deck,
      waste: [],
      foundations: { '♥': [], '♦': [], '♣': [], '♠': [] },
      tableau
    });
    setSelected(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startNewGame();
  }, []);

  if (!gameState) return null;

  // --- LOGIC / ACTIONS ---

  const handleStockClick = () => {
    setSelected(null);
    const newState = { ...gameState };
    
    if (newState.stock.length > 0) {
      // Draw 1 card
      const card = newState.stock.pop()!;
      card.faceUp = true;
      newState.waste.push(card);
    } else if (newState.waste.length > 0) {
      // Recycle waste to stock
      newState.stock = newState.waste.reverse().map(c => ({ ...c, faceUp: false }));
      newState.waste = [];
    }
    
    setGameState(newState);
  };

  const handleWasteClick = () => {
    if (gameState.waste.length === 0) return;
    const topCard = gameState.waste[gameState.waste.length - 1];
    
    // If we click the already selected waste card, deselect
    if (selected?.source === 'waste') {
      setSelected(null);
      return;
    }
    
    setSelected({ card: topCard, source: 'waste', cardIndex: gameState.waste.length - 1 });
  };

  const handleFoundationClick = (suit: Suit) => {
    const foundationPile = gameState.foundations[suit];
    
    if (selected) {
      // Try to move selected card TO foundation
      // Only 1 card can be moved to foundation at a time
      const isBottomCard = selected.source === 'waste' || 
        (typeof selected.source === 'object' && 'col' in selected.source && selected.cardIndex === gameState.tableau[selected.source.col].length - 1);
        
      if (!isBottomCard) {
        setSelected(null); // Invalid: trying to move multiple cards to foundation
        return;
      }

      const topFoundationRank = foundationPile.length > 0 ? foundationPile[foundationPile.length - 1].rank : 0;
      
      if (selected.card.suit === suit && selected.card.rank === topFoundationRank + 1) {
        // Valid move!
        executeMove(selected, { type: 'foundation', suit });
        return;
      }
    }

    // If nothing selected, or invalid move, try to select from foundation
    if (foundationPile.length > 0) {
      const topCard = foundationPile[foundationPile.length - 1];
      if (selected?.card.id === topCard.id) {
        setSelected(null); // Deselect
      } else {
        setSelected({ card: topCard, source: { type: 'foundation', suit }, cardIndex: foundationPile.length - 1 });
      }
    } else {
      setSelected(null);
    }
  };

  const handleTableauClick = (colIndex: number, cardIndex?: number) => {
    const colPile = gameState.tableau[colIndex];
    
    // If clicking empty tableau
    if (colPile.length === 0) {
      if (selected) {
        // Only Kings can go on empty spaces
        if (selected.card.rank === 13) {
          executeMove(selected, { type: 'tableau', col: colIndex });
        } else {
          setSelected(null);
        }
      }
      return;
    }

    const clickedCard = cardIndex !== undefined ? colPile[cardIndex] : colPile[colPile.length - 1];

    if (selected) {
      // Try to move TO this tableau
      const topCard = colPile[colPile.length - 1];
      
      // Valid move to tableau: alternating color, rank is exactly 1 less
      if (selected.card.color !== topCard.color && selected.card.rank === topCard.rank - 1) {
        executeMove(selected, { type: 'tableau', col: colIndex });
        return;
      }
    }

    // If we reach here, we are selecting a card (must be face up)
    if (clickedCard.faceUp) {
      if (selected?.card.id === clickedCard.id) {
        setSelected(null);
      } else {
        setSelected({ card: clickedCard, source: { type: 'tableau', col: colIndex }, cardIndex: cardIndex! });
      }
    }
  };

  const executeMove = (
    from: { card: Card; source: 'waste' | { type: 'foundation', suit: Suit } | { type: 'tableau', col: number }; cardIndex: number },
    to: { type: 'foundation', suit: Suit } | { type: 'tableau', col: number }
  ) => {
    const newState = { ...gameState };
    let cardsToMove: Card[] = [];

    // REMOVE FROM SOURCE
    if (from.source === 'waste') {
      cardsToMove = [newState.waste.pop()!];
    } else if (typeof from.source === 'object' && from.source.type === 'foundation') {
      cardsToMove = [newState.foundations[(from.source as { type: 'foundation', suit: Suit }).suit].pop()!];
    } else if (typeof from.source === 'object' && from.source.type === 'tableau') {
      const colPile = newState.tableau[(from.source as { type: 'tableau', col: number }).col];
      cardsToMove = colPile.splice(from.cardIndex, colPile.length - from.cardIndex);
      // Flip up new top card if needed
      if (colPile.length > 0 && !colPile[colPile.length - 1].faceUp) {
        colPile[colPile.length - 1].faceUp = true;
      }
    }

    // ADD TO DESTINATION
    if (to.type === 'foundation') {
      newState.foundations[to.suit].push(cardsToMove[0]);
    } else if (to.type === 'tableau') {
      newState.tableau[to.col].push(...cardsToMove);
    }

    setGameState(newState);
    setSelected(null);
  };

  const checkWin = () => {
    return SUITS.every(suit => gameState.foundations[suit].length === 13);
  };

  // --- RENDER HELPERS ---
  const isCardSelected = (c: Card) => {
    if (!selected) return false;
    if (selected.source === 'waste' && selected.card.id === c.id) return true;
    if (typeof selected.source === 'object' && 'suit' in selected.source && selected.card.id === c.id) return true;
    if (typeof selected.source === 'object' && 'col' in selected.source) {
      // Highlight the selected card and all cards below it in the stack
      const sourceCol = gameState.tableau[selected.source.col];
      const cardIdx = sourceCol.findIndex(sc => sc.id === c.id);
      return cardIdx >= selected.cardIndex;
    }
    return false;
  };

  return (
    <div 
      style={{ 
        display: 'flex', flexDirection: 'column', height: '100%', 
        background: '#006600', // Classic felt green
        fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' 
      }}
    >
      
      {/* Top Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 12px',
        background: 'linear-gradient(to bottom, #f0f4f8, #e0e8f0)',
        borderBottom: '1px solid #99aabf', gap: '15px'
      }}>
        <div 
          onClick={startNewGame}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            padding: '2px 8px', borderRadius: '3px', color: '#103063'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Game</span>
        </div>
        <div style={{ flex: 1 }}></div>
        {checkWin() && <div style={{ color: '#006600', fontWeight: 'bold' }}>You Won!</div>}
      </div>

      {/* Game Board */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px', minWidth: '700px', overflowY: 'auto' }}>
        
        {/* TOP ROW: Stock, Waste, (space), Foundations */}
        <div style={{ display: 'flex', gap: '20px', height: '140px' }}>
          
          {/* Stock Pile */}
          <div 
            onClick={handleStockClick}
            style={pileStyle}
          >
            {gameState.stock.length > 0 && <CardBack />}
          </div>

          {/* Waste Pile */}
          <div onClick={handleWasteClick} style={pileStyle}>
            {gameState.waste.length > 0 && (
              <PlayingCard card={gameState.waste[gameState.waste.length - 1]} isSelected={isCardSelected(gameState.waste[gameState.waste.length - 1])} />
            )}
          </div>

          <div style={{ flex: 1 }} /> {/* Spacer */}

          {/* Foundation Piles */}
          {SUITS.map(suit => (
            <div key={`foundation-${suit}`} onClick={() => handleFoundationClick(suit)} style={{...pileStyle, position: 'relative'}}>
              {/* Suit watermark */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'rgba(0,0,0,0.2)' }}>
                {suit}
              </div>
              {gameState.foundations[suit].length > 0 && (
                <PlayingCard 
                  card={gameState.foundations[suit][gameState.foundations[suit].length - 1]} 
                  isSelected={isCardSelected(gameState.foundations[suit][gameState.foundations[suit].length - 1])}
                />
              )}
            </div>
          ))}

        </div>

        {/* BOTTOM ROW: Tableau */}
        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
          {gameState.tableau.map((colPile, colIndex) => (
            <div key={`tableau-${colIndex}`} onClick={() => handleTableauClick(colIndex)} style={{...pileStyle, height: 'auto', background: 'transparent', border: 'none', position: 'relative'}}>
              {colPile.length === 0 ? (
                // Empty slot outline
                <div style={pileStyle} />
              ) : (
                colPile.map((card, cardIndex) => (
                  <div 
                    key={card.id} 
                    style={{ position: 'absolute', top: `${cardIndex * 24}px`, zIndex: cardIndex }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTableauClick(colIndex, cardIndex);
                    }}
                  >
                    {card.faceUp ? (
                      <PlayingCard card={card} isSelected={isCardSelected(card)} />
                    ) : (
                      <CardBack />
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// --- STYLES & COMPONENTS ---

const pileStyle: React.CSSProperties = {
  width: '100px',
  height: '140px',
  border: '2px solid rgba(0,0,0,0.2)',
  borderRadius: '6px',
  boxSizing: 'border-box'
};

const CardBack = () => (
  <div style={{
    width: '100px', height: '140px', background: '#0033cc', borderRadius: '6px',
    border: '1px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    backgroundImage: 'linear-gradient(45deg, #002299 25%, transparent 25%, transparent 75%, #002299 75%, #002299), linear-gradient(45deg, #002299 25%, transparent 25%, transparent 75%, #002299 75%, #002299)',
    backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px',
    cursor: 'pointer'
  }} />
);

const PlayingCard = ({ card, isSelected }: { card: Card, isSelected?: boolean }) => {
  return (
    <div style={{
      width: '100px', height: '140px', background: '#fff', borderRadius: '6px',
      border: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      padding: '4px', position: 'relative',
      filter: isSelected ? 'brightness(0.8) sepia(0.5) hue-rotate(-50deg)' : 'none',
      cursor: 'pointer'
    }}>
      {isSelected && (
        <div style={{ position: 'absolute', inset: 0, border: '3px solid #ffcc00', borderRadius: '6px', zIndex: 10, pointerEvents: 'none' }} />
      )}
      
      {/* Top left value */}
      <div style={{ color: card.color, fontSize: '16px', fontWeight: 'bold', lineHeight: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
        <span>{card.value}</span>
        <span style={{ fontSize: '14px', marginTop: '-2px' }}>{card.suit}</span>
      </div>

      {/* Center huge suit */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: card.color }}>
        {card.suit}
      </div>
    </div>
  );
};
