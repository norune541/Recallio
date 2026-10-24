import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      src: resolve(import.meta.dirname, 'src'),
    },
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    include: [
      'src/**/*.spec.ts',
      'src/**/*.test.ts',
      'test/**/*.e2e-spec.ts',
      'test/**/*.spec.ts',
      'test/**/*.test.ts',
    ],
  },
});
