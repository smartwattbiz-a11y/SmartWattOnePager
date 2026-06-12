# 💧 "Why Hydroponics?" — Animated Infographic

A one-page scrolling infographic that sells the benefits of hydroponics, ending in a
**Join Farmspherica** call-to-action. Built with **HTML + CSS + JS only** (no frameworks).

## Run it

Just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

(Internet access is needed for the Google Fonts + CDN libraries.)

## What's inside

| Feature | How |
| --- | --- |
| Scroll-driven opening cutscene (animejs.com-style): a hand-drawn hydroponic system SVG assembles itself — pipes draw, water circulates, plants grow, lights come on | **GSAP ScrollTrigger** pinned + scrubbed timeline over `pathLength`-normalized strokes |
| Light/dark theme toggle (top-right): dark = deep forest original, light = white with green + green-gradient highlights only | CSS custom-property themes + `localStorage`, three.js uniforms retinted live |
| Pinned stats showcase: each stat zoomed-in full screen, text scrubbing left → right with scroll-tied counters, then a zoom-out reveals the full 4-card grid | **GSAP** pin + scrub timeline |
| Stat cards: gradient borders, conic icon shimmer, cursor spotlight, 3D tilt, animated meters | CSS `color-mix` + vanilla JS pointer handlers |
| Stat animations replay every time the grid scrolls back into frame | re-arming IntersectionObserver + **anime.js** |
| Smooth fade-in sections on scroll | **GSAP + ScrollTrigger** |
| Sideways-moving text (marquees + giant ghost words that drift on scroll) | CSS keyframes + **GSAP** scrub |
| 3D "living droplet" with orbit rings + spore particles in the hero | **three.js** (custom simplex-noise shader) |
| Mini-infographics: water tubes, harvest race, shield draw, 365-day ring | anime.js one-shots via IntersectionObserver |
| Loader curtain, scroll progress bar, magnetic CTA button | GSAP / anime.js / vanilla JS |

## Design notes

- Color scheme lifted from the Farmspherica brand at [aavrt.com](https://www.aavrt.com/):
  forest `#2E7D32` · leaf `#AED581` · mint `#D0F0C0` · water `#81D4FA`, on a deep
  forest-black canvas with subtle green gradient glows.
- Typography: **Montserrat** (800/900, uppercase, tight) for display, **Inter** for body.
- Everything degrades gracefully: with JS (or any CDN) unavailable, the page renders
  fully readable in its final state, and `prefers-reduced-motion` is respected.

```
index.html        markup (hero, marquees, stats, 4 benefit sections, CTA)
css/styles.css    all styling, responsive + reduced-motion rules
js/main.js        three.js scene, anime.js counters/viz, GSAP scroll work
```
