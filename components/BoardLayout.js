import useTranslation from "next-translate/useTranslation";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

export default function BoardLayout({
  players,
  currentPlayerId,
  renderPlayer,
  drawPile,
  discardPile,
  playerOptions,
  yellOneMessage,
  winner,
  onNewGame,
  currentMovePlayer,
  drawPenalty,
  onGoToHand,
  handDrawer,
  handDrawerHeight = 240,
  compactThreshold = 4,
  controlsCollapsed = false,
  onToggleControls,
}) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentPlayer = players.find((player) => player.id == currentPlayerId);
  const indexCurrentPlayer = players.indexOf(currentPlayer);
  const orderedPlayers = useMemo(
    () =>
      currentPlayer && indexCurrentPlayer >= 0
        ? [
            ...players.slice(indexCurrentPlayer),
            ...players.slice(0, indexCurrentPlayer),
          ]
        : players,
    [currentPlayer, indexCurrentPlayer, players]
  );

  const compactMode = players.length > compactThreshold;
  const turnLabel = t("common:turn") || "Turn";
  const drawLabel = t("common:draw") || "Draw";
  const paddedContentHeight = controlsCollapsed
    ? "3.5rem"
    : `calc(${handDrawerHeight}px + env(safe-area-inset-bottom, 0px) + 2rem)`;
  const drawerWithSafeArea = `calc(${handDrawerHeight}px + env(safe-area-inset-bottom, 0px))`;
  const actionPanelOffset = handDrawer && !controlsCollapsed
    ? `calc(${handDrawerHeight}px + env(safe-area-inset-bottom, 0px) + 0.5rem)`
    : "1rem";
  const collapseLabel = controlsCollapsed
    ? t("common:unfold-controls") || "Show deck & hand"
    : t("common:fold-controls") || "Hide deck & hand";

  const handDrawerPortal = useMemo(() => {
    if (!isClient || !handDrawer) return null;
    return createPortal(
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          controlsCollapsed ? "translate-y-full pointer-events-none" : "translate-y-0"
        }`}
        style={{
          maxHeight: drawerWithSafeArea,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="w-full pointer-events-auto">{handDrawer}</div>
      </div>,
      document.body
    );
  }, [controlsCollapsed, drawerWithSafeArea, handDrawer, isClient]);

  return (
    <div
      className="relative flex-1 w-full min-h-screen"
      style={{ paddingBottom: paddedContentHeight }}
    >
      <div className="sticky top-0 z-20 w-full">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <span className="font-semibold">
              {turnLabel}: {currentMovePlayer?.name}
            </span>
            {typeof drawPenalty === "number" && drawPenalty > 0 ? (
              <span className="text-xs md:text-sm bg-red-700 px-2 py-1 rounded">
                {drawLabel} +{drawPenalty}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            {yellOneMessage ? (
              <div className="bg-red-700 text-white px-3 py-1 rounded shadow">
                {yellOneMessage}
              </div>
            ) : null}
            {onToggleControls ? (
              <button
                onClick={onToggleControls}
                className="text-xs md:text-sm bg-gray-200 hover:bg-white text-black font-semibold px-3 py-1 rounded shadow-inner"
              >
                {collapseLabel}
              </button>
            ) : null}
            <button
              onClick={onGoToHand}
              className="text-xs md:text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-3 py-1 rounded"
            >
              {t("common:go-to-hand") || "Go to my hand"}
            </button>
          </div>
        </div>
      </div>
      <div
        className="grid gap-4 px-2 md:px-4 pt-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          alignContent: "start",
          width: "100%",
        }}
      >
        {orderedPlayers.map((player, index) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          const isNeighbor = index <= 2;
          const isCompact = compactMode && !isNeighbor;
          const statusLabel =
            currentMovePlayer?.id === player.id
              ? t("common:current-turn") || "Current turn"
              : t("common:waiting") || "Waiting";
          return (
            <div
              key={player.id}
              title={`${player.name} • ${player.cards.length} ${
                t("common:cards") || "cards"
              } • ${statusLabel}`}
              className={`flex flex-col gap-2 ${isCompact ? "p-3" : "p-4"} rounded-lg border overflow-hidden bg-gray-900 bg-opacity-30 ${
                isCurrentPlayer
                  ? "border-yellow-400 shadow-lg"
                  : "border-gray-700"
              }`}
            >
              {renderPlayer(player, isCurrentPlayer, isCompact)}
            </div>
          );
        })}
      </div>
      <div
        className={`fixed inset-x-0 z-30 pointer-events-none transition-transform duration-300 ease-in-out ${
          controlsCollapsed ? "translate-y-[120%]" : "translate-y-0"
        }`}
        style={{
          bottom: actionPanelOffset,
          paddingInline: "0.75rem",
        }}
      >
        <div
          className={`w-full max-w-sm md:max-w-md mx-auto ${
            controlsCollapsed ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{ maxWidth: "min(360px, calc(100% - 1.5rem))" }}
        >
          <div className="bg-gray-900 bg-opacity-90 text-white border border-gray-700 rounded-xl shadow-2xl p-3 flex flex-col gap-3">
            {winner ? (
              <div className="flex flex-col gap-2 items-center">
                <h1 className="text-lg font-semibold text-center">
                  {t("playerId:winner-board.winner")} {winner.name}
                </h1>
                {discardPile}
                <button
                  className="bg-green-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded w-full"
                  onClick={() => onNewGame()}
                >
                  {t("playerId:winner-board.replay")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4">
                  {drawPile}
                  {discardPile}
                </div>
                <div className="w-full flex justify-center">{playerOptions}</div>
              </>
            )}
          </div>
        </div>
      </div>
      {handDrawerPortal}
    </div>
  );
}
