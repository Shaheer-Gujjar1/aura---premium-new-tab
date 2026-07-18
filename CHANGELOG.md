# Changelog - Aura Premium New Tab

## [2.2.0] - 2026-07-18

### Added
- **Weather caching**: Implemented 30‑minute localStorage cache for weather data to improve offline resilience.
- **City search on keypress**: Updated search bar to trigger results on each keystroke instead of requiring Enter.
- **Results list blur background**: Applied backdrop‑blur effect to the city search results list for better UI.
- **Digital clock fixed layout**: Applied fixed width and tabular numbers to hour/minute/second elements to prevent layout shift.
- **Add shortcut modal height**: Increased modal height by ~30 px for better spacing.

### Fixed
- **Icon flickering offline**: Replaced network favicon fallback with local SVG to stop flickering when offline.

## [2.1.0] - 2026-07-14

### Changed
- **Restored "tabs" Permission**: Kept `"tabs"` permission intact in `manifest.json` to preserve core browser integration features.
- **Safe Passive Media Detection**: Removed `chrome.tabs.onUpdated` and `chrome.tabs.onRemoved` background event listeners that intercept tab changes. Replaced them with a passive, low-frequency poll (every 5 seconds) to prevent IPC flooding and process deadlock on Linux Chrome when interacting with cross-origin isolated web apps.
- **Isolated Known Crash Origins**: Added a runtime check to immediately ignore media queries when visiting known crash‑prone pages (like `deepseek.com`).

### Fixed
- **DeepSeek Tab Crash**: Resolved the Chrome `Aw, Snap!` renderer crash when navigating to or loading DeepSeek AI on Linux, while keeping cross‑tab audio/media status features active.
