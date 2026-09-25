import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import vm from 'node:vm'

const requiredFiles = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.d.cts',
  'dist/browser/index.js',
  'dist/browser/index.cjs',
  'dist/browser/global.global.js',
  'dist/style.css',
]

for (const file of requiredFiles) {
  assert.ok(existsSync(resolve(file)), `Missing package artifact: ${file}`)
}

const esm = await import('../dist/index.js')
const require = createRequire(import.meta.url)
const cjs = require('../dist/index.cjs')

for (const module of [esm, cjs]) {
  assert.equal(typeof module.ticker, 'function')
  assert.equal(typeof module.Ticker, 'object')
}

assert.equal(globalThis.Ticker, undefined)
const browser = await import('../dist/browser/index.js')
assert.equal(typeof browser.default.ticker, 'function')
assert.equal(browser.default.newTicker, browser.newTicker)
assert.equal(globalThis.Ticker, undefined)

const source = readFileSync(resolve('dist/browser/global.global.js'), 'utf8')
const context = { console }
vm.runInNewContext(source, context)
assert.equal(typeof context.Ticker.ticker, 'function')
assert.equal(typeof context.Ticker.newTicker, 'function')
assert.equal(typeof context.Ticker.destroyTicker, 'function')

console.log('Package smoke test passed for ESM, CommonJS, types, browser IIFE, and CSS.')
