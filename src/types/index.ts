export type DogType = "husky" | "pug" | "shibainu";
export type GoalKey = "breakfast" | "lunch" | "dinner";
export type GoalTarget = GoalKey | "any" | "all" | null;
export type ItemKind = "food" | "vitamin";
export type ItemId = "bone" | "meat" | "kibble" | "vitamin" | "premium" | "boost";

export interface DailyGoals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  lastResetDate?: string;
}

export interface SelfState {
  wallet: string;
  username: string;
  selectedDog: DogType;
  totalScore: number;
  dogLevel: number;
  balance: number;
  dailyGoals: DailyGoals;
  goalsCompleted: number;
  perfectDays: number;
}

export interface PlayerState {
  id: string;
  wallet: string;
  username: string;
  dog: DogType;
  slotIndex: number;
  level: number;
  isSelf: boolean;
  contribution?: number;
}

export interface LeaderboardRow {
  rank: number;
  wallet: string;
  username: string;
  selectedDog: DogType;
  totalScore: number;
  dogLevel: number;
  goalsCompleted: number;
  perfectDays: number;
}

export interface CatalogItem {
  id: ItemId;
  name: string;
  icon: string;
  cost: number;
  score: number;
  goal: GoalTarget;
  kind: ItemKind;
  desc?: string;
}

export interface GoalLabel {
  label: string;
  icon: string;
  reward: number;
}

export type Inventory = Record<ItemId, number>;

export interface User {
  wallet: string;
  name: string;
  breed: DogType;
  hasProfile: boolean;
}

export interface Obstacle {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
}

export interface SlotPosition {
  x: number;
  z: number;
  rotY: number;
}

export interface JoystickState {
  active: boolean;
  x: number;
  y: number;
}
