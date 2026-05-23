import type { Meta, StoryObj } from "@storybook/react-vite";
import { Leaderboard } from "../components/ui/Leaderboard";
import type { LeaderboardRow } from "../types";

const MOCK_ROWS: LeaderboardRow[] = [
  { rank: 1, wallet: "0xAAA", username: "AlphaWolf",    selectedDog: "husky",    totalScore: 12450, dogLevel: 10, goalsCompleted: 42, perfectDays: 7 },
  { rank: 2, wallet: "0xBBB", username: "PugKing",      selectedDog: "pug",      totalScore: 9800,  dogLevel: 8,  goalsCompleted: 31, perfectDays: 5 },
  { rank: 3, wallet: "0xCCC", username: "FoxMaster",   selectedDog: "shibainu", totalScore: 7650,  dogLevel: 7,  goalsCompleted: 27, perfectDays: 3 },
  { rank: 4, wallet: "0xDDD", username: "HuskyHero",   selectedDog: "husky",    totalScore: 5200,  dogLevel: 5,  goalsCompleted: 18, perfectDays: 2 },
  { rank: 5, wallet: "0xEEE", username: "PugLife",     selectedDog: "pug",      totalScore: 3800,  dogLevel: 4,  goalsCompleted: 14, perfectDays: 1 },
  { rank: 6, wallet: "0xFFF", username: "ShibaStorm",  selectedDog: "shibainu", totalScore: 2100,  dogLevel: 3,  goalsCompleted: 8,  perfectDays: 0 },
  { rank: 7, wallet: "0xGGG", username: "GoldenPaw",   selectedDog: "husky",    totalScore: 1500,  dogLevel: 2,  goalsCompleted: 5,  perfectDays: 0 },
];

const meta: Meta<typeof Leaderboard> = {
  title: "UI / Leaderboard",
  component: Leaderboard,
  parameters: { layout: "fullscreen" },
  args: { onClose: () => {} },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "#0C0A18" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Leaderboard>;

export const WithRanks: Story = {
  name: "Populated leaderboard",
  args: { rows: MOCK_ROWS, selfWallet: "0xDDD" },
};

export const SelfOnTop: Story = {
  name: "Self ranked #1",
  args: { rows: MOCK_ROWS, selfWallet: "0xAAA" },
};

export const Empty: Story = {
  name: "Empty board",
  args: { rows: [], selfWallet: "0xDDD" },
};
