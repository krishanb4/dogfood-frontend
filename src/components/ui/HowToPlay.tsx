// HowToPlay.tsx — How to Play popup, rewritten for the goal-based game.

interface HowToPlayProps { onClose: () => void; }

export function HowToPlay({ onClose }: HowToPlayProps): JSX.Element {
  return (
    <div className="htp-overlay" onClick={onClose}>
      <div className="htp-card" onClick={(e) => e.stopPropagation()}>
        <button className="htp-close" onClick={onClose}>✕</button>
        <h2>🐾 How to Play</h2>

        <div className="htp-steps">
          <div className="htp-step">
            <span className="htp-num">1</span>
            <div>
              <h4>🐕 Choose Your Dog</h4>
              <p>Pick a breed — <strong>Husky 🐺</strong>, <strong>Pug 🐶</strong>, or <strong>Shiba Inu 🦊</strong>. Each has their own walk, idle and eating animations.</p>
            </div>
          </div>

          <div className="htp-step">
            <span className="htp-num">2</span>
            <div>
              <h4>🛒 Buy from the Shop</h4>
              <p>Spend $DOGFOOD tokens on food or vitamins. Each item gives your dog score points when fed.</p>
              <div className="htp-foods">
                <span>🦴 Bone · 10</span>
                <span>🥩 Meat · 50</span>
                <span>🍖 Kibble · 100</span>
                <span>💊 Vitamin · 200</span>
                <span>💉 Premium · 500</span>
                <span>⚡ Boost · 1000</span>
              </div>
            </div>
          </div>

          <div className="htp-step">
            <span className="htp-num">3</span>
            <div>
              <h4>🎯 Complete 3 Daily Goals</h4>
              <p>Every UTC day your dog has three meals to finish. Feed the matching food to tick a goal and earn tokens instantly:</p>
              <div className="htp-foods">
                <span>🌅 Breakfast (Bone) → +25 💰</span>
                <span>☀️ Lunch (Meat) → +75 💰</span>
                <span>🌙 Dinner (Kibble) → +150 💰</span>
              </div>
              <p style={{ marginTop: 6 }}>Finish all 3 in one day → <strong>+100 💰 Perfect Day bonus</strong>!</p>
            </div>
          </div>

          <div className="htp-step">
            <span className="htp-num">4</span>
            <div>
              <h4>📈 Score & Level Up</h4>
              <p>Every feed adds to your <strong>total score</strong>. As your score grows your dog levels up and visibly gets bigger (up to Lv 10). Score never resets.</p>
            </div>
          </div>

          <div className="htp-step">
            <span className="htp-num">5</span>
            <div>
              <h4>💊 Vitamins are a Shortcut</h4>
              <p>Premium ticks 1 unfinished goal. Power Boost ticks <strong>all 3</strong> goals at once. Expensive, but the fastest way to grow + climb the leaderboard.</p>
            </div>
          </div>

          <div className="htp-step">
            <span className="htp-num">6</span>
            <div>
              <h4>🏆 Climb the Leaderboard</h4>
              <p>Open the <strong>Leaderboard</strong> panel to see the Top 20 dogs by total score. The top three get gold/silver/bronze medals. Your row is highlighted.</p>
            </div>
          </div>

          <div className="htp-step">
            <span className="htp-num">7</span>
            <div>
              <h4>🎮 Move Around</h4>
              <p>Use <strong>WASD</strong> or arrow keys to walk around the farm. Click <strong>Free View</strong> to switch to a free camera. Click the shop building to open the Shop, click the <strong>Inventory</strong> sign on your house to feed.</p>
            </div>
          </div>
        </div>

        <button className="htp-got-it" onClick={onClose}>Got it! 🎮</button>
      </div>
    </div>
  );
}
