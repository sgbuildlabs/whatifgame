"use client";

import { useState } from "react";
import VoiceInputButton from "./VoiceInputButton";

interface SearchBarProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSubmit, disabled }: SearchBarProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full border-2 border-white/70 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm sm:gap-3 sm:px-6 sm:py-3"
    >
      <span className="font-display shrink-0 text-lg font-semibold text-purple sm:text-xl">
        What if
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="...the moon disappeared?"
        disabled={disabled}
        maxLength={280}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-foreground/40 outline-none sm:text-lg"
        autoFocus
      />
      <VoiceInputButton onResult={(text) => setValue(text)} />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-full bg-coral px-4 py-2 font-display font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 sm:px-6"
      >
        Ask!
      </button>
    </form>
  );
}
