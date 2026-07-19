"use client";

import { useState } from "react";
import SpaceBackground from "@/components/SpaceBackground";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import LoadingState from "@/components/LoadingState";
import AnswerCard from "@/components/AnswerCard";
import ImageDisplay from "@/components/ImageDisplay";
import SafetyWarning from "@/components/SafetyWarning";
import type { AskImage, AskResponse } from "@/lib/types";

type ViewState =
  | { kind: "idle" }
  | { kind: "loading"; question: string }
  | { kind: "answer"; question: string; answer: string; image: AskImage }
  | { kind: "unsafe"; message: string }
  | { kind: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  const ask = async (question: string) => {
    setState({ kind: "loading", question });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data: AskResponse = await res.json();

      if (data.status === "ok") {
        setState({ kind: "answer", question: data.question, answer: data.answer, image: data.image });
      } else if (data.status === "unsafe") {
        setState({ kind: "unsafe", message: data.message });
      } else {
        setState({ kind: "error", message: data.message });
      }
    } catch {
      setState({ kind: "error", message: "Something went wrong. Try again!" });
    }
  };

  const reset = () => setState({ kind: "idle" });

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16">
      <SpaceBackground />

      <Logo />

      {state.kind !== "answer" && state.kind !== "unsafe" && state.kind !== "error" && (
        <SearchBar onSubmit={ask} disabled={state.kind === "loading"} />
      )}

      {state.kind === "loading" && <LoadingState />}

      {(state.kind === "unsafe" || state.kind === "error") && (
        <SafetyWarning message={state.message} onTryAgain={reset} />
      )}

      {state.kind === "answer" && (
        <div className="flex w-full max-w-xl flex-col items-center gap-5">
          <p className="font-display text-center text-xl font-semibold text-foreground/80">
            🌟 What if {state.question}
          </p>
          <ImageDisplay image={state.image} />
          <AnswerCard answer={state.answer} />
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-purple px-6 py-2 font-display font-semibold text-white shadow transition-transform hover:scale-105"
          >
            Ask another question!
          </button>
        </div>
      )}
    </main>
  );
}
