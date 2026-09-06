"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Chess as ChessGame, Square } from 'chess.js';
import { useDesktopStore } from '@/store/useDesktopStore';

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔'
};

export default function ChessApp() {
  const [game, setGame] = useState(new ChessGame());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const { focusWindow } = useDesktopStore();

  // Helper to trigger re-renders when game state changes
  const updateGame = useCallback(() => {
    setFen(game.fen());
  }, [game]);

  const makeAiMove = useCallback(() => {
    if (game.isGameOver() || game.turn() === 'w') return;

    setIsAiThinking(true);
    setTimeout(() => {
      const moves = game.moves();
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        game.move(randomMove);
        updateGame();
      }
      setIsAiThinking(false);
    }, 500); // 500ms delay for realism
  }, [game, updateGame]);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      makeAiMove();
    }
  }, [fen, game, makeAiMove]);

  const handleSquareClick = (square: Square) => {
    if (game.isGameOver() || game.turn() === 'b') return; // Don't allow clicks during AI turn or game over

    const piece = game.get(square);

    // If we already selected a square
    if (selectedSquare) {
      // If clicking on same square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Try to move
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // Always promote to queen for simplicity in this basic version
        });

        if (move) {
          updateGame();
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
      } catch (e) {
        // Invalid move, falls through to selection logic below
      }
    }

    // Select new piece if it belongs to the player (White)
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setPossibleMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const resetGame = () => {
    const newGame = new ChessGame();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const getStatus = () => {
    if (game.isCheckmate()) return "Checkmate!";
    if (game.isDraw()) return "Draw";
    if (game.isStalemate()) return "Stalemate";
    if (game.isCheck()) return "Check!";
    if (isAiThinking) return "Computer is thinking...";
    return game.turn() === 'w' ? "Your turn (White)" : "Computer's turn (Black)";
  };

  const board = game.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div 
      style={{ 
        display: 'flex', flexDirection: 'column', height: '100%', 
        background: 'linear-gradient(to bottom, #dbe4f0, #c8d8ea)', 
        fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' 
      }}
    >
      
      {/* Windows 7 Style Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '6px 12px',
        background: 'linear-gradient(to bottom, #f0f4f8, #e0e8f0)',
        borderBottom: '1px solid #99aabf', gap: '15px'
      }}>
        <div 
          onClick={resetGame}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            padding: '4px 8px', borderRadius: '3px', color: '#103063'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ fontSize: '16px' }}>🔄</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>New Game</span>
        </div>
        
        <div style={{ flex: 1 }}></div>

        <div style={{
          padding: '4px 12px', background: '#fff', border: '1px solid #99aabf',
          borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
          color: game.isGameOver() ? '#d00' : '#103063',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {getStatus()}
        </div>
      </div>

      {/* Main Board Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        
        {/* 3D-ish Wood/Glass Board Container */}
        <div style={{
          padding: '12px',
          background: 'linear-gradient(135deg, #7c4b26, #4a2810)',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.4)',
          border: '1px solid #3a1f0a'
        }}>
          
          {/* Inner Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(8, 50px)', gridTemplateRows: 'repeat(8, 50px)',
            border: '2px solid #301908', boxShadow: '0 0 10px rgba(0,0,0,0.8)'
          }}>
            {board.map((row, r) => 
              row.map((piece, c) => {
                const rank = 8 - r;
                const file = files[c];
                const square = `${file}${rank}` as Square;
                const isLight = (r + c) % 2 === 0;
                
                const isSelected = selectedSquare === square;
                const isPossibleMove = possibleMoves.includes(square);
                const isLastMove = false; // Could add last move highlighting here
                const inCheck = piece?.type === 'k' && piece.color === game.turn() && game.isCheck();

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    style={{
                      width: '50px', height: '50px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isLight ? '#f3d9b1' : '#b57948',
                      position: 'relative',
                      cursor: game.turn() === 'w' ? 'pointer' : 'default',
                      boxShadow: isLight ? 'inset 0 0 8px rgba(255,255,255,0.2)' : 'inset 0 0 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Selection Overlay */}
                    {isSelected && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 0, 0.4)' }} />
                    )}

                    {/* Check Overlay */}
                    {inCheck && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 0, 0, 0.6)' }} />
                    )}

                    {/* Possible Move Dot */}
                    {isPossibleMove && (
                      <div style={{ 
                        position: 'absolute', width: '14px', height: '14px', 
                        borderRadius: '50%', background: piece ? 'rgba(255,0,0,0.5)' : 'rgba(0,0,0,0.2)' 
                      }} />
                    )}

                    {/* Piece */}
                    {piece && (
                      <span style={{ 
                        fontSize: '38px', 
                        lineHeight: 1,
                        color: piece.color === 'w' ? '#fff' : '#000',
                        textShadow: piece.color === 'w' 
                          ? '0 2px 4px rgba(0,0,0,0.6), 0 -1px 1px rgba(255,255,255,0.4)' 
                          : '0 2px 4px rgba(0,0,0,0.8), 0 -1px 1px rgba(255,255,255,0.2)',
                        zIndex: 1,
                        pointerEvents: 'none',
                        // Unicode specific adjustments to make them look more 3D
                        transform: 'translateY(-2px)'
                      }}>
                        {piece.color === 'w' ? PIECE_SYMBOLS[piece.type.toUpperCase()] : PIECE_SYMBOLS[piece.type]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
