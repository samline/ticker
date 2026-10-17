export default {
  code: { label: 'Code example: {filename}', copyLabel: 'Copy code from {filename}' },
  copy: {
    command: 'npm install @samline/ticker',
    label: 'Copy',
    ariaLabel: 'Copy npm install command',
    copiedLabel: 'Copied!',
    success: 'Copied to clipboard.',
    fallback: 'Code selected. Press Control+C or Command+C to copy.',
  },
  theme: {
    label: 'Dark theme',
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    title: 'Switch color theme',
  },
  ticker: {
    previous: 'Previous items',
    next: 'Next items',
    position: 'Position in repeated sequence',
    pause: 'Pause animation',
    play: 'Play animation',
    pauseLabel: 'Pause animation: {label}',
    playLabel: 'Play animation: {label}',
  },
  speed: {
    label: 'Loop duration',
    ariaLabel: 'Demo loop duration in seconds',
    display: '{seconds}s',
    description: '{seconds} seconds per loop',
  },
} as const
