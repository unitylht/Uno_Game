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
  const translateOrDefault = (key, fallback) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  };
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
      <Main color="gradient">
        <Layout />
        <p className="text-white">{t("roomId:no-more-place")}</p>
      </Main>
    );
  } else if (roomPlaying) {
    return (
      <Main color="gradient">
        <Layout />
        <p className="text-white">{t("roomId:game-isplaying")}</p>
      </Main>
    );
  } else {
    return (
      <Main color="gradient" justify="center">
        <Layout />
        <div className="flex-auto px-4 py-12 mx-auto w-full max-w-4xl">
          <div className="backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">
                {t("roomId:join-game")}
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-indigo-200 animate-pulse" />
                {translateOrDefault("common:realtime", "Realtime ready")}
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed mb-8">
              {translateOrDefault(
                "roomId:join-copy",
                "Securely join your lobby with live updates and turn validation."
              )}
            </p>
            <form className="space-y-6" onSubmit={onCreateRoom}>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-100">
                  {t("common:nickname")}
                </label>
                <input
                  className="w-full bg-gray-900/60 border border-white/20 rounded-xl h-12 mt-1 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t("common:nickname-holder")}
                  type="text"
                  required
                ></input>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button
                  color={"green"}
                  type={"submit"}
                  className="w-full"
                  disabled={!formAllowedToSubmit}
                >
                  {formAllowedToSubmit
                    ? t("roomId:join")
                    : translateOrDefault("playerId:loading", "Joining…")}
                </Button>
                <p className="text-xs text-gray-300 whitespace-nowrap">
                  {translateOrDefault(
                    "roomId:instant",
                    "Live validation · Shareable link"
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </Main>
    );
  }
}
