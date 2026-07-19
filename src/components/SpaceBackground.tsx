const STARS = [
  { top: "12%", left: "18%", size: 10, delay: "0s" },
  { top: "22%", left: "78%", size: 6, delay: "0.4s" },
  { top: "68%", left: "85%", size: 8, delay: "0.9s" },
  { top: "78%", left: "10%", size: 7, delay: "1.3s" },
  { top: "8%", left: "52%", size: 5, delay: "0.7s" },
  { top: "45%", left: "6%", size: 6, delay: "1.6s" },
];

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-indigo-100">
      {/* Giant question mark motif */}
      <div
        aria-hidden
        className="animate-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[42rem] font-bold leading-none text-purple opacity-15"
      >
        ?
      </div>

      {/* Sparkles */}
      {STARS.map((star, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-twinkle absolute rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.8)]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Bright, friendly Earth */}
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #7DE0A8 0%, #4ECDC4 35%, #3AA9D6 65%, #2E86C1 100%)",
          boxShadow: "0 0 120px 40px rgba(255, 209, 102, 0.35)",
        }}
      />
    </div>
  );
}
