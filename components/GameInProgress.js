import { useCallback, useEffect, useMemo, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import BoardLayout from "~/components/BoardLayout";
import CurrentMovePlayerOptions from "~/components/CurrentMovePlayerOptions";
import DiscardPile from "~/components/DiscardPile";
import DrawPile from "~/components/DrawPile";
import HeaderPlayer from "~/components/HeaderPlayer";
import PlayerCards from "~/components/PlayerCards";
import { Card } from "~/components/Card";
import WildCardOptions from "~/components/WildCardOptions";
import useCardAnimations from "~/hooks/useCardAnimations";
import {
  discardCard,
  drawCard,
  passTurn,
  yellOne,
} from "~/gameLogic/gameLogic";
import { isAllowedToThrow, isWild, sortCards } from "~/utils/game";

const HAND_DRAWER_HEIGHT = 240;

export default function GameInProgress({
  room,
  roomId,
  playersActive,
  playerId,
  winner,
  onNewGame,
}) {
  const { t } = useTranslation();
  const translateOrDefault = (key, fallback) => {
    const text = t(key);
    return !text || text === key ? fallback : text;
  };
  const [wildCard, setWildCard] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [forceInlineHand, setForceInlineHand] = useState(false);

  const playersActiveList = useMemo(() => playersActive || [], [playersActive]);
  const playerCount = playersActiveList.length;
  const animationEnabled = playerCount <= 6;
  const { drawPileRef, pileRef, onCardAdd, onCardRemove } =
    useCardAnimations(animationEnabled);

  useEffect(() => {
    const updateLayout = () => {
      if (typeof window === "undefined") return;
      const { innerHeight = 0, innerWidth = 1 } = window;
      const isPortrait = innerHeight >= innerWidth;
      const compactHeight = innerHeight < 650;
      setForceInlineHand(compactHeight || isPortrait);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("orientationchange", updateLayout);
    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("orientationchange", updateLayout);
    };
  }, []);

  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => setActionError(null), 3200);
    return () => clearTimeout(timer);
  }, [actionError]);

  const derived = useMemo(() => {
    const currentMovePlayer =
      room &&
      typeof room.currentMove === "number" &&
      playersActiveList[room.currentMove]
        ? playersActiveList[room.currentMove]
        : null;

    const sortedHands = playersActiveList.reduce((acc, player) => {
      acc[String(player.id)] = sortCards(player.cards || []);
      return acc;
    }, {});

    const currentPlayer =
      playersActiveList.find(
        (player) => String(player.id) === String(playerId)
      ) || { id: playerId, cards: [] };

    return {
      currentMovePlayer,
      sortedHands,
      currentPlayer,
    };
  }, [playersActiveList, playerId, room]);

  if (!room || !playersActiveList.length || !derived.currentMovePlayer) {
    return null;
  }

  const discardPile = room.discardPile;
  const discardColor = room.discardColor ?? null;
  const drawCount = room.drawCount ?? 0;

  const cardsLabel = translateOrDefault("common:cards", "Cards");
  const yourHandLabel = translateOrDefault("common:your-hand", "Your hand");
  const fallbackActionError = translateOrDefault(
    "common:action-error",
    "Action failed. Please try again."
  );
  const fallbackCardsLabel =
    cardsLabel === "common:cards" ? "cards" : cardsLabel;
  const fallbackYourHandLabel =
    yourHandLabel === "common:your-hand" ? "Your hand" : yourHandLabel;

  const yellOneMessage =
    room?.yellOne != null && playersActiveList[room.yellOne]
      ? `${t("playerId:yell-one")} ${
          playersActiveList[room.yellOne]?.name || ""
        }`
      : null;

  const setError = (message) => {
    setActionError(message || fallbackActionError);
  };

  const onYellOne = (player) => {
    yellOne(roomId, player).catch(() => setError(fallbackActionError));
  };

  const onPassTurn = (player) => {
    const { currentMovePlayer } = derived;
    if (!currentMovePlayer) return;
    passTurn(roomId, player, currentMovePlayer.id).catch(() =>
      setError(fallbackActionError)
    );
  };

  const onDrawCard = () => {
    drawCard(roomId, playerId).catch(() => setError(fallbackActionError));
  };

  const onDiscardACard = (card, color) => {
    if (isWild(card) && !color) {
      setWildCard(card);
      return;
    }
    discardCard(roomId, playerId, card, color)
      .then(() => setWildCard(null))
      .catch(() => setError(fallbackActionError));
  };

  const isCardDisabled = useCallback(
    (card, player) => {
      const { currentMovePlayer } = derived;
      return (
        !currentMovePlayer ||
        currentMovePlayer.id !== player.id ||
        !isAllowedToThrow(
          card,
          discardPile,
          discardColor,
          drawCount,
          player.cards
        )
      );
    },
    [derived, discardPile, discardColor, drawCount]
  );

  const handDrawer = (
    <div
      id="hand-drawer"
      className="bg-gradient-to-b from-gray-900 via-slate-900 to-black bg-opacity-95 border-t border-gray-800 shadow-2xl overflow-y-auto"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "100%",
      }}
    >
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-3 text-white">
        <div className="flex items-center justify-between text-sm md:text-base mb-2">
          <span className="font-semibold tracking-wide">
            {fallbackYourHandLabel}
          </span>
          <span className="text-xs opacity-80">
            {derived.sortedHands[String(playerId)]?.length || 0}{" "}
            {fallbackCardsLabel}
          </span>
        </div>
        <div
          className="overflow-x-auto touch-pan-x"
          style={{ touchAction: "pan-x", maxHeight: "50vh" }}
        >
          <div className="flex items-center gap-3 md:gap-4 py-1">
            {(derived.sortedHands[String(playerId)] || []).map(
              (card, index) => {
                const disabled = isCardDisabled(card, derived.currentPlayer);
                return (
                  <button
                    key={`drawer-${card}-${index}`}
                    onClick={() => onDiscardACard(card)}
                    disabled={disabled}
                    className="focus:outline-none rounded-lg transition transform hover:-translate-y-1"
                  >
                    <Card
                      onRemove={onCardRemove}
                      onAdd={onCardAdd}
                      sizeSM={30}
                      sizeMD={36}
                      card={card}
                      opacity={disabled ? "opacity-40" : "opacity-100"}
                    />
                  </button>
                );
              }
            )}
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

  const renderPlayer = (player, isCurrentPlayer, isCompact) => (
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
            derived.currentMovePlayer.id === player.id
              ? "px-3 py-1 rounded text-black font-bold animation bg-yellow-300 shadow"
              : "opacity-60 px-3 py-1"
          }
        >
          {derived.currentMovePlayer.id === player.id ? <span>👉 </span> : null}
          {player.name}
        </span>
      </HeaderPlayer>
      <PlayerCards
        cards={derived.sortedHands[String(player.id)] || []}
        isCurrentPlayer={isCurrentPlayer}
        onDiscardACard={onDiscardACard}
        isCardDisabled={(card) => isCardDisabled(card, player)}
        onCardAdd={onCardAdd}
        onCardRemove={onCardRemove}
        winner={winner}
        showInline={forceInlineHand || isCurrentPlayer || !isCurrentPlayer}
        compact={isCompact && !isCurrentPlayer}
      />
    </>
  );

  const playerOptions = wildCard ? (
    <WildCardOptions
      onChooseColor={(color) => onDiscardACard(wildCard, color)}
    />
  ) : (
    <CurrentMovePlayerOptions
      currentMovePlayer={derived.currentMovePlayer}
      playerId={playerId}
      onPassTurn={onPassTurn}
      room={room}
      onYellOne={onYellOne}
    />
  );

  return (
    <div className="flex flex-1 relative">
      {actionError ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-red-500 text-white text-sm px-4 py-2 rounded shadow-lg">
            {actionError}
          </div>
        </div>
      ) : null}
      <BoardLayout
        players={playersActiveList}
        currentPlayerId={playerId}
        currentMovePlayer={derived.currentMovePlayer}
        drawPenalty={drawCount}
        onGoToHand={goToHand}
        handDrawer={handDrawer}
        handDrawerHeight={HAND_DRAWER_HEIGHT}
        renderPlayer={renderPlayer}
        drawPile={
          <DrawPile
            onDrawCard={onDrawCard}
            canDrawFromPile={!room?.drawPile}
            isCurrentPlayerTurn={derived.currentMovePlayer.id === playerId}
            drawPileRef={drawPileRef}
          />
        }
        discardPile={
          <DiscardPile
            discardPile={discardPile}
            discardColor={discardColor}
            pileRef={pileRef}
          />
        }
        playerOptions={playerOptions}
        yellOneMessage={yellOneMessage}
        winner={winner}
        onNewGame={onNewGame}
      />
    </div>
  );
}
