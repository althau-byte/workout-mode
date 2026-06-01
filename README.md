# Workout Mode UI

Mobile‑first workout runner for your wellbeing agent.

## URL

Deployed via GitHub Pages at:

`https://althau-byte.github.io/workout-mode/index.html`

The bot should open:

`https://althau-byte.github.io/workout-mode/index.html?data=<encoded JSON>`

Where `<encoded JSON>` is `encodeURIComponent(JSON.stringify({ workout }))`.

## Files

- `index.html` — layout and structure
- `style.css` — dark, mobile‑first styling
- `workout.js` — timer engine, auto‑advance, completion callback
- `telegram.js` — Telegram WebApp wrapper
- `assets/` — sounds/icons (optional)

## Local testing

```bash
cd workout-mode
python3 -m http.server 8000
