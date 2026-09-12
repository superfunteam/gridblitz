# Grid Blitz

A mobile-first, touch-friendly 3×3 word-and-number game. No build or installation required.

## Play locally

Run `npm run dev`, then open http://localhost:5173. The static app is in `dist/`.

## Rules

- Each tile's letter and number move together.
- Make eight three-letter words: three across (left to right), three down (top to bottom), and two diagonals (starting at the top corners).
- Each row and column must contain 1, 2, and 3 exactly once. Diagonal numbers do not need to be distinct.
- Drag tiles from the rack onto the grid. Drop a board tile onto another to swap them; drop it in the rack to return it. Rack tiles can also be reordered. Desktop uses native HTML drag/drop; touch and pen use native Pointer Events with a floating preview, drop targets, and edge scrolling.
- Tap a tile then a square, or select a square first. Tap a placed tile to move it; tap it again to remove it.
- The green center tile stays fixed. Each of the three hints per puzzle places a random correct tile and locks it green. Green tiles survive undo and reload; starting the puzzle over resets hints and locks.
- Word watch gives line clues.

Twelve authored letter layouts repeat with six number permutations (72 variations). A curated dictionary validates alternative solutions. Progress saves to this browser's local storage. Nothing is sent to a server.

## Keyboard

Tab / Enter select tiles and squares. Arrow keys navigate board squares. Type a letter to select an available tile. Backspace / Delete returns a focused, unlocked board tile to the rack. Escape clears the selection or cancels a drag.

## Validation

`npm test` checks all 72 solutions, tile swapping and replacement, equivalent tile handling, number/word failures, random hint placement, permanent hint locks through undo and saved-game migration, and DOM-level mouse/touch/pen drag events, cancellation, and edge scrolling. `npm run check` checks JavaScript syntax. The production build runs both before validating metadata and assets.

The app uses plain HTML, CSS, and JavaScript, a self-hosted Inter variable font, and optional feature-detected WebMCP actions. It works without WebMCP. The timer pauses while the page is hidden or a dialog is open.

## Font

Inter by Rasmus Andersson, distributed under the SIL Open Font License. See `dist/fonts/OFL.txt`.

## Production and sharing

- Play: https://gridblitz.superfun.games/
- Repository: https://github.com/superfunteam/gridblitz
- Netlify publishes `dist/` from `main`, using the settings in `netlify.toml`.
- `npm ci` installs development dependencies; the game itself has no runtime dependencies.
- `npm run build` runs tests and validates JavaScript, metadata, manifests, and image dimensions.
- `npm run assets` recreates app/touch icons, multi-size favicon.ico, and the 1200×630 social image from `assets/`.
- `netlify deploy --prod --dir=dist` publishes via the linked CLI project.

Open Graph and Twitter cards use `dist/og-image.png`. The app includes SVG/PNG/ICO favicons, an Apple touch icon, standard and maskable web-app icons, a pinned-tab icon, theme colors, canonical metadata, robots.txt, and sitemap.xml. Home-screen launches use standalone display; offline caching is not implemented.
