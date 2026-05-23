import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShopPanel } from "../components/ui/ShopPanel";

const meta: Meta<typeof ShopPanel> = {
  title: "UI / ShopPanel",
  component: ShopPanel,
  parameters: { layout: "fullscreen" },
  args: { onBuy: () => {}, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof ShopPanel>;

export const RichBalance: Story = {
  name: "Rich balance",
  args: {
    balance: 2500,
    dailyGoals: { breakfast: false, lunch: false, dinner: false },
  },
};

export const GoalsDone: Story = {
  name: "All goals complete",
  args: {
    balance: 5000,
    dailyGoals: { breakfast: true, lunch: true, dinner: true },
  },
};

export const Broke: Story = {
  name: "No balance",
  args: {
    balance: 0,
    dailyGoals: { breakfast: false, lunch: false, dinner: false },
  },
};

export const PartialGoals: Story = {
  name: "Partial goals done",
  args: {
    balance: 300,
    dailyGoals: { breakfast: true, lunch: false, dinner: false },
  },
};
