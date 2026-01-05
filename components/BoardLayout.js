import useTranslation from "next-translate/useTranslation";

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
  compactThreshold = 4,
}) {
  const { t } = useTranslation();
  const currentPlayer = players.find((player) => player.id == currentPlayerId);
  const indexCurrentPlayer = players.indexOf(currentPlayer);
  const orderedPlayers =
    currentPlayer && indexCurrentPlayer >= 0
      ? [
          ...players.slice(indexCurrentPlayer),
          ...players.slice(0, indexCurrentPlayer),
        ]
      : players;

  const compactMode = players.length > compactThreshold;
  const turnLabel = t("common:turn") || "Turn";
  const drawLabel = t("common:draw") || "Draw";

  return (
    <div className="relative flex-1 w-full min-h-screen pb-64">
      <style jsx>{`
        .control-panel {
          position: fixed;
          right: 0.75rem;
          top: 6rem;
          z-index: 30;
          width: 100%;
          max-width: min(360px, calc(100% - 1.5rem));
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        @media (max-width: 420px) {
          .control-panel {
            right: 0;
            left: 0;
            top: auto;
            bottom: 6.5rem;
            max-width: none;
            display: flex;
            justify-content: center;
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .control-panel-inner {
            width: 100%;
            max-width: 540px;
          }
        }
      `}</style>
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
        className="control-panel"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="control-panel-inner bg-gray-900 bg-opacity-90 text-white border border-gray-700 rounded-xl shadow-2xl p-3 flex flex-col gap-3">
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
      <div className="fixed bottom-0 left-0 right-0 z-40">{handDrawer}</div>
    </div>
  );
}
