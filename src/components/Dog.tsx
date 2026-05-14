// Dog.tsx — Breed dispatcher. Picks the correct GLB-backed dog component
// (Husky / Pug / ShibaInu) based on the player's chosen breed. Each breed
// component handles its own animations and autonomous wandering inside the
// fenced grass patch.

import type { DogType } from "../types";
import { Husky } from "./dogs/Husky";
import { Pug } from "./dogs/Pug";
import { ShibaInu } from "./dogs/ShibaInu";

interface DogProps {
  breed?: DogType;
  level?: number;
  isEating?: boolean;
  wallet?: string;
}

const BREEDS: Record<DogType, React.ComponentType<{ level?: number; isEating?: boolean; wallet?: string }>> = {
  husky: Husky,
  pug: Pug,
  shibainu: ShibaInu,
};

import React from "react";

export function Dog({ breed = "husky", level = 1, isEating = false, wallet }: DogProps): JSX.Element {
  const Component = BREEDS[breed] || Husky;
  return <Component level={level} isEating={isEating} wallet={wallet} />;
}
