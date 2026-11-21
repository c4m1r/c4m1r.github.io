import { isRed, rankLabel, SUIT_SYMBOL, type Card } from './cards';

interface CardViewProps {
  card?: Card;
  selected?: boolean;
  onClick?: () => void;
  /** Used for empty pile placeholders; shows nothing but a dashed outline. */
  placeholder?: string;
  testId?: string;
}

export function CardView({ card, selected = false, onClick, placeholder, testId }: CardViewProps) {
  if (!card) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={placeholder ?? 'empty'}
        data-testid={testId}
        className="h-[72px] w-[52px] rounded border-2 border-dashed border-white/40 text-lg text-white/40"
      >
        {placeholder ?? ''}
      </button>
    );
  }

  if (!card.faceUp) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="face-down card"
        data-testid={testId}
        className="h-[72px] w-[52px] rounded border border-[#1d3f8f] bg-[#2f5fc0] shadow"
      />
    );
  }

  const colour = isRed(card) ? 'text-[#c0142c]' : 'text-[#111]';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${rankLabel(card.rank)} ${SUIT_SYMBOL[card.suit]}`}
      aria-pressed={selected}
      data-testid={testId}
      className={`flex h-[72px] w-[52px] flex-col justify-between rounded border bg-white p-1 text-left text-xs font-bold shadow ${colour} ${selected ? 'ring-2 ring-yellow-300 -translate-y-1' : 'border-[#999]'}`}
    >
      <span>{rankLabel(card.rank)}{SUIT_SYMBOL[card.suit]}</span>
      <span className="self-end">{SUIT_SYMBOL[card.suit]}</span>
    </button>
  );
}
