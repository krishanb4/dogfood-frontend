import type { Meta, StoryObj } from "@storybook/react-vite";
import { DogSelector } from "../components/ui/DogSelector";

const meta: Meta<typeof DogSelector> = {
  title: "UI / DogSelector",
  component: DogSelector,
  parameters: { layout: "fullscreen" },
  args: { onSelect: () => {} },
};
export default meta;
type Story = StoryObj<typeof DogSelector>;

export const Default: Story = { name: "Dog selector (initial)" };
