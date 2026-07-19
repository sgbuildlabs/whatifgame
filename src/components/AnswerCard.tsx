export default function AnswerCard({ answer }: { answer: string }) {
  const paragraphs = answer.split(/\n+/).filter(Boolean);

  return (
    <div className="w-full rounded-2xl border-l-8 border-mint bg-white/95 p-5 shadow-lg sm:p-6">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="text-base leading-relaxed text-foreground sm:text-lg [&:not(:last-child)]:mb-3">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
