// Dog.jsx — Breed dispatcher. Picks the correct GLB-backed dog component
// (Husky / Pug / ShibaInu) based on the player's chosen breed. Each breed
// component handles its own animations and autonomous wandering inside the
// fenced grass patch.

import { Husky } from "./dogs/Husky";
import { Pug } from "./dogs/Pug";
import { ShibaInu } from "./dogs/ShibaInu";

const BREEDS = {
  husky: Husky,
  pug: Pug,
  shibainu: ShibaInu,
};

export function Dog({ breed = "husky", level = 1, isEating = false, wallet }) {
  const Component = BREEDS[breed] || Husky;
  return <Component level={level} isEating={isEating} wallet={wallet} />;
}
