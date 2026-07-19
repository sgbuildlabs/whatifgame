interface SafetyWarningProps {
  message: string;
  onTryAgain: () => void;
}

export default function SafetyWarning({ message, onTryAgain }: SafetyWarningProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border-4 border-sunny bg-white/95 p-6 text-center shadow-lg">
      <span className="text-5xl">🌈</span>
      <p className="font-display text-lg font-semibold text-foreground">{message}</p>
      <button
        type="button"
        onClick={onTryAgain}
        className="rounded-full bg-sunny px-6 py-2 font-display font-semibold text-foreground shadow transition-transform hover:scale-105"
      >
        Try again
      </button>
    </div>
  );
}
