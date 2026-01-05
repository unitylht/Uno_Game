import React, { memo } from "react";
import { Card, BackCard } from "~/components/Card";

function PlayerCards({
  cards,
  isCurrentPlayer,
  isCardDisabled,
  onDiscardACard,
  onCardAdd,
  onCardRemove,
  winner,
  showInline = true,
  compact = false,
}) {
  if (!showInline && isCurrentPlayer) {
    return (
      <div className="w-full text-center text-xs md:text-sm text-gray-200 py-3">
        <span className="opacity-80">Use the hand drawer to play your cards.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className="w-full overflow-x-auto touch-pan-x flex items-center gap-2 py-2 px-2"
        style={{ touchAction: "pan-x" }}
      >
        <div className="flex items-center gap-1">
          {[...Array(Math.min(3, cards.length)).keys()].map((idx) => (
            <BackCard
              key={`compact-${idx}`}
              sizeSM={8}
              sizeMD={10}
              onRemove={onCardRemove}
              onAdd={onCardAdd}
              allowSmallSize
            />
          ))}
        </div>
        <span className="text-xs text-gray-100 whitespace-nowrap">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </span>
      </div>
    );
  }

  const containerClasses = isCurrentPlayer
    ? "flex w-full flex-auto overflow-x-auto touch-pan-x pl-4 lg:pl-6"
    : "w-full overflow-x-auto touch-pan-x px-2 md:px-4";
  const stackClasses = isCurrentPlayer
    ? "flex flex-row flex-nowrap justify-start gap-4 md:gap-6 py-2"
    : "flex flex-row flex-nowrap justify-start items-center gap-3 py-2";

  return (
    <div className={containerClasses} style={{ touchAction: "pan-x" }}>
      <div className={stackClasses}>
        {cards.map((card, index) => {
          const disabled = isCardDisabled(card);

          return isCurrentPlayer ? (
            <div key={`${card}-${index}`} className="flex flex-col justify-center">
              <button
                onClick={() => onDiscardACard(card)}
                disabled={disabled}
                className="focus:outline-none"
              >
                <Card
                  onRemove={onCardRemove}
                  onAdd={onCardAdd}
                  sizeSM={26}
                  sizeMD={34}
                  card={card}
                  opacity={disabled ? "opacity-50" : "opacity-100"}
                />
              </button>
            </div>
          ) : (
            <div key={`${card}_back_${index}`} className="flex-shrink-0">
              {winner ? (
                <Card
                  onRemove={onCardRemove}
                  onAdd={onCardAdd}
                  card={card}
                  sizeSM={12}
                  sizeMD={16}
                />
              ) : (
                <BackCard
                  onRemove={onCardRemove}
                  onAdd={onCardAdd}
                  sizeSM={12}
                  sizeMD={16}
                  allowSmallSize
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PlayerCards, (prev, next) => {
  return (
    prev.isCurrentPlayer === next.isCurrentPlayer &&
    prev.winner === next.winner &&
    prev.showInline === next.showInline &&
    prev.compact === next.compact &&
    prev.cards.length === next.cards.length &&
    prev.cards.every((card, idx) => card === next.cards[idx])
  );
});
