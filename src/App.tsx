import { Suspense, useCallback, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { io, Socket } from "socket.io-client";
import { useAccount } from "wagmi";
import { MdOutlineLeaderboard } from "react-icons/md";
import { CiVideoOn } from "react-icons/ci";
import { FaTasks, FaCog } from "react-icons/fa";
import { FarmMap } from "./components/FarmMap";
import { DogHouse } from "./components/DogHouse";
import { FarmSky } from "./components/FarmSky";
import { Trees } from "./components/Trees";
import { Player, ThirdPersonCamera } from "./components/Player";
import { ShopPanel } from "./components/ui/ShopPanel";
import { InventoryPanel } from "./components/ui/InventoryPanel";
import { Leaderboard } from "./components/ui/Leaderboard";
import { DailyGoals } from "./components/ui/DailyGoals";
import { GoalCompletePopup } from "./components/ui/GoalCompletePopup";
import { CountdownTimer } from "./components/ui/CountdownTimer";
import { PoolDisplay as ScoreDisplay } from "./components/ui/PoolDisplay";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { HowToPlay } from "./components/ui/HowToPlay";
import { Joystick } from "./components/ui/Joystick";
import { OnboardingPage } from "./components/ui/OnboardingPage";
import { DepositPanel } from "./components/ui/DepositPanel";
import { useGameStore } from "./store/gameStore";
import type {
  SlotPosition,
  PlayerState,
  Obstacle,
  JoystickState,
} from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5010";

// ── Dog House positions ───────────────────────────────────────────────────
function generatePositions(): SlotPosition[] {
  const slots: SlotPosition[] = [];
  const ROAD_SPACING = 15;
  const zRows = [-97, -57, -45, -33, -21, 21, 33, 45, 57, 97];
  const xCols = 6;
  for (const z of zRows) {
    for (let i = -xCols; i < xCols; i++) {
      const x = i * ROAD_SPACING + 7.5;
      const rotY = i % 2 === 0 ? -Math.PI / 2 : Math.PI / 2;
      slots.push({ x, z, rotY });
    }
  }
  slots.sort((a, b) => {
    const blockX_A = Math.floor((a.x + 15) / 30);
    const blockX_B = Math.floor((b.x + 15) / 30);
    const blockZ_A = Math.floor(a.z / 78);
    const blockZ_B = Math.floor(b.z / 78);
    const dA = Math.abs(blockX_A) + Math.abs(blockZ_A + 0.5);
    const dB = Math.abs(blockX_B) + Math.abs(blockZ_B + 0.5);
    if (Math.abs(dA - dB) > 0.1) return dA - dB;
    if (Math.abs(a.z) !== Math.abs(b.z)) return Math.abs(a.z) - Math.abs(b.z);
    if (a.z !== b.z) return a.z - b.z;
    return a.x - b.x;
  });
  return slots;
}
const POSITIONS: SlotPosition[] = generatePositions();

const SHOP_POSITIONS = [
  { x: 0, z: 0 },
  { x: 60, z: 0 },
  { x: -60, z: 0 },
  { x: 0, z: 78 },
  { x: 0, z: -78 },
  { x: -60, z: 78 },
  { x: 60, z: 78 },
  { x: -60, z: -78 },
  { x: 60, z: -78 },
];
const SHOP_HALF_X = 3.0;
const SHOP_HALF_Z = 2.5;

const HOUSE_LOCAL_RECTS = [
  { cx: 0, cz: -4.75, hx: 4.75, hz: 0.15 },
  { cx: -4.75, cz: 0, hx: 0.15, hz: 4.75 },
  { cx: 4.75, cz: 0, hx: 0.15, hz: 4.75 },
  { cx: -3.0875, cz: 4.75, hx: 1.6625, hz: 0.15 },
  { cx: 3.0875, cz: 4.75, hx: 1.6625, hz: 0.15 },
  { cx: 0, cz: -1.5, hx: 1.5, hz: 1.4 },
];

interface LocalRect {
  cx: number;
  cz: number;
  hx: number;
  hz: number;
}

function rotateRect(
  r: LocalRect,
  rotY: number,
  tx: number,
  tz: number,
): Obstacle {
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  return {
    x: c * r.cx + s * r.cz + tx,
    z: -s * r.cx + c * r.cz + tz,
    halfX: Math.abs(c) * r.hx + Math.abs(s) * r.hz,
    halfZ: Math.abs(s) * r.hx + Math.abs(c) * r.hz,
  };
}

function houseToPlayer(h: any, selfWallet: string): PlayerState {
  return {
    id: h.wallet,
    wallet: h.wallet,
    username: h.username || "Anon",
    dog: h.dogType || h.dog || "husky",
    slotIndex: typeof h.slotIndex === "number" ? h.slotIndex : 0,
    level: h.dogLevel || 1,
    isSelf: h.wallet === selfWallet,
  };
}

interface PlayerStateRef {
  position: THREE.Vector3;
  yaw: number;
}

export default function App() {
  const { isConnected } = useAccount();

  // ── Zustand ───────────────────────────────────────────────────────────
  const user = useGameStore((s) => s.user);
  const clearUser = useGameStore((s) => s.clearUser);
  const selfState = useGameStore((s) => s.selfState);
  const setSelfState = useGameStore((s) => s.setSelfState);
  const mergeSelfState = useGameStore((s) => s.mergeSelfState);
  const players = useGameStore((s) => s.players);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const upsertPlayer = useGameStore((s) => s.upsertPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerLevel = useGameStore((s) => s.updatePlayerLevel);
  const leaderboard    = useGameStore((s) => s.leaderboard);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);
  const inventory = useGameStore((s) => s.inventory);
  const addInventoryItem = useGameStore((s) => s.addInventoryItem);
  const consumeInventoryItem = useGameStore((s) => s.consumeInventoryItem);
  const feedingDog = useGameStore((s) => s.feedingDog);
  const setFeedingDog = useGameStore((s) => s.setFeedingDog);
  const goalEvent = useGameStore((s) => s.goalEvent);
  const setGoalEvent = useGameStore((s) => s.setGoalEvent);
  const mapLoaded = useGameStore((s) => s.mapLoaded);
  const setMapLoaded = useGameStore((s) => s.setMapLoaded);
  const showLoading = useGameStore((s) => s.showLoading);
  const setShowLoading = useGameStore((s) => s.setShowLoading);
  const showHowToPlay = useGameStore((s) => s.showHowToPlay);
  const setShowHowToPlay = useGameStore((s) => s.setShowHowToPlay);
  const showShopPanel = useGameStore((s) => s.showShopPanel);
  const setShowShopPanel = useGameStore((s) => s.setShowShopPanel);
  const showInventory = useGameStore((s) => s.showInventory);
  const setShowInventory = useGameStore((s) => s.setShowInventory);
  const showLeaderboard = useGameStore((s) => s.showLeaderboard);
  const setShowLeaderboard = useGameStore((s) => s.setShowLeaderboard);
  const showGoals = useGameStore((s) => s.showGoals);
  const setShowGoals = useGameStore((s) => s.setShowGoals);
  const isFreeView = useGameStore((s) => s.isFreeView);
  const setIsFreeView = useGameStore((s) => s.setIsFreeView);
  const showMobileMenu = useGameStore((s) => s.showMobileMenu);
  const setShowMobileMenu = useGameStore((s) => s.setShowMobileMenu);
  const showDeposit = useGameStore((s) => s.showDeposit);
  const setShowDeposit = useGameStore((s) => s.setShowDeposit);

  const socketRef = useRef<Socket | null>(null);
  const playerStateRef = useRef<PlayerStateRef | null>(null);
  if (!playerStateRef.current)
    playerStateRef.current = { position: new THREE.Vector3(), yaw: 0 };
  const joystickRef = useRef<JoystickState>({ active: false, x: 0, y: 0 });

  // ── Derived ───────────────────────────────────────────────────────────
  const balance = selfState?.balance ?? 0;
  const score = selfState?.totalScore ?? 0;
  const dogLevel = selfState?.dogLevel ?? 1;
  const dailyGoals = selfState?.dailyGoals ?? {
    breakfast: false,
    lunch: false,
    dinner: false,
  };

  // Clear user state when wallet disconnects
  useEffect(() => {
    if (!isConnected && user) clearUser();
  }, [isConnected]);

  // ── Popup body class ──────────────────────────────────────────────────
  useEffect(() => {
    const open =
      showShopPanel ||
      showInventory ||
      showHowToPlay ||
      showLeaderboard ||
      showDeposit ||
      !!goalEvent;
    document.body.classList.toggle("dfg-popup-open", open);
    return () => document.body.classList.remove("dfg-popup-open");
  }, [showShopPanel, showInventory, showHowToPlay, showLeaderboard, showDeposit, goalEvent]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!showMobileMenu) return;
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".mobile-settings"))
        setShowMobileMenu(false);
    };
    const id = requestAnimationFrame(() =>
      document.addEventListener("click", onDocClick),
    );
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", onDocClick);
    };
  }, [showMobileMenu]);

  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
    setTimeout(() => setShowLoading(false), 1500);
  }, []);

  // ── Shop / Inventory ──────────────────────────────────────────────────
  const handleBuy = useCallback(
    (item: { id: string; cost: number }) => {
      if (!socketRef.current || balance < item.cost) return;
      mergeSelfState({ balance: balance - item.cost });
      addInventoryItem(item.id as import("./types").ItemId);
      socketRef.current.emit("buy", { item: item.id });
    },
    [balance],
  );

  const handleFeedFromInventory = useCallback(
    (item: { id: string }) => {
      if (
        !socketRef.current ||
        (inventory[item.id as import("./types").ItemId] || 0) <= 0
      )
        return;
      consumeInventoryItem(item.id as import("./types").ItemId);
      const self = players.find((p) => p.isSelf);
      if (self) {
        setFeedingDog(self.id);
        setTimeout(() => setFeedingDog(null), 2000);
      }
      socketRef.current.emit("feed", { item: item.id });
    },
    [inventory, players],
  );

  // ── Socket lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.wallet || !user.hasProfile) return;
    const { wallet, name, breed } = user;

    const socket = io(BACKEND_URL, {
      query: { wallet },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("player_join", { username: name, dog: breed });
    });

    socket.on("self_state", setSelfState);

    socket.on("dog_houses_list", (houses: any[]) => {
      setPlayers(houses.map((h) => houseToPlayer(h, wallet)));
    });

    socket.on("new_dog_house", (h: any) =>
      upsertPlayer(houseToPlayer(h, wallet)),
    );

    socket.on("player_leave", ({ wallet: w }: { wallet: string }) =>
      removePlayer(w),
    );

    socket.on("buy_result", ({ user: u }: { user: any }) => mergeSelfState(u));
    socket.on("buy_error", (e: unknown) => console.warn("buy_error:", e));

    socket.on("feed_result", (result: any) => {
      mergeSelfState(result.user);
      updatePlayerLevel(wallet, result.user.dogLevel);
      if (result.completedGoals?.length || result.perfectDay) {
        setGoalEvent({
          completedGoals: result.completedGoals,
          awardedTokens: result.awardedTokens,
          perfectDay: result.perfectDay,
        });
      }
    });

    socket.on(
      "feed_event",
      ({ wallet: w, newLevel }: { wallet: string; newLevel: number }) => {
        updatePlayerLevel(w, newLevel);
        if (w !== wallet) {
          setFeedingDog(w);
          setTimeout(
            () => setFeedingDog((cur) => (cur === w ? null : cur)),
            2000,
          );
        }
      },
    );

    socket.on("leaderboard_update", setLeaderboard);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.wallet, user?.hasProfile]);

  // ── Collision obstacles ───────────────────────────────────────────────
  const obstacles = useMemo((): Obstacle[] => {
    const list: Obstacle[] = SHOP_POSITIONS.map((s) => ({
      x: s.x,
      z: s.z,
      halfX: SHOP_HALF_X,
      halfZ: SHOP_HALF_Z,
    }));
    for (const p of players) {
      const slot = POSITIONS[p.slotIndex] || POSITIONS[0];
      for (const r of HOUSE_LOCAL_RECTS)
        list.push(rotateRect(r, slot.rotY, slot.x, slot.z));
    }
    return list;
  }, [players]);

  const selfPlayer = players.find((p) => p.isSelf);
  const playerSpawn = useMemo((): [number, number, number] | null => {
    if (!selfPlayer) return null;
    const slot = POSITIONS[selfPlayer.slotIndex] || POSITIONS[0];
    const localOffset = new THREE.Vector3(0, 0, 7);
    localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), slot.rotY);
    return [slot.x + localOffset.x, 0, slot.z + localOffset.z];
  }, [selfPlayer?.slotIndex]);

  return (
    <div id="canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 35, 50], fov: 55, near: 0.5, far: 500 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor("#87CEEB")}
      >
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[60, 80, 40]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
        />
        <FarmSky />
        <Environment preset="park" />

        <Suspense fallback={null}>
          <FarmMap
            onLoaded={handleMapLoaded}
            onShopClick={() => setShowShopPanel(true)}
            playerCount={players.length}
          />
        </Suspense>

        {mapLoaded && (
          <Suspense fallback={null}>
            <Trees houseSlots={POSITIONS} />
          </Suspense>
        )}

        {mapLoaded &&
          players.map((player) => {
            const slot = POSITIONS[player.slotIndex] || POSITIONS[0];
            return (
              <Suspense key={player.id} fallback={null}>
                <DogHouse
                  position={[slot.x, 0, slot.z]}
                  rotation={[0, slot.rotY, 0]}
                  player={player}
                  isEating={feedingDog === player.id}
                  onInventoryClick={
                    player.isSelf ? () => setShowInventory(true) : undefined
                  }
                />
              </Suspense>
            );
          })}

        {mapLoaded && playerSpawn && (
          <Suspense fallback={null}>
            <Player
              initialPosition={playerSpawn}
              stateRef={
                playerStateRef as React.MutableRefObject<PlayerStateRef>
              }
              obstacles={obstacles}
              joystickRef={joystickRef}
            />
          </Suspense>
        )}

        {isFreeView || !playerSpawn ? (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={15}
            maxDistance={isFreeView ? 400 : 80}
            maxPolarAngle={Math.PI / 2 - 0.1}
            target={[0, 0, 0]}
          />
        ) : (
          <ThirdPersonCamera
            stateRef={playerStateRef as React.MutableRefObject<PlayerStateRef>}
          />
        )}
      </Canvas>

      {/* ── Logo + controls ───────────────────────────────────────────── */}
      <div className="game-logo">
        <span className="logo-icon">🐕</span>
        <span className="logo-text">
          <span>$OISHII</span>
        </span>
        <button
          className="help-btn dfg-desktop-only"
          onClick={() => setShowHowToPlay(true)}
        >
          ❓
        </button>
        <button
          className="help-btn dfg-desktop-only"
          onClick={() => setIsFreeView(!isFreeView)}
          title={isFreeView ? "Normal View" : "Free View"}
        >
          <CiVideoOn />
        </button>
        <button
          className="help-btn dfg-desktop-only"
          onClick={() => setShowLeaderboard((v) => !v)}
          title="Leaderboard"
        >
          <MdOutlineLeaderboard />
        </button>
        <span
          className="dfg-progress-btn dfg-desktop-only"
          style={
            {
              "--pct":
                (Object.values(dailyGoals).filter(Boolean).length / 3) * 100,
            } as React.CSSProperties
          }
        >
          <button
            className="help-btn"
            onClick={() => setShowGoals((v) => !v)}
            title={`Daily Goals (${Object.values(dailyGoals).filter(Boolean).length}/3)`}
          >
            <FaTasks />
          </button>
        </span>
      </div>

      {/* ── Mobile settings ────────────────────────────────────────────── */}
      <div className="mobile-settings">
        <button
          className={`help-btn settings-toggle ${showMobileMenu ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowMobileMenu((v) => !v);
          }}
          aria-label="Settings"
        >
          <FaCog />
        </button>
        <div
          className={`mobile-settings-panel ${showMobileMenu ? "open" : ""}`}
        >
          <button
            className="mobile-menu-item"
            onClick={() => {
              setShowHowToPlay(true);
              setShowMobileMenu(false);
            }}
          >
            <span className="mm-icon">❓</span>
            <span>How to Play</span>
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => {
              setIsFreeView((v) => !v);
              setShowMobileMenu(false);
            }}
          >
            <CiVideoOn className="mm-icon" />
            <span>{isFreeView ? "Normal View" : "Free View"}</span>
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => {
              setShowLeaderboard((v) => !v);
              setShowMobileMenu(false);
            }}
          >
            <MdOutlineLeaderboard className="mm-icon" />
            <span>Leaderboard</span>
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => {
              setShowGoals((v) => !v);
              setShowMobileMenu(false);
            }}
          >
            <FaTasks className="mm-icon" />
            <span>
              Daily Goals ({Object.values(dailyGoals).filter(Boolean).length}/3)
            </span>
          </button>
        </div>
      </div>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="top-bar">
        <ScoreDisplay score={score} level={dogLevel} />
        <CountdownTimer />
        <div className="top-card">
          <div className="label">Online</div>
          <div className="value online">{players.length}</div>
        </div>
      </div>

      <button
        type="button"
        className="balance-badge"
        onClick={() => setShowDeposit(true)}
        title="Deposit $OISHII"
      >
        <span>💰</span>
        <span>{balance.toLocaleString()} $OISHII</span>
      </button>

      {user && showGoals && (
        <DailyGoals goals={dailyGoals} onClose={() => setShowGoals(false)} />
      )}

      {showShopPanel && (
        <ShopPanel
          balance={balance}
          dailyGoals={dailyGoals}
          onBuy={handleBuy}
          onClose={() => setShowShopPanel(false)}
        />
      )}
      {showInventory && (
        <InventoryPanel
          inventory={inventory}
          dailyGoals={dailyGoals}
          onFeed={handleFeedFromInventory}
          onClose={() => setShowInventory(false)}
          disabled={!!feedingDog}
        />
      )}
      {showLeaderboard && (
        <Leaderboard
          rows={leaderboard}
          selfWallet={user?.wallet}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      {goalEvent && (
        <GoalCompletePopup
          event={goalEvent}
          onDone={() => setGoalEvent(null)}
        />
      )}
      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
      {showDeposit && (
        <DepositPanel
          wallet={user?.wallet}
          balance={balance}
          onClose={() => setShowDeposit(false)}
        />
      )}
      <LoadingScreen isVisible={showLoading} />

      {(!user || !user.hasProfile) && <OnboardingPage />}

      <Joystick stateRef={joystickRef} />
    </div>
  );
}
