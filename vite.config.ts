import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [ tailwindcss(), tsconfigPaths()],
  server: {
    proxy: {
      '/uploads': {
        target: 'https://new-cms-dev.runasp.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
