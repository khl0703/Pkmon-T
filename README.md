# Pkmon-T
Fanmade pokemon game

## Architecture

This project now uses a small plain HTML/CSS/JavaScript module structure instead of putting everything in one `index.html`.

### File layout

- `index.html`: minimal app entry point
- `style.css`: page and canvas styling
- `js/main.js`: bootstraps input, settings, scenes, and the main loop
- `js/core/`: shared engine-style helpers such as constants, state, input, storage, renderer, and small utilities
- `js/data/`: human-editable game data such as i18n text, maps, items, and Pokemon data
- `js/systems/`: gameplay logic for dialog, field movement, battles, menus, and save/load

### Dependency map

- `js/main.js` imports from `js/core/`, `js/data/i18n.js`, and `js/systems/`
- `js/systems/` imports shared state and helpers from `js/core/`
- `js/systems/fieldSystem.js` imports map data and can trigger dialogs or battles
- `js/systems/battleSystem.js` imports Pokemon and move data
- `js/systems/saveSystem.js` reads and writes localStorage through `js/core/storage.js`
- `js/core/renderer.js` is the shared canvas drawing layer used by the systems and main loop

### Running locally

Because the game now uses ES modules, run it from a basic local server instead of opening the HTML file directly.

Examples:

- `python3 -m http.server`
- `npx serve .`

Then open `http://localhost:8000` or the URL shown by your local server.
