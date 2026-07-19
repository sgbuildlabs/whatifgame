const LETTER_COLORS = [
  "text-coral",
  "text-sunny",
  "text-mint",
  "text-purple",
  "text-coral",
  "text-sunny",
  "text-mint",
];

export default function Logo() {
  const text = "What If";
  return (
    <h1 className="font-display text-6xl font-bold tracking-tight drop-shadow-sm sm:text-7xl">
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className={LETTER_COLORS[i % LETTER_COLORS.length]}>
            {char}
          </span>
        )
      )}
    </h1>
  );
}
