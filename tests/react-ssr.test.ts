// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';

describe('ticker react SSR', () => {
  it('imports the React entrypoint without a browser environment', async () => {
    vi.resetModules();

    const module = await import('../src/react/index');

    expect(module.Ticker).toBeDefined();
  });
});