import Layout from "~/components/Layout.js";
import { useRouter } from "next/router";
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import StartGame from "~/components/StartGame";
import Button from "~/components/Button";
import Main from "~/components/Main";
import Heading from "~/components/Heading";
import Footer from "~/components/Footer";
import useTranslation from "next-translate/useTranslation";
import getBaseUrl from "~/utils/getBaseUrl";
import useRoomSubscription from "~/hooks/useRoomSubscription";
import { startRoomGame } from "~/utils/apiClient";

export default function Game() {
  const { t } = useTranslation();
  const [starting, setStarting] = useState(false);
  const router = useRouter();
  const roomId = router.query.roomId;
  const playerId = router.query.playerId;
  const { room, players: playersActive } = useRoomSubscription(
    roomId,
    playerId
  );

  const onNewGame = async (event) => {
    event.preventDefault();
    if (!roomId || !playerId) return;
    try {
      setStarting(true);
      await startRoomGame(roomId, playerId);
    } finally {
      setStarting(false);
    }
  };

  if (!room) {
    return (
      <Main color={"gray"}>
        <Layout />
        <Heading type="h1" color="white">
          {t("playerId:loading")}
        </Heading>
      </Main>
    );
  }
  if (room.playing) {
    return (
      <Main color={"gray"}>
        <Layout />
        <StartGame
          room={room}
          roomId={roomId}
          playersActive={playersActive}
          playerId={playerId}
          onNewGame={onNewGame}
        />
      </Main>
    );
  } else {
    const playersSlots = [];
    for (let i = 0; i < room.count; i++) {
      const player = playersActive[i];
      playersSlots.push(
        <li className="py-2 text-gray-700" key={i}>
          <div className="flex">
            <span className="flex-auto">
              {player ? player.name : t("playerId:waiting-player")}
              {player && player.id === playerId ? t("playerId:you") : null}
            </span>
            {player ? <span>✅</span> : null}
          </div>
        </li>
      );
    }

    const currentPlayer = playersActive.find((p) => p.id === playerId);
    const canStart = currentPlayer?.admin && playersActive.length === room.count;

    return (
      <Main color="gray">
        <Layout />
        <div className="flex-auto px-4 py-8 px-4 py-8 mx-auto w-full">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg ">
              <div className="bg-white p-4 rounded shadow">
                <div className="my-4">
                  <p className="text-gray-700 font-bold">
                    {t("playerId:link")}
                  </p>
                  <input
                    className="w-full text-gray-700 border-2 border-gray-300 h-12 mt-1 p-2 rounded g-gray-200 my-4"
                    readOnly
                    value={`${getBaseUrl()}/rooms/${roomId}`}
                  ></input>
                  <RoomLinkButton link={`${getBaseUrl()}/rooms/${roomId}`} />
                </div>
                <div className="my-4">
                  <p className="text-gray-700 font-bold">
                    {t("playerId:players")}
                  </p>
                  <ol className="divide-y divide-gray-400 list-decimal pl-5">
                    {playersSlots}
                  </ol>
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
