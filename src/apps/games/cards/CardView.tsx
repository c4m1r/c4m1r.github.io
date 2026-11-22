import { CARD_HEIGHT, CARD_WIDTH, isRed, rankLabel, SUIT_SYMBOL, type Card } from './cards';

interface CardViewProps {
  card?: Card;
  selected?: boolean;
  onClick?: () => void;
  /** Used for empty pile placeholders: the classic empty slot is a thin dark outline on the felt. */
  placeholder?: string;
  testId?: string;
}

const sizeStyle = { width: CARD_WIDTH, height: CARD_HEIGHT };

export function CardView({ card, selected = false, onClick, placeholder, testId }: CardViewProps) {
  if (!card) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={placeholder ?? 'empty'}
        data-testid={testId}
        style={sizeStyle}
        className="border border-black/50 bg-black/10"
      />
    );
  }

  if (!card.faceUp) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="face-down card"
        data-testid={testId}
        style={sizeStyle}
        className="relative border border-black bg-[#000080] p-[4px]"
      >
        <span
          className="block h-full w-full border border-white"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #c0c0ff 0 1px, transparent 1px 5px), repeating-linear-gradient(-45deg, #c0c0ff 0 1px, transparent 1px 5px)',
          }}
        />
      </button>
    );
  }

  const colour = isRed(card) ? '#c00000' : '#000000';
  const symbol = SUIT_SYMBOL[card.suit];
  const isFace = card.rank > 10;
  const label = rankLabel(card.rank);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} ${symbol}`}
      aria-pressed={selected}
      data-testid={testId}
      style={{ ...sizeStyle, color: colour }}
      className={`relative border bg-white font-serif text-left leading-none ${selected ? 'border-[#ffff00] shadow-[0_0_0_1px_#ffff00]' : 'border-black'}`}
    >
      <span className="absolute left-[3px] top-[2px] flex flex-col items-center text-[12px] font-bold">
        <span>{label}</span>
        <span className="text-[10px]">{symbol}</span>
      </span>
      <span className="absolute inset-0 flex items-center justify-center text-[30px]">
        {isFace ? (
          <span className="flex flex-col items-center">
            <span className="text-[26px] font-bold">{label}</span>
            <span className="text-[16px]">{symbol}</span>
          </span>
        ) : (
          <span>{symbol}</span>
        )}
      </span>
      <span className="absolute bottom-[2px] right-[3px] flex rotate-180 flex-col items-center text-[12px] font-bold">
        <span>{label}</span>
        <span className="text-[10px]">{symbol}</span>
      </span>
    </button>
  );
}
