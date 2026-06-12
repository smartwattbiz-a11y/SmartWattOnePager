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
| 4 big count-up stat counters (90% less water, 3× faster, 0 pesticides, 365 days) | **anime.js** — number tween + SVG icon stroke draw-in |
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
