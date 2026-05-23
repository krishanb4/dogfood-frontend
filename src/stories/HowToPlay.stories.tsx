import type { Meta, StoryObj } from "@storybook/react-vite";
import { HowToPlay } from "../components/ui/HowToPlay";

const meta: Meta<typeof HowToPlay> = {
  title: "UI / HowToPlay",
  component: HowToPlay,
  parameters: { layout: "fullscreen" },
  args: { onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof HowToPlay>;

export const Default: Story = { name: "How to Play modal" };
