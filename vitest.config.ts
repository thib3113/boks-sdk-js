import babel from 'vite-plugin-babel';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [
    babel({
      babelConfig: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { version: '2023-05' }]
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    reporters: ['default', 'junit'],
    include: ['tests/**/*.{test,spec}.ts'],
    outputFile: {
      junit: './junit.xml'
    },
    coverage: {
      provider: 'v8',
      all: true,
      reporter: ['text', 'lcov', 'clover'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts']
    },
    exclude: [...defineConfig({}).test?.exclude || [], 'tests/e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
