# ⚡ "Why SmartWatt?" — Animated Infographic

A one-page scrolling infographic that sells real-time home energy monitoring,
ending in a **Connect your meter** call-to-action. Built with **HTML + CSS + JS
only** (no frameworks), themed around the [SmartWatt dashboard](https://smartwatt-dashboard.vercel.app/circuit-map).

## Run it

Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

(Internet access is needed for the Google Fonts + CDN libraries.)

## What's inside

| Feature | How |
| --- | --- |
| Scroll-driven opening cutscene: a hand-drawn home energy system wires itself up — bus + breaker panel draw on, the meter lights up, electrons flow the line, appliances power on, the SmartWatt hub switches on | **GSAP ScrollTrigger** pinned + scrubbed timeline over `pathLength`-normalised strokes |
| Light/dark theme toggle (top-right): light = clean white slate, dark = electric dashboard | CSS custom-property themes + `localStorage`, three.js uniforms retinted live |
| Pinned stats showcase: each stat fills the screen, the counter **lands on its value and holds**, then the reel slides to the next | **GSAP** pin + scrub timeline |
| 4 stats: **30%** lower bills · **3×** faster to catch waste · **0** blind spots · **24/7** live monitoring | **anime.js** count-ups + drawn icons + meters, replay on every return |
| 3D "energy core" with orbit rings + spark particles in the hero | **three.js** (custom simplex-noise plasma shader) |
| Mini-infographics: live circuit loads, a usage chart that flags a spike, a before/after bill cut, a 24-hour ring | anime.js one-shots via IntersectionObserver |
| Sideways marquees, loader, scroll progress bar, magnetic CTA | CSS + GSAP + anime.js |

## Design notes

- Palette pulled from the SmartWatt dashboard: amber `#fbbf24` (watt / energy),
  teal `#2dd4bf`, sky `#38bdf8`, emerald `#34d399`, on a deep slate canvas.
  Signature gradient runs warm → cool (amber → teal → sky): energy into smart tech.
- Typography: **Plus Jakarta Sans** (the dashboard's own typeface).
- Light mode is the default; dark mode is one tap away and remembered.
- Everything degrades gracefully without JS/CDNs and respects `prefers-reduced-motion`.
- Fluid type is sized so the longest words never overflow, from ~320px phones up.

```
index.html        markup (cutscene, hero, stats, 4 benefit sections, CTA)
css/styles.css    all styling, theming, responsive + reduced-motion rules
js/main.js        three.js core, anime.js counters/viz, GSAP scroll work
```
