import Layout from "~/components/Layout.js";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "~/components/Button";
import Main from "~/components/Main";
import Footer from "~/components/Footer";
import useTranslation from "next-translate/useTranslation";
import { fetchRoom, joinRoom } from "~/utils/apiClient";

export default function Room() {
  const { t } = useTranslation();
  const router = useRouter();
  const roomId = router.query.roomId;
  const [roomIsFull, setRoomIsFull] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomPlaying, setRoomPlaying] = useState(false);
  const [formAllowedToSubmit, setFormAllowedToSubmit] = useState(true);
  const onCreateRoom = (event) => {
    event.preventDefault();
    if (formAllowedToSubmit) {
      setFormAllowedToSubmit(false);
      if (!roomId) return;
      fetchRoom(roomId).then(
        ({ room }) => {
          if (room.playing) {
            setRoomPlaying(true);
            return;
          }
          if (room.players.length >= room.count) {
            setRoomIsFull(true);
            return;
          }
          joinRoom(roomId, playerName).then((response) => {
            router.push(`/rooms/${roomId}/players/${response.playerId}`);
            setFormAllowedToSubmit(true);
          });
        },
        () => {
          setRoomIsFull(true);
          setFormAllowedToSubmit(true);
        }
      );
    }
  };

  if (roomIsFull) {
    return (
      <Main>
        <Layout />
        <p className="text-white">{t("roomId:no-more-place")}</p>
      </Main>
    );
  } else if (roomPlaying) {
    return (
      <Main>
        <Layout />
        <p className="text-white">{t("roomId:game-isplaying")}</p>
      </Main>
    );
  } else {
    return (
      <Main color="gray" justify="center">
        <Layout />
        <div className="flex-auto px-4 py-8 px-4 py-8 mx-auto w-full">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg ">
              <div className="bg-white p-4 rounded shadow">
                <div className="items-center justify-between ">
                  <h1 className="text-gray-700 text-lg font-bold text-center">
                    {t("roomId:join-game")}
                  </h1>
                </div>
                <form
                  className="bg-white rounded px-8 pt-6 pb-8 mb-4"
                  onSubmit={onCreateRoom}
                >
                  <div className="mb-6">
                    <label className="block text-gray-700 text-base font-bold mb-2">
                      <p className="mb-4">{t("common:nickname")}</p>
                      <input
                        className="w-full appearance-none border-2 border-gray-300 rounded text-gray-700 h-12 mt-1 mb-3 px-3 p-2 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder={t("common:nickname-holder")}
                        type="text"
                        required
                      ></input>
                    </label>
                  </div>
                  <div className="flex items-center justify-between ">
                    <Button
                      color={"green"}
                      type={"submit"}
                      className="w-full"
                      disabled={false}
                    >
                      {t("roomId:join")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </Main>
    );
  }
}
