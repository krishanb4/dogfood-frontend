// App.jsx — $DOGFOOD Farm Game Orchestrator
//
// Goal-based game flow (no shared pool):
//   • Buying an item via Shop debits balance (backend) + adds to local inventory.
//   • Feeding from Inventory consumes the item (local) and triggers backend
//     score/goal/reward logic.
//   • Goals reset at UTC midnight; finishing one = instant token reward.
//   • Top-20 leaderboard streamed live via `leaderboard_update`.

import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { io } from "socket.io-client";
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
import { DogSelector } from "./components/ui/DogSelector";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { HowToPlay } from "./components/ui/HowToPlay";
import { Joystick } from "./components/ui/Joystick";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5010";

// ── Dog House positions (grid-based city layout, unchanged) ──────────────
function generatePositions() {
  const slots = [];
  const ROAD_SPACING = 15;
  const zRows = [-97, -57, -45, -33, -21, 21, 33, 45, 57, 97];
  const xCols = 6;
  for (let z of zRows) {
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
const POSITIONS = generatePositions();

// ── Shop / barn building footprints ──────────────────────────────────────
// Mirrors the 9 junctions in FarmMap.jsx; each <CenterBarn /> is a 6×5 box,
// so the half-extents are (3, 2.5) in X/Z. Used for player collision.
const SHOP_POSITIONS = [
  { x:   0, z:   0 }, { x:  60, z:   0 }, { x: -60, z:   0 },
  { x:   0, z:  78 }, { x:   0, z: -78 },
  { x: -60, z:  78 }, { x:  60, z:  78 },
  { x: -60, z: -78 }, { x:  60, z: -78 },
];
const SHOP_HALF_X = 3.0;
const SHOP_HALF_Z = 2.5;

// ── Dog-house wall obstacles, defined in the house's LOCAL space ─────────
// Front fence has a gate gap (pickets skip t∈[0.35, 0.65] → x∈[-1.425, +1.425]
// at z=+4.75). So the front side is two separate wall segments flanking the
// gate. The rear / left / right fences are solid, and the house body itself
// is a 3×2.8 box centred at z=-1.5. Each entry: { cx, cz, hx, hz } in local.
const HOUSE_LOCAL_RECTS = [
  { cx:  0,       cz: -4.75, hx: 4.75,   hz: 0.15 }, // back fence
  { cx: -4.75,    cz:  0,    hx: 0.15,   hz: 4.75 }, // left fence
  { cx:  4.75,    cz:  0,    hx: 0.15,   hz: 4.75 }, // right fence
  { cx: -3.0875,  cz:  4.75, hx: 1.6625, hz: 0.15 }, // front fence, left of gate
  { cx:  3.0875,  cz:  4.75, hx: 1.6625, hz: 0.15 }, // front fence, right of gate
  { cx:  0,       cz: -1.5,  hx: 1.5,    hz: 1.4  }, // house body
];

// Rotate a local rect by `rotY` around Y, then translate to world (tx, tz).
// We're only ever rotating by ±π/2 so the rotated AABB is still axis-aligned;
// |cos| / |sin| pick up the correct half-extent swap for any 90° increment.
function rotateRect(r, rotY, tx, tz) {
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  return {
    x:      c * r.cx + s * r.cz + tx,
    z:     -s * r.cx + c * r.cz + tz,
    halfX:  Math.abs(c) * r.hx + Math.abs(s) * r.hz,
    halfZ:  Math.abs(s) * r.hx + Math.abs(c) * r.hz,
  };
}

function houseToPlayer(h, selfWallet) {
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

const EMPTY_INVENTORY = { bone: 0, meat: 0, kibble: 0, vitamin: 0, premium: 0, boost: 0 };

export default function App() {
  // ── User identity ─────────────────────────────────────────────────────
  const [selectedDog, setSelectedDog] = useState(() => {
    const saved = localStorage.getItem("dogfood_user");
    return saved ? JSON.parse(saved) : null;
  });

  // ── Server-owned state ────────────────────────────────────────────────
  const [players, setPlayers]   = useState([]);
  const [selfState, setSelfState] = useState(null); // { totalScore, dogLevel, balance, dailyGoals, ... }
  const [leaderboard, setLeaderboard] = useState([]);
  const socketRef = useRef(null);

  // ── Local UI state ────────────────────────────────────────────────────
  const [inventory, setInventory] = useState(EMPTY_INVENTORY);
  const [feedingDog, setFeedingDog] = useState(null);
  const [goalEvent, setGoalEvent] = useState(null);

  const [mapLoaded, setMapLoaded]           = useState(false);
  const [showLoading, setShowLoading]       = useState(true);
  const [showHowToPlay, setShowHowToPlay]   = useState(false);
  const [showShopPanel, setShowShopPanel]   = useState(false);
  const [showInventory, setShowInventory]   = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // On mobile, start with the goals card collapsed so the bottom of the
  // viewport is free for the joystick. Desktop keeps the original behaviour.
  const [showGoals, setShowGoals]           = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 640;
  });
  const [isFreeView, setIsFreeView]         = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Shared ref for the local player's position+yaw (read by 3rd-person camera).
  const playerStateRef = useRef(null);
  if (!playerStateRef.current) playerStateRef.current = { position: new THREE.Vector3(), yaw: 0 };

  // Shared ref written by the mobile joystick and read by Player's useFrame.
  // `active` is true while the user is dragging the knob; (x, y) are
  // screen-space offsets normalized to [-1, 1].
  const joystickRef = useRef({ active: false, x: 0, y: 0 });

  // ── Derived ───────────────────────────────────────────────────────────
  const balance    = selfState?.balance ?? 0;
  const score      = selfState?.totalScore ?? 0;
  const dogLevel   = selfState?.dogLevel ?? 1;
  const dailyGoals = selfState?.dailyGoals ?? { breakfast: false, lunch: false, dinner: false };

  // Collision obstacles for the local player: 9 shop buildings + every
  // active dog-house's fenced area. Recomputed only when the player roster
  // changes; the shop set is static.
  const obstacles = useMemo(() => {
    const list = SHOP_POSITIONS.map((s) => ({ x: s.x, z: s.z, halfX: SHOP_HALF_X, halfZ: SHOP_HALF_Z }));
    for (const p of players) {
      const slot = POSITIONS[p.slotIndex] || POSITIONS[0];
      for (const r of HOUSE_LOCAL_RECTS) {
        list.push(rotateRect(r, slot.rotY, slot.x, slot.z));
      }
    }
    return list;
  }, [players]);

  const selfPlayer = players.find((p) => p.isSelf);
  const playerSpawn = useMemo(() => {
    if (!selfPlayer) return null;
    const slot = POSITIONS[selfPlayer.slotIndex] || POSITIONS[0];
    const localOffset = new THREE.Vector3(0, 0, 7);
    localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), slot.rotY);
    return [slot.x + localOffset.x, 0, slot.z + localOffset.z];
  }, [selfPlayer?.slotIndex]);

  // ── Toggle a body class while any popup/panel is open so the in-canvas
  // YOU + player-name labels (drei <Html>) stay hidden underneath them.
  useEffect(() => {
    const open = showShopPanel || showInventory || showHowToPlay || showLeaderboard || !!goalEvent;
    document.body.classList.toggle("dfg-popup-open", open);
    return () => document.body.classList.remove("dfg-popup-open");
  }, [showShopPanel, showInventory, showHowToPlay, showLeaderboard, goalEvent]);

  // Close the mobile settings dropdown when the user taps outside of it.
  useEffect(() => {
    if (!showMobileMenu) return;
    const onDocClick = (e) => {
      if (!e.target.closest(".mobile-settings")) setShowMobileMenu(false);
    };
    // Defer so the click that opened the menu doesn't immediately close it.
    const id = requestAnimationFrame(() => {
      document.addEventListener("click", onDocClick);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", onDocClick);
    };
  }, [showMobileMenu]);

  // ── Map load + initial loading screen ─────────────────────────────────
  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
    setTimeout(() => setShowLoading(false), 1500);
  }, []);

  // ── Dog selection bootstrap ───────────────────────────────────────────
  const handleDogSelect = useCallback((userData) => {
    localStorage.setItem("dogfood_user", JSON.stringify(userData));
    setSelectedDog(userData);
  }, []);

  // ── Shop / Inventory handlers ─────────────────────────────────────────
  const handleBuy = useCallback((item) => {
    if (!socketRef.current) return;
    if (balance < item.cost) return;
    // Optimistic update — server is source of truth and will correct.
    setSelfState((s) => s ? { ...s, balance: s.balance - item.cost } : s);
    setInventory((inv) => ({ ...inv, [item.id]: (inv[item.id] || 0) + 1 }));
    socketRef.current.emit("buy", { item: item.id });
  }, [balance]);

  const handleFeedFromInventory = useCallback((item) => {
    if (!socketRef.current) return;
    if ((inventory[item.id] || 0) <= 0) return;
    // Decrement inventory locally
    setInventory((inv) => ({ ...inv, [item.id]: Math.max(0, (inv[item.id] || 0) - 1) }));
    // Trigger eating animation on self's dog for 2s
    if (selfPlayer) {
      setFeedingDog(selfPlayer.id);
      setTimeout(() => setFeedingDog(null), 2000);
    }
    socketRef.current.emit("feed", { item: item.id });
  }, [inventory, selfPlayer]);

  // ── Socket.io lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedDog?.wallet) return;
    const selfWallet = selectedDog.wallet;
    const socket = io(BACKEND_URL, {
      query: { wallet: selfWallet },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("player_join", { username: selectedDog.name, dog: selectedDog.breed });
    });

    socket.on("self_state", (state) => setSelfState(state));

    socket.on("dog_houses_list", (houses) => {
      setPlayers(houses.map((h) => houseToPlayer(h, selfWallet)));
    });

    socket.on("new_dog_house", (h) => {
      setPlayers((prev) => {
        const incoming = houseToPlayer(h, selfWallet);
        const idx = prev.findIndex((p) => p.wallet === incoming.wallet);
        if (idx === -1) return [...prev, incoming];
        const next = [...prev];
        next[idx] = { ...prev[idx], ...incoming };
        return next;
      });
    });

    socket.on("player_leave", ({ wallet }) => {
      setPlayers((prev) => prev.filter((p) => p.wallet !== wallet));
    });

    socket.on("buy_result", ({ user }) => {
      // Reconcile balance with server truth
      setSelfState((s) => s ? { ...s, ...user } : user);
    });
    socket.on("buy_error", (e) => {
      console.warn("buy_error:", e);
      // TODO: surface toast — for now revert by re-fetching state
    });

    socket.on("feed_result", (result) => {
      setSelfState((s) => s ? { ...s, ...result.user } : result.user);
      // Update own player level so DogHouse re-renders with correct scale
      setPlayers((prev) => prev.map((p) => p.isSelf ? { ...p, level: result.user.dogLevel } : p));
      if (result.completedGoals?.length || result.perfectDay) {
        setGoalEvent({
          completedGoals: result.completedGoals,
          awardedTokens:  result.awardedTokens,
          perfectDay:     result.perfectDay,
        });
      }
    });

    socket.on("feed_event", ({ wallet, newLevel }) => {
      setPlayers((prev) => prev.map((p) => p.wallet === wallet ? { ...p, level: newLevel } : p));
      if (wallet !== selfWallet) {
        // Trigger remote dog's eating animation briefly
        setFeedingDog(wallet);
        setTimeout(() => setFeedingDog((cur) => (cur === wallet ? null : cur)), 2000);
      }
    });

    socket.on("leaderboard_update", (rows) => setLeaderboard(rows));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedDog?.wallet, selectedDog?.name, selectedDog?.breed]);

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
          position={[60, 80, 40]} intensity={2} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-80} shadow-camera-right={80}
          shadow-camera-top={80} shadow-camera-bottom={-80}
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

        {/* ── Decorative trees scattered across free grass zones ─────── */}
        {mapLoaded && (
          <Suspense fallback={null}>
            <Trees houseSlots={POSITIONS} />
          </Suspense>
        )}

        {mapLoaded && players.map((player) => {
          const slot = POSITIONS[player.slotIndex] || POSITIONS[0];
          return (
            <Suspense key={player.id} fallback={null}>
              <DogHouse
                position={[slot.x, 0, slot.z]}
                rotation={[0, slot.rotY, 0]}
                player={player}
                isEating={feedingDog === player.id}
                onInventoryClick={player.isSelf ? () => setShowInventory(true) : undefined}
              />
            </Suspense>
          );
        })}

        {mapLoaded && playerSpawn && (
          <Suspense fallback={null}>
            <Player
              initialPosition={playerSpawn}
              stateRef={playerStateRef}
              obstacles={obstacles}
              joystickRef={joystickRef}
            />
          </Suspense>
        )}

        {isFreeView || !playerSpawn ? (
          <OrbitControls
            makeDefault enableDamping dampingFactor={0.08}
            minDistance={15} maxDistance={isFreeView ? 400 : 80}
            maxPolarAngle={Math.PI / 2 - 0.1}
            target={[0, 0, 0]}
          />
        ) : (
          <ThirdPersonCamera stateRef={playerStateRef} />
        )}
      </Canvas>

      {/* ── Logo + Help button + view toggle ───────────────────────────── */}
      {/*  All non-logo buttons are desktop-only; on mobile they live in
           the .mobile-settings dropdown below to free up the cramped
           top-left strip and the bottom of the viewport for the joystick. */}
      <div className="game-logo">
        <span className="logo-icon">🐕</span>
        <span className="logo-text"><span>$DOG</span>FOOD</span>
        <button className="help-btn dfg-desktop-only" onClick={() => setShowHowToPlay(true)}>❓</button>
        <button
          className="help-btn dfg-desktop-only"
          onClick={() => setIsFreeView(!isFreeView)}
          title={isFreeView ? "Normal View" : "Free View"}
          aria-label={isFreeView ? "Normal View" : "Free View"}
        >
          <CiVideoOn />
        </button>
        <button
          className="help-btn dfg-desktop-only"
          onClick={() => setShowLeaderboard((v) => !v)}
          title="Leaderboard"
          aria-label="Leaderboard"
        >
          <MdOutlineLeaderboard />
        </button>
        <span
          className="dfg-progress-btn dfg-desktop-only"
          style={{ "--pct": (Object.values(dailyGoals).filter(Boolean).length / 3) * 100 }}
        >
          <button
            className="help-btn"
            onClick={() => setShowGoals((v) => !v)}
            title={`Daily Goals (${Object.values(dailyGoals).filter(Boolean).length}/3)`}
            aria-label="Daily Goals"
          >
            <FaTasks />
          </button>
        </span>
      </div>

      {/* ── Mobile-only settings drawer (≤640px) ──────────────────────────
           A gear icon pinned to the top-right. Tapping it slides a small
           card out from the corner (wardrobe-style: scale + translate from
           the gear's origin). It groups the same toggles the desktop logo
           bar shows: How to Play, Camera, Leaderboard, Daily Goals.
           Tapping outside the card — or the gear again — closes it. */}
      <div className="mobile-settings">
        <button
          className={`help-btn settings-toggle ${showMobileMenu ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowMobileMenu((v) => !v);
          }}
          aria-label="Settings"
          aria-expanded={showMobileMenu}
        >
          <FaCog />
        </button>
        <div className={`mobile-settings-panel ${showMobileMenu ? "open" : ""}`}>
          <button
            className="mobile-menu-item"
            onClick={() => { setShowHowToPlay(true); setShowMobileMenu(false); }}
          >
            <span className="mm-icon">❓</span>
            <span>How to Play</span>
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => { setIsFreeView((v) => !v); setShowMobileMenu(false); }}
          >
            <CiVideoOn className="mm-icon" />
            <span>{isFreeView ? "Normal View" : "Free View"}</span>
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => { setShowLeaderboard((v) => !v); setShowMobileMenu(false); }}
          >
            <MdOutlineLeaderboard className="mm-icon" />
            <span>Leaderboard</span>
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => { setShowGoals((v) => !v); setShowMobileMenu(false); }}
          >
            <FaTasks className="mm-icon" />
            <span>Daily Goals ({Object.values(dailyGoals).filter(Boolean).length}/3)</span>
          </button>
        </div>
      </div>

      {/* ── Top bar: Score · Goals Reset Timer · Online ────────────────── */}
      <div className="top-bar">
        <ScoreDisplay score={score} level={dogLevel} />
        <CountdownTimer />
        <div className="top-card">
          <div className="label">Online</div>
          <div className="value online">{players.length}</div>
        </div>
      </div>

      {/* ── Balance badge ─────────────────────────────────────────────── */}
      <div className="balance-badge">
        <span>💰</span>
        <span>{balance.toLocaleString()} $DOGFOOD</span>
      </div>

      {/* ── Daily Goals (toggled via FaTasks button) ───────────────────── */}
      {selectedDog && showGoals && (
        <DailyGoals goals={dailyGoals} onClose={() => setShowGoals(false)} />
      )}

      {/* ── Popups ─────────────────────────────────────────────────────── */}
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
          selfWallet={selectedDog?.wallet}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {goalEvent && <GoalCompletePopup event={goalEvent} onDone={() => setGoalEvent(null)} />}

      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
      <LoadingScreen isVisible={showLoading} />

      {!selectedDog && <DogSelector onSelect={handleDogSelect} />}

      {/* ── Mobile virtual joystick (CSS hides it on desktop) ────────────
           Mounted last so it sits above every other floating UI layer —
           the user explicitly asked that popups not cover the joystick. */}
      <Joystick stateRef={joystickRef} />
    </div>
  );
}
