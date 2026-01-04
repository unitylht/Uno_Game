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

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        alignContent: "start",
        width: "100%",
      }}
    >
      <div className="col-span-full flex flex-col items-center justify-center">
        {winner ? null : yellOneMessage}
      </div>
      {orderedPlayers.map((player) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        return (
          <div
            key={player.id}
            className={`flex flex-col items-center p-4 rounded-lg border ${
              isCurrentPlayer
                ? "border-yellow-400 shadow-lg bg-white bg-opacity-25"
                : "border-gray-600 bg-white bg-opacity-0"
            }`}
          >
            {renderPlayer(player, isCurrentPlayer)}
          </div>
        );
      })}
      <div
        className="col-span-full lg:px-20 py-4 flex flex-col justify-center items-center"
      >
        {winner ? (
          <div className="flex flex-no-wrap">
            <h1 className="z-10 bg-red-700 text-white m-2 font-medium text-center text-xl md:text-2x p-4 rounded">
              {t("playerId:winner-board.winner")} {winner.name}
            </h1>
            {discardPile}
          </div>
        ) : (
          <div className="flex flex-no-wrap">
            {drawPile}
            {discardPile}
          </div>
        )}

        <div className="m-4 md:m-4 w-full sm:w-1/2 flex justify-center flex-col">
          {winner ? (
            <button
              className="bg-green-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => onNewGame()}
            >
              {t("playerId:winner-board.replay")}
            </button>
          ) : (
            playerOptions
          )}
        </div>
      </div>
    </div>
  );
}
