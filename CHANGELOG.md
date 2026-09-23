# Changelog

## [1.1.0] - 2026-09-23

- Added a shared `Ticker` / `browser` singleton and named registry helpers.
- Recreating an id now tears down the previous runtime before enhancing it again.
- Destroying a registered ticker clears observers, clones, registry state, and restores the source DOM.
