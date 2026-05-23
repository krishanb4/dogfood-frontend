import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import "../src/App.css";
import "../src/styles/popups.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        game: { name: "game",  value: "#0C0A18" },
        dark: { name: "dark",  value: "#1a1a2e" },
        light: { name: "light", value: "#f0f0f0" }
      }
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: "game"
    }
  }
};

export default preview;
