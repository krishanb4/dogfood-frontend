// catalog.ts — Shop catalog (must mirror backend/services/goalService.js → CATALOG).
// Each entry: { id, name, icon, cost, score, goal, kind }
//   goal: "breakfast" | "lunch" | "dinner" | "any" | "all" | null
//   kind: "food" | "vitamin"

import type { CatalogItem, GoalLabel, ItemId } from "../types";

export const FOODS: CatalogItem[] = [
  { id: "bone",   name: "Bone",   icon: "🦴", cost: 10,  score: 10,  goal: "breakfast", kind: "food" },
  { id: "meat",   name: "Meat",   icon: "🥩", cost: 50,  score: 50,  goal: "lunch",     kind: "food" },
  { id: "kibble", name: "Kibble", icon: "🍖", cost: 100, score: 100, goal: "dinner",    kind: "food" },
];

export const VITAMINS: CatalogItem[] = [
  { id: "vitamin", name: "Vitamin",     icon: "💊", cost: 200,  score: 300,  goal: null,  kind: "vitamin",
    desc: "Score boost +300" },
  { id: "premium", name: "Premium",     icon: "💉", cost: 500,  score: 800,  goal: "any", kind: "vitamin",
    desc: "Ticks 1 unfinished goal" },
  { id: "boost",   name: "Power Boost", icon: "⚡",  cost: 1000, score: 2000, goal: "all", kind: "vitamin",
    desc: "Ticks ALL 3 goals + huge score" },
];

export const ALL_ITEMS: CatalogItem[] = [...FOODS, ...VITAMINS];

export const GOAL_LABELS: Record<string, GoalLabel> = {
  breakfast: { label: "Breakfast", icon: "🌅", reward: 25  },
  lunch:     { label: "Lunch",     icon: "☀️", reward: 75  },
  dinner:    { label: "Dinner",    icon: "🌙", reward: 150 },
};
export const PERFECT_DAY_BONUS = 100;

export function getItem(id: string): CatalogItem | undefined {
  return ALL_ITEMS.find((i) => i.id === (id as ItemId));
}
