# Changelog - Aura Premium New Tab

All notable changes made to the Aura Premium New Tab extension project are documented below.

## [1.1.0] - 2026-07-11

### Added
- **Native Browser Bookmarks Sync**: Added Chrome Bookmarks API integration. The bookmarks module now dynamically displays, adds, and removes native bookmarks from Chrome when run as an extension, with automatic real-time event synchronization (`onCreated`, `onRemoved`, `onChanged`, `onMoved`, `onChildrenReordered`).
- **Weather Widget Enhancements**:
  - Replaced wind speed in the main weather widget with **Feels Like (apparent temperature)** using a new thermometer icon indicator.
  - Added **hourly rain chances (precipitation probability)** next to icons in the timeline of the detailed weather forecast panel (rendered dynamically if the probability is greater than 0%).
- **Google Apps Dynamic Icon Resolver**: Implemented a helper function `getAppIcon` that dynamically resolves favicons via Google's Favicon API for Google Ecosystem tools (fixing previously missing icons for Colab, Google One, etc.) while preserving high-resolution brand icons where custom gstatic images exist.
- **Improved Shortcutting Services**: Switched shortcut favicons generation inside Quick Links and Bookmarks to Google's public high-res favicon resolver API to resolve missing favicons for specific domains like ChatGPT and DeepSeek.

### Changed
- **Layout Scaling Standard**: Changed the default scale of all widgets in the customize layout system from `1` to `0.9` (down one step) to optimize default margins. Snapping widgets back to original sizes in `resetLayout` now snaps to `0.9`.
- **Shortcut Dialogue Placement**: Centered the add new shortcut dialog modal on the screen to prevent it from clipping at the bottom of the viewport.
- **Scrollable Preferences Dialog**: Refactored the Settings Panel to use `max-h-[85vh]` with an internal scrollable body, allowing users to scroll visibility controls cleanly without exceeding screen boundaries while keeping the header and footer static.
- **Zen Mode Search Engine dropdown direction**: Repositioned the search engine selector dropdown to open upwards (`bottom-full mb-2`) instead of downwards, preventing options from going off the screen edge in scaled Zen mode.
- **Custom Widget Slots on Minimal Theme**: Enabled custom widget slots (minitools layout slots) to render and edit inside the Minimal theme.

### Fixed
- **Browser search bar query crashes**: Added `chrome.runtime.id` guards to protect asynchronous tab media queries in `NewTab.tsx` from executing after context invalidation during search bar navigation, and cleanly unmounts intervals on `beforeunload`.
- **Google Ecosystem Dropdown Layering**: Configured the Google Ecosystem apps overlay list to have a higher z-index (`z-[100000]`) than the top-right control hub buttons, allowing it to render cleanly on top.
- **Action Bar clickability**: Added `pointer-events-auto` back to the control actions menu container to restore click events for Apps and AI toggles.
- **CSS optimization warning**: Placed the fonts `@import` statement before `@import "tailwindcss";` in `index.css` to comply with stylesheet specs and remove compiler CSS parsing warnings.
