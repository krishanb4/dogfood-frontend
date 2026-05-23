import { create } from "zustand";
import type {
  User,
  SelfState,
  PlayerState,
  LeaderboardRow,
  Inventory,
  ItemId,
} from "../types";

export interface GoalEvent {
  completedGoals: string[];
  awardedTokens: number;
  perfectDay: boolean;
}

interface GameStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  selfState: SelfState | null;
  setSelfState: (state: SelfState) => void;
  mergeSelfState: (partial: Partial<SelfState>) => void;
  players: PlayerState[];
  setPlayers: (players: PlayerState[]) => void;
  upsertPlayer: (player: PlayerState) => void;
  removePlayer: (wallet: string) => void;
  updatePlayerLevel: (wallet: string, level: number) => void;
  leaderboard: LeaderboardRow[];
  setLeaderboard: (rows: LeaderboardRow[]) => void;
  inventory: Inventory;
  setInventory: (inv: Inventory) => void;
  addInventoryItem: (itemId: ItemId) => void;
  consumeInventoryItem: (itemId: ItemId) => void;
  feedingDog: string | null;
  setFeedingDog: (id: string | null) => void;
  goalEvent: GoalEvent | null;
  setGoalEvent: (event: GoalEvent | null) => void;
  mapLoaded: boolean;
  setMapLoaded: (v: boolean) => void;
  showLoading: boolean;
  setShowLoading: (v: boolean) => void;
  showHowToPlay: boolean;
  setShowHowToPlay: (v: boolean) => void;
  showShopPanel: boolean;
  setShowShopPanel: (v: boolean) => void;
  showInventory: boolean;
  setShowInventory: (v: boolean) => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (v: boolean) => void;
  showGoals: boolean;
  setShowGoals: (v: boolean) => void;
  isFreeView: boolean;
  setIsFreeView: (v: boolean) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (v: boolean) => void;
  showDeposit: boolean;
  setShowDeposit: (v: boolean) => void;
}

const EMPTY_INVENTORY: Inventory = { bone: 0, meat: 0, kibble: 0, vitamin: 0, premium: 0, boost: 0 };

export const useGameStore = create<GameStore>((set) => ({
  // ── Auth ────────────────────────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // ── Server state (socket-driven) ─────────────────────────────────────
  selfState: null,
  players: [],
  leaderboard: [],

  setSelfState: (state) => set({ selfState: state }),
  mergeSelfState: (partial) =>
    set((s) => ({ selfState: s.selfState ? { ...s.selfState, ...partial } : (partial as SelfState) })),

  setPlayers: (players) => set({ players }),
  upsertPlayer: (incoming) =>
    set((s) => {
      const idx = s.players.findIndex((p) => p.wallet === incoming.wallet);
      if (idx === -1) return { players: [...s.players, incoming] };
      const next = [...s.players];
      next[idx] = { ...s.players[idx], ...incoming };
      return { players: next };
    }),
  removePlayer: (wallet) =>
    set((s) => ({ players: s.players.filter((p) => p.wallet !== wallet) })),
  updatePlayerLevel: (wallet, level) =>
    set((s) => ({
      players: s.players.map((p) => (p.wallet === wallet ? { ...p, level } : p)),
    })),

  setLeaderboard: (rows) => set({ leaderboard: rows }),

  // ── Local game state ──────────────────────────────────────────────────
  inventory: EMPTY_INVENTORY,
  feedingDog: null,
  goalEvent: null,

  setInventory: (inv) => set({ inventory: inv }),
  addInventoryItem: (itemId) =>
    set((s) => ({ inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 } })),
  consumeInventoryItem: (itemId) =>
    set((s) => ({
      inventory: { ...s.inventory, [itemId]: Math.max(0, (s.inventory[itemId] || 0) - 1) },
    })),
  setFeedingDog: (id) => set({ feedingDog: id }),
  setGoalEvent: (event) => set({ goalEvent: event }),

  // ── UI flags ──────────────────────────────────────────────────────────
  mapLoaded: false,
  showLoading: true,
  showHowToPlay: false,
  showShopPanel: false,
  showInventory: false,
  showLeaderboard: false,
  showGoals: typeof window !== "undefined" ? window.innerWidth > 640 : true,
  isFreeView: false,
  showMobileMenu: false,
  showDeposit: false,

  setMapLoaded: (v) => set({ mapLoaded: v }),
  setShowLoading: (v) => set({ showLoading: v }),
  setShowHowToPlay: (v) => set({ showHowToPlay: v }),
  setShowShopPanel: (v) => set({ showShopPanel: v }),
  setShowInventory: (v) => set({ showInventory: v }),
  setShowLeaderboard: (v) => set({ showLeaderboard: v }),
  setShowGoals: (v) => set({ showGoals: v }),
  setIsFreeView: (v) => set({ isFreeView: v }),
  setShowMobileMenu: (v) => set({ showMobileMenu: v }),
  setShowDeposit: (v) => set({ showDeposit: v }),
}));
