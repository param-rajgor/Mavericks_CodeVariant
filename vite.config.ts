import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// base './' keeps the hash-routed app working from any static-hosting sub-path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // "@" is the src folder, e.g. import { analyzeProject } from "@/backend/domain/analysis"
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
