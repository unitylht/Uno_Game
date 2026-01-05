import Layout from "~/components/Layout.js";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "~/components/Button";
import Main from "~/components/Main";
import Footer from "~/components/Footer";
import useTranslation from "next-translate/useTranslation";
import { createRoom } from "~/utils/apiClient";

export default function NewGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState("2");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const tf = (key, fallback) => {
    const text = t(key);
    return !text || text === key ? fallback : text;
  };
  const onSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    const playerCount = Number(value);
    setSubmitting(true);
    setFormError("");
    createRoom(playerCount, name)
      .then(({ roomId, playerId }) => {
        router.push(`/rooms/${roomId}/players/${playerId}`);
      })
      .catch(() => {
        setFormError(
          tf("common:action-error", "Could not create the room right now.")
        );
      })
      .finally(() => setSubmitting(false));
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
                  {t("common:new-game")}
                </p>
                <h1 className="text-3xl font-bold mt-1">{t("index:submit")}</h1>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                {tf("common:realtime", "Realtime ready")}
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed mb-8">
              {t("index:players-number")} · {t("common:nickname")}
            </p>
            {formError ? (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-sm text-red-100">
                {formError}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-100">
                  {t("index:players-number")}
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-900/60 border border-white/20 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  >
                    {[...Array(9)].map((_, index) => {
                      const optionValue = (index + 2).toString();
                      return (
                        <option
                          value={optionValue}
                          key={optionValue}
                          className="bg-gray-900 text-white"
                        >
                          {optionValue}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-100">
                  {t("common:nickname")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("common:nickname-holder")}
                  type="text"
                  className="w-full bg-gray-900/60 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type={"submit"} color={"red"} disabled={submitting}>
                  {submitting ? t("playerId:loading") : t("index:submit")}
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
                {tf("common:how-it-works", "How it works")}
              </h3>
              <ol className="list-decimal list-inside text-sm text-gray-200 space-y-1">
                <li>{tf("common:step-one", "Choose players and a nickname.")}</li>
                <li>
                  {tf(
                    "common:step-two",
                    "Share the generated lobby link with friends."
                  )}
                </li>
                <li>
                  {tf(
                    "common:step-three",
                    "Play with live turns, wild choices, and anti-cheat guards."
                  )}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Main>
  );
}
