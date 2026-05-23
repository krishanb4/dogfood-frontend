// LoadingScreen.tsx — Farm-themed loading screen

interface LoadingScreenProps { isVisible: boolean; }

export function LoadingScreen({ isVisible }: LoadingScreenProps): JSX.Element {
  return (
    <div className={`loading-screen ${!isVisible ? "hidden" : ""}`}>
      <div className="loading-dog">🐕</div>
      <h2>
        <span>$OISHII</span> Farm
      </h2>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
