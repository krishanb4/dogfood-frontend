import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OnboardingPageView } from "../components/ui/OnboardingPage";
import type { DogType } from "../types";

/** Tiny stub for RainbowKit's ConnectButton so the story doesn't need a Wagmi provider. */
function WalletStub(): JSX.Element {
  return (
    <button
      type="button"
      className="px-5 py-2.5 rounded-2xl font-extrabold text-[14px] bg-gradient-to-b from-primary to-primary-dk text-white border-2 border-white shadow-[0_4px_14px_rgba(124,92,252,0.40)] cursor-pointer"
    >
      Connect Wallet
    </button>
  );
}

const meta: Meta<typeof OnboardingPageView> = {
  title: "UI / OnboardingPage",
  component: OnboardingPageView,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof OnboardingPageView>;

/** Step 1 — wallet connect. */
export const ConnectStep: Story = {
  name: "Step 1 — Connect wallet",
  args: {
    step: "connect",
    name: "",
    breed: null,
    onNameChange: () => {},
    onBreedChange: () => {},
    onJoin: () => {},
    walletSlot: <WalletStub />,
  },
};

/** Step 2 — empty profile form. */
export const ProfileEmpty: Story = {
  name: "Step 2 — Empty profile",
  args: {
    step: "profile",
    name: "",
    breed: null,
    onNameChange: () => {},
    onBreedChange: () => {},
    onJoin: () => {},
  },
};

/** Step 2 — name filled, breed selected (CTA enabled). */
export const ProfileFilled: Story = {
  name: "Step 2 — Filled profile",
  args: {
    step: "profile",
    name: "Biscuit",
    breed: "shibainu",
    onNameChange: () => {},
    onBreedChange: () => {},
    onJoin: () => {},
  },
};

/** Step 2 — interactive variant: typing + dog selection actually work. */
export const ProfileInteractive: Story = {
  name: "Step 2 — Interactive",
  render: () => {
    const [name, setName]   = useState("");
    const [breed, setBreed] = useState<DogType | null>(null);
    return (
      <OnboardingPageView
        step="profile"
        name={name}
        onNameChange={setName}
        breed={breed}
        onBreedChange={setBreed}
        onJoin={() => alert(`Joined as ${name} (${breed})`)}
      />
    );
  },
};
