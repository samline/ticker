import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      style: 'src/style.css',
      'core/index': 'src/core/index.ts',
      'vanilla/index': 'src/vanilla/index.ts',
      'browser/index': 'src/browser/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    outDir: 'dist',
  },
  {
    // ticker.global.js is the family name; global.global.js stays as an alias
    // for v3 CDN URLs.
    entry: {
      'browser/ticker': 'src/browser/global.ts',
      'browser/global': 'src/browser/global.ts',
    },
    format: ['iife'],
    minify: true,
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    outDir: 'dist',
    globalName: 'TickerBundle',
  },
])
