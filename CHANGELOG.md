# Changelog - Aura Premium New Tab

All notable changes made to the Aura Premium New Tab extension project are documented below.

## [2.1.0] - 2026-07-14

### Changed
- **Restored "tabs" Permission**: Kept `"tabs"` permission intact in `manifest.json` to preserve core browser integration features.
- **Safe Passive Media Detection**: Removed `chrome.tabs.onUpdated` and `chrome.tabs.onRemoved` background event listeners that intercept tab changes. Replaced them with a passive, low-frequency poll (every 5 seconds) to prevent IPC flooding and process deadlock on Linux Chrome when interacting with cross-origin isolated web apps.
- **Isolated Known Crash Origins**: Added a runtime check to immediately ignore media queries when visiting known crash-prone pages (like `deepseek.com`).

### Fixed
- **DeepSeek Tab Crash**: Resolved the Chrome `Aw, Snap!` renderer crash when navigating to or loading DeepSeek AI on Linux, while keeping cross-tab audio/media status features active.
