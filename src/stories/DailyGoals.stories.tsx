import type { Meta, StoryObj } from "@storybook/react-vite";
import { DailyGoals } from "../components/ui/DailyGoals";

const meta: Meta<typeof DailyGoals> = {
  title: "UI / DailyGoals",
  component: DailyGoals,
  parameters: { layout: "fullscreen" },
  args: { onClose: () => {} },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", padding: "140px 24px 24px", background: "#0C0A18" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DailyGoals>;

export const AllPending: Story = {
  name: "All goals pending",
  args: { goals: { breakfast: false, lunch: false, dinner: false } },
};

export const OneComplete: Story = {
  name: "Breakfast done",
  args: { goals: { breakfast: true, lunch: false, dinner: false } },
};

export const TwoDone: Story = {
  name: "Two meals done",
  args: { goals: { breakfast: true, lunch: true, dinner: false } },
};

export const PerfectDay: Story = {
  name: "Perfect day — all done",
  args: { goals: { breakfast: true, lunch: true, dinner: true } },
};

export const NoClose: Story = {
  name: "No close button",
  args: { goals: { breakfast: false, lunch: false, dinner: false }, onClose: undefined },
};
