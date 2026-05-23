import type { Meta, StoryObj } from "@storybook/react-vite";
import { InventoryPanel } from "../components/ui/InventoryPanel";
import type { Inventory } from "../types";

const FULL_INV: Inventory = { bone: 3, meat: 2, kibble: 1, vitamin: 2, premium: 1, boost: 0 };
const FOOD_ONLY: Inventory = { bone: 5, meat: 0, kibble: 2, vitamin: 0, premium: 0, boost: 0 };
const EMPTY_INV: Inventory = { bone: 0, meat: 0, kibble: 0, vitamin: 0, premium: 0, boost: 0 };

const meta: Meta<typeof InventoryPanel> = {
  title: "UI / InventoryPanel",
  component: InventoryPanel,
  parameters: { layout: "fullscreen" },
  args: {
    onFeed: () => {},
    onClose: () => {},
    disabled: false,
    dailyGoals: { breakfast: false, lunch: false, dinner: false },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "#0C0A18" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof InventoryPanel>;

export const Mixed: Story = {
  name: "Mixed inventory",
  args: {
    inventory: FULL_INV,
    dailyGoals: { breakfast: true, lunch: false, dinner: false },
  },
};

export const FoodOnly: Story = {
  name: "Food items only",
  args: { inventory: FOOD_ONLY },
};

export const Empty: Story = {
  name: "Empty inventory",
  args: { inventory: EMPTY_INV },
};

export const Disabled: Story = {
  name: "Feeding disabled (busy)",
  args: { inventory: FULL_INV, disabled: true },
};
