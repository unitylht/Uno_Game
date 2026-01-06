import Layout from "~/components/Layout.js";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import StartGame from "~/components/StartGame";
import Button from "~/components/Button";
import Main from "~/components/Main";
import Heading from "~/components/Heading";
import Footer from "~/components/Footer";
import useTranslation from "next-translate/useTranslation";
import getBaseUrl from "~/utils/getBaseUrl";
import useRoomSubscription from "~/hooks/useRoomSubscription";
import { removePlayerFromRoom, startRoomGame } from "~/utils/apiClient";

export default function Game() {
  const { t } = useTranslation();
  const [starting, setStarting] = useState(false);
  const router = useRouter();
  const roomId = router.query.roomId;
  const playerId = router.query.playerId;
  const translateOrDefault = (key, fallback) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  };
  const { room, players: playersActive } = useRoomSubscription(
    roomId,
    playerId
  );
  const [removingPlayerId, setRemovingPlayerId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  const onNewGame = async (event) => {
    event?.preventDefault?.();
    if (!roomId || !playerId) return;
    try {
      setStarting(true);
      await startRoomGame(roomId, playerId);
    } finally {
      setStarting(false);
    }
  };

  const onRemovePlayer = async (targetPlayerId) => {
    if (!roomId || !playerId || !targetPlayerId) return;
    setRemoveError(null);
    setRemovingPlayerId(targetPlayerId);
    try {
      await removePlayerFromRoom(roomId, playerId, targetPlayerId);
    } catch (err) {
      setRemoveError(err?.message || translateOrDefault("common:error", "Error"));
      throw err;
    } finally {
      setRemovingPlayerId(null);
    }
  };

  const currentPlayer = useMemo(
    () => playersActive.find((p) => p.id === playerId),
    [playersActive, playerId]
  );

  if (!room) {
    return (
      <Main color={"gradient"}>
        <Layout />
        <Heading type="h1" color="white">
          {t("playerId:loading")}
        </Heading>
      </Main>
    );
  }
  if (room.playing) {
    return (
      <Main color={"gradient"}>
        <Layout />
        <StartGame
          room={room}
          roomId={roomId}
          playersActive={playersActive}
          playerId={playerId}
          onNewGame={onNewGame}
          onRemovePlayer={onRemovePlayer}
          removingPlayerId={removingPlayerId}
          currentPlayer={currentPlayer}
        />
      </Main>
    );
  } else {
    const totalSlots = room.count || 10;
    const playersSlots = [];
    for (let i = 0; i < totalSlots; i++) {
      const player = playersActive[i];
      const canRemove = currentPlayer?.admin && player && player.id !== playerId;
      const removing = removingPlayerId === player?.id;
      playersSlots.push(
        <li className="py-2 text-gray-100" key={i}>
          <div className="flex items-center gap-2">
            <span className="flex-auto font-medium">
              {player ? player.name : t("playerId:waiting-player")}
              {player && player.id === playerId ? t("playerId:you") : null}
            </span>
            {canRemove ? (
              <button
                onClick={() => onRemovePlayer(player.id)}
                disabled={removing}
                className="text-xs bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded"
              >
                {removing ? t("common:loading") || "Removing..." : t("common:remove") || "Remove"}
              </button>
            ) : null}
            {player ? (
              <span className="text-emerald-300" aria-label="Ready">
                ✅
              </span>
            ) : (
              <span className="text-gray-500">• • •</span>
            )}
          </div>
        </li>
      );
    }

    const canStart =
      currentPlayer?.admin &&
      playersActive.length >= 2 &&
      playersActive.length <= totalSlots;

    return (
      <Main color="gradient">
        <Layout />
        <div className="flex-auto px-4 py-12 mx-auto w-full max-w-4xl">
          <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-8 text-white">
            <div className="my-4">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-300 mb-2">
                {t("playerId:link")}
              </p>
              <input
                className="w-full text-white bg-gray-900/60 border border-white/20 h-12 mt-1 p-3 rounded-xl my-4 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                readOnly
                value={`${getBaseUrl()}/rooms/${roomId}`}
              ></input>
              <RoomLinkButton link={`${getBaseUrl()}/rooms/${roomId}`} />
            </div>
            <div className="my-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-300 mb-2">
                {t("playerId:players")}
              </p>
              <ol className="divide-y divide-white/10 list-decimal pl-5">
                {playersSlots}
              </ol>
              {removeError ? (
                <p className="text-red-300 text-sm mt-3">{removeError}</p>
              ) : null}
            </div>
            {currentPlayer && currentPlayer.admin ? (
              <Button
                color={canStart ? "green" : "red"}
                onClick={onNewGame}
                className="w-full"
                disabled={!canStart || starting}
              >
                {starting ? t("playerId:loading") : t("playerId:start")}
              </Button>
            ) : null}
          </div>
        </div>
        <Footer />
      </Main>
    );
  }
}

const RoomLinkButton = ({ link }) => {
  const { t } = useTranslation();
  const [copiedLinkToClipboard, setCopiedLinkToClipboard] = useState(false);

  return (
    <CopyToClipboard
      text={link}
      onCopy={() => {
        setCopiedLinkToClipboard(true);
      }}
    >
      <Button
        onBlur={() => setCopiedLinkToClipboard(false)}
        color={copiedLinkToClipboard ? "gray" : "yellow"}
      >
        {copiedLinkToClipboard ? t("playerId:copied") : t("playerId:copy-link")}
      </Button>
    </CopyToClipboard>
  );
};
