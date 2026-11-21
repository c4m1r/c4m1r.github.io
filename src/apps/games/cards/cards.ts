/**
 * Shared card model for the classic Windows card games (Solitaire, FreeCell).
 * Temporary sketch: layouts and rules follow the public rule sets of each game.
 */

export type Suit = 'S' | 'H' | 'D' | 'C';

export interface Card {
  id: string;
  suit: Suit;
  /** 1 = Ace … 13 = King. */
  rank: number;
  faceUp: boolean;
}

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };

export const isRed = (card: Pick<Card, 'suit'>) => card.suit === 'H' || card.suit === 'D';

export function rankLabel(rank: number): string {
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return String(rank);
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank += 1) {
      deck.push({ id: `${suit}${rank}`, suit, rank, faceUp: false });
    }
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** True when the cards are face up and form a descending run in alternating colours. */
export function isAlternatingRun(cards: Card[]): boolean {
  return cards.every((card, index) => {
    if (!card.faceUp) return false;
    if (index === 0) return true;
    const prev = cards[index - 1];
    return prev.rank === card.rank + 1 && isRed(prev) !== isRed(card);
  });
}

export const cardTitle = (card: Card) => `${rankLabel(card.rank)}${SUIT_SYMBOL[card.suit]}`;
