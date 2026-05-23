import type { Meta, StoryObj } from "@storybook/react-vite";
import { DepositPanel } from "../components/ui/DepositPanel";

const meta: Meta<typeof DepositPanel> = {
  title: "UI / DepositPanel",
  component: DepositPanel,
  parameters: { layout: "fullscreen" },
  args: { onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof DepositPanel>;

export const Default: Story = {
  name: "With wallet + balance",
  args: {
    wallet:  "0x742d35Cc6634C0532925a3b844Bc9e7595f0fAE3",
    balance: 12_450,
  },
};

export const HighBalance: Story = {
  name: "Whale balance",
  args: {
    wallet:  "0xAbCdEf1234567890aBcDeF1234567890AbCdEf12",
    balance: 9_876_543,
  },
};

export const ZeroBalance: Story = {
  name: "Empty balance",
  args: {
    wallet:  "0x742d35Cc6634C0532925a3b844Bc9e7595f0fAE3",
    balance: 0,
  },
};

export const NoWallet: Story = {
  name: "No wallet connected",
  args: {
    wallet:  undefined,
    balance: 0,
  },
};
