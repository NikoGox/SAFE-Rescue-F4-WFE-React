import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // ignoramos la advertencia de TypeScript porque "test" no forma parte del tipo oficial de Vite
  // @ts-ignore
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTest.ts',
    include: [
      'src/**/*.{test,spec,Testing,Test}.{js,jsx,ts,tsx}',
      'test/**/*.{test,spec,Testing,Test}.{js,jsx,ts,tsx}'
    ],
  },
});