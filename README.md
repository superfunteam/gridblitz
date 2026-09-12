# Grid Blitz

A mobile-first, touch-friendly 3×3 word-and-number game. No build or installation required.

## Play locally

Run `npm run dev`, then open http://localhost:5173. The static app is in `dist/`.

## Rules

- Each tile's letter and number move together.
- Make eight three-letter words: three across (left to right), three down (top to bottom), and two diagonals (starting at the top corners).
- Each row and column must contain 1, 2, and 3 exactly once. Diagonal numbers do not need to be distinct.
- The lime center tile stays fixed.
- Tap a tile then a square, or select a square first. Tap a placed tile to move it; tap it again to remove it. Desktop dragging is also supported.
- Word watch gives line clues; three hints per round place a correct tile.

Twelve authored letter layouts repeat with six number permutations (72 variations). A curated dictionary validates alternative solutions. Progress saves to this browser's local storage. Nothing is sent to a server.

## Keyboard

Tab / Enter select tiles and squares. Arrow keys navigate board squares. Type a letter to select an available tile. Backspace / Delete returns a focused board tile to the rack. Escape clears the selection.

## Validation

`npm test` checks all 72 solutions, tile swapping and replacement, equivalent tile handling, number/word failures, hint convergence, and saved-game validation. `npm run check` checks JavaScript syntax.

The app uses plain HTML, CSS, and JavaScript, a self-hosted Inter variable font, and optional feature-detected WebMCP actions. It works without WebMCP. The timer pauses while the page is hidden or a dialog is open.

## Font

Inter by Rasmus Andersson, distributed under the SIL Open Font License. See `dist/fonts/OFL.txt`.

## Production and sharing

- Play: https://gridblitz.superfun.games/
- Repository: https://github.com/superfunteam/gridblitz
- Netlify publishes `dist/` from `main`, using the settings in `netlify.toml`.
- `npm ci` installs development dependencies; the game itself has no runtime dependencies.
- `npm run build` validates JavaScript, metadata, manifests, and image dimensions.
- `npm run assets` recreates app/touch icons, multi-size favicon.ico, and the 1200×630 social image from `assets/`.
- `netlify deploy --prod --dir=dist` publishes via the linked CLI project.

Open Graph and Twitter cards use `dist/og-image.png`. The app includes SVG/PNG/ICO favicons, an Apple touch icon, standard and maskable web-app icons, a pinned-tab icon, theme colors, canonical metadata, robots.txt, and sitemap.xml. Home-screen launches use standalone display; offline caching is not implemented.
