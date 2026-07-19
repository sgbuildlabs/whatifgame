export default function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <span className="animate-bob font-display text-6xl text-purple">?</span>
      <p className="font-display text-lg text-foreground/70">Thinking of something wonderful...</p>
    </div>
  );
}
