import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@" points at the project root, e.g. import x from "@/src/config"
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
