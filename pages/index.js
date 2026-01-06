import Layout from "~/components/Layout.js";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "~/components/Button";
import Main from "~/components/Main";
import Footer from "~/components/Footer";
import useTranslation from "next-translate/useTranslation";
import { createRoom, joinRoom } from "~/utils/apiClient";

export default function NewGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");
  const tf = (key, fallback) => {
    const text = t(key);
    return !text || text === key ? fallback : text;
  };

  const onCreate = (event) => {
    event.preventDefault();
    if (createSubmitting) return;
    setCreateSubmitting(true);
    setCreateError("");
    createRoom(createName)
      .then(({ roomId, playerId }) => router.push(`/rooms/${roomId}/players/${playerId}`))
      .catch(() =>
        setCreateError(tf("common:action-error", "Could not create the room right now."))
      )
      .finally(() => setCreateSubmitting(false));
  };

  const onJoin = (event) => {
    event.preventDefault();
    if (joinSubmitting) return;
    setJoinSubmitting(true);
    setJoinError("");
    joinRoom(joinRoomCode.trim(), joinName)
      .then(({ playerId }) => router.push(`/rooms/${joinRoomCode.trim()}/players/${playerId}`))
      .catch(() =>
        setJoinError(tf("common:action-error", "Could not join the room right now."))
      )
      .finally(() => setJoinSubmitting(false));
  };

  return (
    <Main color="gradient" justify="center">
      <Layout />
      <div className="flex-auto px-4 py-12 mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-300">
                  {tf("common:new-game", "New game")}
                </p>
                <h1 className="text-3xl font-bold mt-1">
                  {tf("index:create-room", "Create new room")}
                </h1>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                {tf("common:realtime", "Realtime ready")}
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed mb-8">
              {tf(
                "index:create-copy",
                "Instantly open a lobby and share the 6-digit code or link."
              )}
            </p>
            {createError ? (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-sm text-red-100">
                {createError}
              </div>
            ) : null}
            <form onSubmit={onCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-100">
                  {t("common:nickname")}
                </label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t("common:nickname-holder")}
                  type="text"
                  className="w-full bg-gray-900/60 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type={"submit"} color={"red"} disabled={createSubmitting}>
                  {createSubmitting
                    ? t("playerId:loading")
                    : tf("index:create-room", "Create new room")}
                </Button>
                <p className="text-xs text-gray-300">
                  {tf("common:instant-room", "Instant lobby creation")} ·{" "}
                  {tf("common:no-accounts", "No accounts required")}
                </p>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                {tf("common:join-room", "Join room")}
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed mb-4">
                {tf(
                  "index:join-copy",
                  "Enter a room code or use a shared link to join a lobby."
                )}
              </p>
              {joinError ? (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-sm text-red-100">
                  {joinError}
                </div>
              ) : null}
              <form className="space-y-4" onSubmit={onJoin}>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-100">
                    {tf("common:room-code", "Room code")}
                  </label>
                  <input
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value)}
                    placeholder={tf("index:room-code-holder", "e.g. 123456")}
                    type="text"
                    pattern="\\d{6}"
                    className="w-full bg-gray-900/60 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-100">
                    {t("common:nickname")}
                  </label>
                  <input
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder={t("common:nickname-holder")}
                    type="text"
                    className="w-full bg-gray-900/60 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                    required
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button
                    color={"green"}
                    type={"submit"}
                    className="w-full"
                    disabled={joinSubmitting}
                  >
                    {joinSubmitting ? t("playerId:loading") : tf("index:join-room", "Join room")}
                  </Button>
                  <p className="text-xs text-gray-300 whitespace-nowrap">
                    {tf("roomId:instant", "Live validation · Shareable link")}
                  </p>
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
