/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Stylesheets are real in tests, so a test can assert the CSS contracts the
    // world-space geometry depends on instead of only the markup.
    css: true,
  },
});
