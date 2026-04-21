import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // This fixes the path issue for Electron
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});