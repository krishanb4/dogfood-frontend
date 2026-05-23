import type { Meta, StoryObj } from "@storybook/react-vite";
import { GoalCompletePopup } from "../components/ui/GoalCompletePopup";

const meta: Meta<typeof GoalCompletePopup> = {
  title: "UI / GoalCompletePopup",
  component: GoalCompletePopup,
  parameters: { layout: "fullscreen" },
  args: { onDone: () => {} },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "#0C0A18" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof GoalCompletePopup>;

export const SingleGoal: Story = {
  name: "Single goal (breakfast)",
  args: {
    event: {
      completedGoals: ["breakfast"],
      awardedTokens: 25,
      perfectDay: false,
    },
  },
};

export const MultiGoal: Story = {
  name: "Two goals at once",
  args: {
    event: {
      completedGoals: ["lunch", "dinner"],
      awardedTokens: 225,
      perfectDay: false,
    },
  },
};

export const PerfectDay: Story = {
  name: "Perfect day bonus",
  args: {
    event: {
      completedGoals: ["breakfast", "lunch", "dinner"],
      awardedTokens: 350,
      perfectDay: true,
    },
  },
};

export const Null: Story = {
  name: "No event (renders nothing)",
  args: { event: null },
};
