import useCardAnimations from "~/hooks/useCardAnimations";
import { useCallback, useMemo, useState } from "react";
import { isAllowedToThrow, isWild, sortCards } from "~/utils/game";
import PlayerCards from "~/components/PlayerCards";
import WildCardOptions from "~/components/WildCardOptions";
import CurrentMovePlayerOptions from "~/components/CurrentMovePlayerOptions";
import DrawPile from "~/components/DrawPile";
import DiscardPile from "~/components/DiscardPile";
import BoardLayout from "~/components/BoardLayout";
import {
  yellOne,
  passTurn,
  drawCard,
  discardCard,
} from "~/gameLogic/gameLogic";
import useTranslation from "next-translate/useTranslation";
import HeaderPlayer from "~/components/HeaderPlayer";
import { Card } from "~/components/Card";

export default function GameInProgress({
  room,
  roomId,
  playersActive,
  playerId,
  winner,
  onNewGame,
}) {
  const { t } = useTranslation();
  const [wildCard, setWildCard] = useState(null);
  const playerCount = playersActive?.length || 0;
  const animationEnabled = playerCount <= 6;
  const { drawPileRef, pileRef, onCardAdd, onCardRemove } =
    useCardAnimations(animationEnabled);
  if (!room || !playersActive || playerCount === 0) {
    return null;
  }
  const currentMovePlayer = playersActive[room.currentMove];
  const sortedHands = useMemo(() => {
    const mapping = {};
    playersActive.forEach((player) => {
      const playerKey = String(player.id);
      mapping[playerKey] = sortCards(player.cards);
    });
    return mapping;
  }, [playersActive]);
  const currentPlayer =
    playersActive.find((player) => String(player.id) === String(playerId)) || {
      id: playerId,
      cards: [],
    };
  const currentPlayerCards = sortedHands[String(playerId)] || [];
  const cardsLabel = t("common:cards");
  const yourHandLabel = t("common:your-hand");
  const fallbackCardsLabel = cardsLabel === "common:cards" ? "cards" : cardsLabel;
  const fallbackYourHandLabel =
    yourHandLabel === "common:your-hand" ? "Your hand" : yourHandLabel;
  const yellOneMessage =
    room.yellOne != null
      ? `${t("playerId:yell-one")} ${playersActive[room.yellOne]?.name}`
      : null;

  const onYellOne = (player) => {
    yellOne(roomId, player);
  };

  const onPassTurn = (player) => {
    passTurn(roomId, player, currentMovePlayer.id);
  };

  const onDrawCard = () => {
    drawCard(roomId, playerId);
  };

  const onDiscardACard = (card, color) => {
    if (isWild(card) && !color) {
      setWildCard(card);
      return;
    }
    discardCard(roomId, playerId, card, color);
    setWildCard(null);
  };

  const isCardDisabled = useCallback(
    (card, player) =>
      currentMovePlayer.id != player.id ||
      !isAllowedToThrow(
        card,
        room.discardPile,
        room.discardColor,
        room.drawCount,
        player.cards
      ),
    [
      currentMovePlayer.id,
      room.discardPile,
      room.discardColor,
      room.drawCount,
    ]
  );

  const handDrawer = (
    <div
      id="hand-drawer"
      className="bg-gray-900 bg-opacity-95 border-t border-gray-800 shadow-2xl"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-3 text-white">
        <div className="flex items-center justify-between text-sm md:text-base mb-2">
          <span className="font-semibold">
            {fallbackYourHandLabel}
          </span>
          <span className="text-xs opacity-80">
            {currentPlayerCards.length} {fallbackCardsLabel}
          </span>
        </div>
        <div
          className="overflow-x-auto touch-pan-x"
          style={{ touchAction: "pan-x", maxHeight: "50vh" }}
        >
          <div className="flex items-center gap-3 md:gap-4 py-1">
            {currentPlayerCards.map((card, index) => {
              const disabled = isCardDisabled(card, currentPlayer);
              return (
                <button
                  key={`drawer-${card}-${index}`}
                  onClick={() => onDiscardACard(card)}
                  disabled={disabled}
                  className="focus:outline-none"
                >
                  <Card
                    onRemove={onCardRemove}
                    onAdd={onCardAdd}
                    sizeSM={30}
                    sizeMD={36}
                    card={card}
                    opacity={disabled ? "opacity-50" : "opacity-100"}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const goToHand = useCallback(() => {
    const el = document.getElementById("hand-drawer");
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);
  return (
    <div className="flex flex-1">
      <BoardLayout
        players={playersActive}
        currentPlayerId={playerId}
        currentMovePlayer={currentMovePlayer}
        drawPenalty={room.drawCount}
        onGoToHand={goToHand}
        handDrawer={handDrawer}
        renderPlayer={(player, isCurrentPlayer, isCompact) => (
          <>
            <HeaderPlayer
              color="white"
              type="h1"
              margin="0"
              marginBottom="1"
              title={`${player.name} · ${player.cards.length} cards`}
            >
              <span
                className={
                  currentMovePlayer.id == player.id
                    ? "p-2 rounded text-black font-bold pl-2 animation"
                    : "opacity-50 pl-2"
                }
              >
                {currentMovePlayer.id == player.id ? <span>👉 </span> : null}
                {player.name}
              </span>
            </HeaderPlayer>
            <PlayerCards
              cards={sortedHands[String(player.id)] || []}
              isCurrentPlayer={isCurrentPlayer}
              onDiscardACard={onDiscardACard}
              isCardDisabled={(card) => isCardDisabled(card, player)}
              onCardAdd={onCardAdd}
              onCardRemove={onCardRemove}
              winner={winner}
              showInline={!isCurrentPlayer}
              compact={isCompact && !isCurrentPlayer}
            />
          </>
        )}
        drawPile={
          <DrawPile
            onDrawCard={onDrawCard}
            canDrawFromPile={!room.drawPile}
            isCurrentPlayerTurn={currentMovePlayer.id == playerId}
            drawPileRef={drawPileRef}
          />
        }
        discardPile={
          <DiscardPile
            discardPile={room.discardPile}
            discardColor={room.discardColor}
            pileRef={pileRef}
          />
        }
        playerOptions={
          wildCard ? (
            <WildCardOptions
              onChooseColor={(color) => onDiscardACard(wildCard, color)}
            />
          ) : (
            <CurrentMovePlayerOptions
              currentMovePlayer={currentMovePlayer}
              playerId={playerId}
              onPassTurn={onPassTurn}
              room={room}
              onYellOne={onYellOne}
            />
          )
        }
        yellOneMessage={yellOneMessage}
        winner={winner}
        onNewGame={onNewGame}
      />
    </div>
  );
}
