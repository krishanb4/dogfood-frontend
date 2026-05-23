interface HowToPlayProps { onClose: () => void; }

const STEPS = [
  {
    icon: "🐕",
    title: "Choose Your Dog",
    body: "Pick a breed — Husky 🐺, Pug 🐶, or Shiba Inu 🦊. Each has its own walk, idle and eating animations.",
    tags: null as string[] | null,
  },
  {
    icon: "🛒",
    title: "Buy from the Shop",
    body: "Spend $OISHII tokens on food or vitamins. Each item gives your dog score points when fed.",
    tags: ["🦴 Bone · 10", "🥩 Meat · 50", "🍖 Kibble · 100", "💊 Vitamin · 200", "💉 Premium · 500", "⚡ Boost · 1000"],
  },
  {
    icon: "🎯",
    title: "Complete 3 Daily Goals",
    body: "Every UTC day your dog has three meals. Feed the matching food to tick a goal and earn tokens instantly:",
    tags: ["🌅 Breakfast · +25 💰", "☀️ Lunch · +75 💰", "🌙 Dinner · +150 💰"],
    bonus: "Finish all 3 → +100 💰 Perfect Day bonus!",
  },
  {
    icon: "📈",
    title: "Score & Level Up",
    body: "Every feed adds to your total score. As your score grows your dog levels up (max Lv 10). Score never resets.",
    tags: null as string[] | null,
  },
  {
    icon: "💊",
    title: "Vitamins are a Shortcut",
    body: "Premium ticks 1 unfinished goal. Power Boost ticks all 3 at once — expensive, but the fastest climb.",
    tags: null as string[] | null,
  },
  {
    icon: "🏆",
    title: "Climb the Leaderboard",
    body: "Open the Leaderboard to see the Top 20 dogs by total score. Top three get gold/silver/bronze.",
    tags: null as string[] | null,
  },
  {
    icon: "🎮",
    title: "Move Around",
    body: "Use WASD or arrow keys to walk. Click the shop building to open the Shop, click your house to feed.",
    tags: null as string[] | null,
  },
];

export function HowToPlay({ onClose }: HowToPlayProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-md animate-[fade-in_0.22s_ease-out]"
      style={{ background: "rgba(45,27,78,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] max-h-[85dvh] overflow-y-auto rounded-[28px] border-2 border-line bg-white p-7 font-[Fredoka,system-ui,sans-serif] text-ink animate-[pop-in_0.34s_cubic-bezier(0.34,1.56,0.64,1)] ui-scroll shadow-[0_24px_64px_-12px_rgba(124,92,252,0.40),0_4px_12px_rgba(45,27,78,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg-soft border-2 border-line text-ink-2 flex items-center justify-center text-base cursor-pointer hover:bg-pink/15 hover:text-pink hover:border-pink/40 hover:rotate-90 active:scale-95 transition-all duration-200"
          onClick={onClose}
        >✕</button>

        {/* Title */}
        <h2 className="text-[22px] font-extrabold text-center mb-5 bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#7C5CFC] bg-clip-text text-transparent">
          🐾 How to Play
        </h2>

        {/* Steps */}
        <div className="flex flex-col gap-2.5">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex gap-3 items-start p-3.5 rounded-2xl border-2 border-line bg-bg-panel transition-colors duration-200 hover:bg-bg-soft hover:border-line-strong"
            >
              {/* Number bubble */}
              <div
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-ink font-black text-[14px] border-2 border-white"
                style={{
                  background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
                  boxShadow: "0 3px 0 #D49600, 0 4px 10px rgba(255,184,0,0.35)",
                }}
              >
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-extrabold text-ink mb-1 flex items-center gap-1.5">
                  <span className="text-base">{step.icon}</span> {step.title}
                </h4>
                <p className="text-[12px] text-ink-2 leading-[1.55] m-0 font-medium">{step.body}</p>

                {step.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-bold text-[#B88800] py-1 px-2.5 rounded-full border border-[#FFE4A1] bg-[#FFF6DD]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {"bonus" in step && step.bonus && (
                  <p className="text-[12px] text-[#7C5CFC] leading-snug mt-2 m-0 font-extrabold">
                    ✨ {step.bonus}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="block w-full mt-5 py-3.5 rounded-2xl border-2 border-white text-ink font-extrabold text-[15px] font-[inherit] cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5"
          style={{
            background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
            boxShadow: "0 4px 0 #D49600, 0 6px 14px rgba(255,184,0,0.35)",
          }}
          onClick={onClose}
        >
          Got it! 🎮
        </button>
      </div>
    </div>
  );
}
