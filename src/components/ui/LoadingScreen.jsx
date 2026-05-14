// LoadingScreen.jsx — Farm-themed loading screen
export function LoadingScreen({ isVisible }) {
  return (
    <div className={`loading-screen ${!isVisible ? "hidden" : ""}`}>
      <div className="loading-dog">🐕</div>
      <h2>
        <span>$DOG</span>FOOD Farm
      </h2>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
