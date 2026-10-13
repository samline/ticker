export default {
  code: { label: 'Code example: {filename}' },
  copy: {
    command: 'npm install @samline/ticker',
    label: 'Copy',
    ariaLabel: 'Copy npm install command',
    copiedLabel: 'Copied!',
    success: 'Install command copied to clipboard.',
    fallback: 'Command selected. Press Control+C or Command+C to copy.',
  },
  theme: {
    label: 'Dark theme',
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    title: 'Switch color theme',
  },
  ticker: {
    pause: 'Pause animation',
    pauseLabel: 'Pause animation: {label}',
  },
  speed: {
    label: 'Loop duration',
    ariaLabel: 'Demo loop duration in seconds',
    display: '{seconds}s',
    description: '{seconds} seconds per loop',
  },
} as const
