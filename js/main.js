/* ============================================================
   WHY SMARTWATT? — real-time home energy intelligence
   anime.js  → stat counters, SVG line-drawing, mini-viz one-shots
   GSAP      → cutscene, pinned stats showcase, reveals, parallax
   three.js  → hero "energy core" 3D scene (theme-aware)
   Everything degrades gracefully: if a library fails to load,
   the page stays fully readable in its final state.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasAnime = typeof window.anime !== 'undefined';
  var hasThree = typeof window.THREE !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* pinned, scroll-driven mode (cutscene + stats showcase) */
  var PIN = hasST && !reduceMotion;
  if (PIN) document.documentElement.classList.add('pin');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function drawable(n) { return typeof n.getTotalLength === 'function'; }

  /* Run fn once, the first time el enters the viewport. */
  function onEnter(el, fn, ratio) {
    if (!el) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          io.disconnect();
          fn();
        }
      });
    }, { threshold: ratio == null ? 0.3 : ratio });
    io.observe(el);
  }

  /* Run fn every time el re-enters the viewport. */
  function onEveryEnter(el, fn, ratio) {
    if (!el) return;
    var was = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !was) fn();
        was = entry.isIntersecting;
      });
    }, { threshold: ratio == null ? 0.3 : ratio }).observe(el);
  }

  /* ---------------- theme toggle ---------------- */

  function initTheme(threeAPI) {
    var btn = $('#themeBtn');
    var meta = $('#metaTheme');

    function apply(light, persist) {
      document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
      if (btn) {
        btn.setAttribute('aria-pressed', String(light));
        btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
      }
      if (meta) meta.content = light ? '#f3f6fb' : '#060d1c';
      if (threeAPI) threeAPI.setTheme(light);
      if (persist) {
        try { localStorage.setItem('sw-theme', light ? 'light' : 'dark'); } catch (e) {}
      }
    }

    apply(document.documentElement.getAttribute('data-theme') === 'light', false);

    if (btn) {
      btn.addEventListener('click', function () {
        apply(document.documentElement.getAttribute('data-theme') !== 'light', true);
      });
    }
  }

  /* ---------------- loader + cutscene entrance ---------------- */

  function setupEntrance() {
    if (!hasGSAP || reduceMotion) return null;
    var bits = ['#csKicker', '.cs-h.is-first', '#csCue'];
    gsap.set(bits, { autoAlpha: 0, y: 26 });
    gsap.set('#nav', { autoAlpha: 0, y: -16 });
    return function play() {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to(bits, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.14 }, 0.1)
        .to('#nav', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.5);
    };
  }

  function initLoader(playEntrance) {
    var loader = $('#loader');
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      if (loader && hasGSAP && !reduceMotion) {
        gsap.to(loader, {
          yPercent: -100,
          duration: 0.85,
          ease: 'power4.inOut',
          delay: 0.4,
          onStart: function () { if (playEntrance) playEntrance(); },
          onComplete: function () { loader.style.display = 'none'; }
        });
      } else {
        if (loader) loader.classList.add('is-done');
        if (playEntrance) playEntrance();
      }
    }
    window.addEventListener('load', finish);
    setTimeout(finish, 3200); // safety net if a CDN stalls the load event
  }

  /* ---------------- scroll cutscene (animejs.com-style) ---------------- */

  function initCutscene() {
    if (!PIN) return; // static, fully-drawn illustration without GSAP

    var stage = $('#csStage');
    if (!stage) return;

    var hs = $$('.cs-h');
    var pipes = $$('.cs-pipes .cs-draw');
    var arrows = $$('.cs-arrows polyline');
    var fillRect = $('.cs-fill');
    var wave = $('.cs-wave');
    var drops = $$('.cs-drop');
    var roots = $$('.cs-roots .cs-draw');
    var plants = $$('.cs-plant');
    var plantStrokes = $$('.cs-plants .cs-draw');
    var lightDraws = $$('.cs-light .cs-draw');
    var rays = $$('.cs-rays line');
    var sparks = $$('.cs-sparks path');
    var cue = $('#csCue');

    /* initial states — strokes wound back, props parked */
    gsap.set($$('.cs-draw'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(arrows, { autoAlpha: 0 });
    if (fillRect) gsap.set(fillRect, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(drops, { autoAlpha: 0 });
    gsap.set(plants, { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 100%' });
    gsap.set(rays, { autoAlpha: 0 });
    gsap.set(sparks, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
    if (hs[1]) gsap.set(hs[1], { autoAlpha: 0, y: 46 });
    if (hs[2]) gsap.set(hs[2], { autoAlpha: 0, y: 46 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#intro',
        start: 'top top',
        end: '+=340%',
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    /* act i — the system wires itself up */
    tl.to(cue, { autoAlpha: 0, duration: 1 }, 0.3);
    tl.to(pipes, { strokeDashoffset: 0, duration: 6, stagger: 0.5, ease: 'power1.inOut' }, 1);
    if (fillRect) tl.to(fillRect, { scaleY: 1, duration: 2, ease: 'power2.out' }, 6.5);
    if (wave) tl.to(wave, { strokeDashoffset: 0, duration: 4 }, 7);
    tl.to(arrows, { autoAlpha: 1, duration: 1, stagger: 0.5 }, 8.5);

    /* electricity starts flowing down the bus */
    drops.forEach(function (d, i) {
      var at = 9 + i * 4;
      tl.to(d, { autoAlpha: 1, duration: 0.6 }, at);
      tl.to(d, { x: 470, duration: 7 }, at);
      tl.to(d, { autoAlpha: 0, duration: 0.6 }, at + 6.4);
    });

    /* act ii — appliances connect and power on */
    if (hs[0]) tl.to(hs[0], { autoAlpha: 0, y: -46, duration: 2, ease: 'power2.in' }, 11.5);
    if (hs[1]) tl.to(hs[1], { autoAlpha: 1, y: 0, duration: 2, ease: 'power2.out' }, 13);
    tl.to(roots, { strokeDashoffset: 0, duration: 3, stagger: 0.6 }, 14);
    tl.to(plants, { autoAlpha: 1, scale: 1, duration: 4, stagger: 2.5, ease: 'back.out(1.3)' }, 14);
    tl.to(plantStrokes, { strokeDashoffset: 0, duration: 4, stagger: 0.45, ease: 'power1.inOut' }, 14.5);

    /* act iii — the SmartWatt hub lights up */
    tl.to(lightDraws, { strokeDashoffset: 0, duration: 3, stagger: 0.5, ease: 'power1.inOut' }, 22);
    tl.to(rays, { autoAlpha: 1, duration: 1, stagger: 0.5 }, 25);
    tl.to(sparks, { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.7, ease: 'back.out(2)' }, 26.5);
    if (hs[1]) tl.to(hs[1], { autoAlpha: 0, y: -46, duration: 2, ease: 'power2.in' }, 27.5);
    if (hs[2]) tl.to(hs[2], { autoAlpha: 1, y: 0, duration: 2, ease: 'power2.out' }, 29.5);

    /* hold, then zoom through into the hero */
    tl.to({}, { duration: 6 });
    tl.to(stage, { scale: 1.45, autoAlpha: 0, duration: 7, ease: 'power2.in' }, 39);
  }

  /* ---------------- hero intro (plays when the hero arrives) ---------------- */

  function initHeroIntro() {
    if (!hasST || reduceMotion) return;
    gsap.set('.hero-title .line-inner', { yPercent: 112 });
    gsap.set('[data-intro]', { autoAlpha: 0, y: 24 });
    gsap.set('#bg3d', { autoAlpha: 0 });
    gsap.timeline({
      defaults: { ease: 'power4.out' },
      scrollTrigger: { trigger: '#hero', start: 'top 70%', once: true }
    })
      .to('#bg3d', { autoAlpha: 1, duration: 1.8, ease: 'power2.out' }, 0)
      .to('.hero-title .line-inner', { yPercent: 0, duration: 1.25, stagger: 0.14 }, 0.1)
      .to('[data-intro]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.5);
  }

  /* ---------------- nav + scroll progress ---------------- */

  function initChrome() {
    var nav = $('#nav');
    function onScroll() {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (hasST && !reduceMotion) {
      gsap.to('#progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
      });
    }
  }

  /* ---------------- marquees ---------------- */

  function initMarquees() {
    if (reduceMotion) return; // CSS leaves the text static under reduced motion

    var SPEED = 150; // px per second — same feel on every screen width

    function build(track) {
      var unit = track._mqUnit;
      if (unit == null) {
        var first = track.querySelector('.marquee-group');
        unit = track._mqUnit = first ? first.innerHTML : track.innerHTML;
      }

      track.style.animation = 'none';
      track.innerHTML = '<div class="marquee-group">' + unit + '</div>';
      var unitW = track.firstElementChild.getBoundingClientRect().width;
      if (!unitW) { track.style.animation = ''; return; }

      /* a "set" repeats the group until it comfortably overflows the viewport,
         so the seam never leaves a visible gap; two identical sets make the
         loop seamless when we shift by exactly one set's width */
      var perSet = Math.max(1, Math.ceil((window.innerWidth * 1.25) / unitW));
      var group = '<div class="marquee-group" aria-hidden="true">' + unit + '</div>';
      var set = '';
      for (var i = 0; i < perSet; i++) set += group;
      track.innerHTML = set + set;

      /* drive the animation with an exact PIXEL shift (one set width), not a
         percentage — percentage transforms can fall to the main thread */
      var half = Math.round(track.scrollWidth / 2);
      track.style.setProperty('--mq-shift', '-' + half + 'px');
      track.style.setProperty('--mq-dur', (half / SPEED).toFixed(2) + 's');

      void track.offsetWidth;
      track.style.animation = '';
    }

    var tracks = $$('.marquee-track');
    tracks.forEach(build);

    var lastW = window.innerWidth;
    var rt;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(rt);
      rt = setTimeout(function () { tracks.forEach(build); }, 250);
    });
  }

  /* ---------------- scroll fade-in reveals ---------------- */

  function initReveals() {
    if (!hasST || reduceMotion) return;
    $$('[data-reveal]').forEach(function (el) {
      var dir = el.getAttribute('data-reveal');
      var from = { autoAlpha: 0, y: 56, x: 0 };
      if (dir === 'left') { from.x = -70; from.y = 0; }
      if (dir === 'right') { from.x = 70; from.y = 0; }
      gsap.from(el, {
        autoAlpha: from.autoAlpha, x: from.x, y: from.y,
        duration: 1.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
    });
  }

  /* ---------------- sideways-moving text (GSAP scrub) ---------------- */

  function initDrift() {
    if (!hasST || reduceMotion) return;

    $$('.ghost[data-drift]').forEach(function (el) {
      var dir = parseFloat(el.getAttribute('data-drift')) || 1;
      gsap.fromTo(el, { xPercent: 12 * dir }, {
        xPercent: -12 * dir,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    });
  }

  function initHeroParallax() {
    if (!hasST || reduceMotion) return;
    gsap.to('.hero-inner', {
      yPercent: 16, autoAlpha: 0.2, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('#bg3d', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* ---------------- stats showcase ----------------
     Pinned: each stat fills the screen, the counter counts up and LANDS on its
     target, the finished number is held (a pause), then the reel slides a full
     slide to the next stat. Grid replays on every return. */

  function playGridStats() {
    if (!hasAnime || reduceMotion) return;
    var grid = $('#statsGrid');
    if (!grid) return;

    $$('.num', grid).forEach(function (el, i) {
      anime.remove(el);
      var from = parseFloat(el.dataset.from || '0');
      var to = parseFloat(el.dataset.to || '0');
      var state = { v: from };
      el.textContent = String(from);
      anime({
        targets: state,
        v: to,
        duration: 1900,
        delay: 150 + i * 140,
        easing: 'easeOutExpo',
        update: function () { el.textContent = String(Math.round(state.v)); }
      });
    });

    var segs = $$('.stat-icon svg *', grid).filter(drawable);
    segs.forEach(function (s) {
      anime.remove(s);
      s.style.strokeDashoffset = anime.setDashoffset(s);
    });
    anime({
      targets: segs,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1300,
      delay: anime.stagger(70),
      easing: 'easeInOutSine'
    });

    $$('.meter-fill', grid).forEach(function (m, i) {
      anime.remove(m);
      m.style.width = '0%';
      anime({
        targets: m,
        width: (parseFloat(m.dataset.meter) || 0) + '%',
        duration: 1500,
        delay: 350 + i * 150,
        easing: 'easeInOutQuart'
      });
    });
  }

  function initStatsShowcase() {
    var grid = $('#statsGrid');

    if (hasAnime && !reduceMotion && grid) {
      onEveryEnter(grid, playGridStats, 0.35);
    }

    /* cursor spotlight + 3D tilt on the cards */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
      $$('.stat-card').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (px * 100) + '%');
          card.style.setProperty('--my', (py * 100) + '%');
          card.style.transform =
            'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg)' +
            ' rotateY(' + ((px - 0.5) * 7).toFixed(2) + 'deg) translateY(-6px)';
        });
        card.addEventListener('pointerleave', function () { card.style.transform = ''; });
      });
    }

    if (!PIN) return;

    var stage = $('#statsStage');
    var track = $('#statsTrack');
    var wrap = $('#statsGridWrap');
    var slides = $$('.stat-slide');
    var dots = $$('.stage-dot');
    var dotsWrap = $('#stageDots');
    if (!stage || !track || !wrap || !slides.length) return;

    var SL = 12; // scrub-units per slide
    var n = slides.length;
    var TOTAL = 0;

    gsap.set(wrap, { autoAlpha: 0, scale: 1.45 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=480%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          if (!dots.length || !TOTAL) return;
          var t = self.progress * TOTAL;
          var idx = Math.min(Math.floor(t / SL), n - 1);
          dots.forEach(function (d, i) {
            d.classList.toggle('is-active', i === idx && t < n * SL);
          });
        }
      }
    });

    slides.forEach(function (slide, i) {
      var inner = $('.slide-inner', slide);
      var num = $('.num', slide);
      var start = i * SL;

      /* 1 — the stat scrolls in from the left and zooms to full as it lands */
      if (inner) {
        tl.fromTo(inner,
          { xPercent: -6, scale: 0.92 },
          { xPercent: 0, scale: 1, duration: 4.5, ease: 'power2.out' },
          start);
      }

      /* 2 — the counter runs and LANDS on its target value */
      if (num) {
        var from = parseFloat(num.dataset.from || '0');
        var to = parseFloat(num.dataset.to || '0');
        num.textContent = String(from);
        var proxy = { v: from };
        tl.fromTo(proxy, { v: from }, {
          v: to,
          duration: 4,
          ease: 'none',
          onUpdate: function () { num.textContent = String(Math.round(proxy.v)); }
        }, start + 0.5);
      }

      /* 3 — PAUSE (~4.5 → 8.5): the finished number is held still.
         4 — then the reel slides one full slide to the next stat. */
      if (i < n - 1) {
        tl.to(track, {
          xPercent: -100 * (i + 1),
          duration: 3.5,
          ease: 'power2.inOut'
        }, start + 8.5);
      }
    });

    /* zoom out: the reel shrinks away and the full grid lands */
    var zoomAt = (n - 1) * SL + 8.5;
    tl.to(track, {
      scale: 0.55,
      autoAlpha: 0,
      duration: 6,
      ease: 'power2.inOut',
      transformOrigin: ((n - 0.5) * 100) + '% 50%'
    }, zoomAt);
    if (dotsWrap) tl.to(dotsWrap, { autoAlpha: 0, duration: 2 }, zoomAt);
    tl.fromTo(wrap,
      { autoAlpha: 0, scale: 1.45 },
      { autoAlpha: 1, scale: 1, duration: 6, ease: 'power3.out' },
      zoomAt + 2);
    tl.fromTo($$('.stat-card', grid),
      { y: 44, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 3.5, stagger: 0.5, ease: 'power2.out' },
      zoomAt + 3);
    tl.call(playGridStats, null, zoomAt + 4.5);
    tl.to({}, { duration: 8 });

    TOTAL = tl.duration();
  }

  /* ---------------- benefit mini-infographics ---------------- */

  /* 01 — live circuit loads fill in (and re-fill on every return) */
  function initVizSee() {
    var root = $('#vizSee');
    if (!root || !hasAnime || reduceMotion) return;
    var fills = $$('.circuit-fill', root);
    function play() {
      fills.forEach(function (f) { anime.remove(f); f.style.width = '0%'; });
      anime({
        targets: fills,
        width: function (el) { return (parseFloat(el.dataset.load) || 0) + '%'; },
        duration: 1300,
        delay: anime.stagger(110),
        easing: 'easeOutElastic(1, 0.7)'
      });
    }
    onEveryEnter(root, play);
  }

  /* 02 — usage line draws on, then the anomaly + alert pop */
  function initVizCatch() {
    var root = $('#vizCatch');
    if (!root || !hasAnime || reduceMotion) return;
    var line = $('.chart-line', root);
    var dot = $('.chart-alert', root);
    var chip = $('#alertChip');
    function play() {
      if (line) { anime.remove(line); line.style.strokeDashoffset = anime.setDashoffset(line); }
      if (dot) { anime.remove(dot); dot.style.transform = 'scale(0)'; dot.style.transformOrigin = 'center'; }
      if (chip) { anime.remove(chip); chip.style.opacity = '0'; }
      anime({
        targets: line,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1700,
        easing: 'easeInOutSine',
        complete: function () {
          if (dot) anime({ targets: dot, scale: [0, 1], duration: 500, easing: 'easeOutBack' });
          if (chip) anime({ targets: chip, opacity: [0, 1], translateY: [-8, 0], duration: 500, easing: 'easeOutCubic' });
        }
      });
    }
    onEveryEnter(root, play);
  }

  /* 03 — the bill bars race down; "before" stays full, "with" lands lower */
  function initVizCut() {
    var root = $('#vizCut');
    if (!root || !hasAnime || reduceMotion) return;
    var before = $('.bill-fill.before', root);
    var after = $('.bill-fill.after', root);
    var chip = $('#saveChip');
    function play() {
      [before, after].forEach(function (b) { if (b) { anime.remove(b); b.style.width = '0%'; } });
      if (chip) { anime.remove(chip); chip.style.opacity = '0'; }
      if (before) anime({ targets: before, width: (parseFloat(before.dataset.w) || 100) + '%', duration: 1100, easing: 'easeOutQuart' });
      if (after) anime({
        targets: after,
        width: (parseFloat(after.dataset.w) || 70) + '%',
        duration: 1500,
        delay: 350,
        easing: 'easeOutQuart',
        complete: function () {
          if (chip) anime({ targets: chip, opacity: [0, 1], scale: [0.4, 1], rotate: 4, duration: 650, easing: 'easeOutBack' });
        }
      });
    }
    onEveryEnter(root, play);
  }

  /* 04 — the 24-hour ring sweeps and the number counts up */
  function initVizClock() {
    var root = $('#vizClock');
    if (!root || !hasAnime || reduceMotion) return;
    var sweep = $('.ring-sweep', root);
    var num = $('#ringNum');
    function play() {
      if (sweep) { anime.remove(sweep); sweep.style.strokeDashoffset = '100'; }
      if (num) num.textContent = num.dataset.from || '0';
      if (sweep) anime({ targets: sweep, strokeDashoffset: [100, 0], duration: 2200, easing: 'easeInOutQuart' });
      if (num) {
        var state = { v: parseFloat(num.dataset.from || '0') };
        anime({
          targets: state,
          v: parseFloat(num.dataset.to || '24'),
          duration: 2200,
          easing: 'easeInOutQuart',
          update: function () { num.textContent = String(Math.round(state.v)); }
        });
      }
    }
    onEveryEnter(root, play);
  }

  /* ---------------- CTA button ---------------- */

  function initCTA() {
    var btn = $('#ctaBtn');
    if (!btn || reduceMotion) return;

    if (hasAnime) {
      anime({
        targets: '.btn-cta .pulse',
        scale: [1, 1.55],
        opacity: [0.55, 0],
        duration: 1900,
        easing: 'easeOutCubic',
        loop: true
      });
    }

    var strength = 26;
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      var y = ((e.clientY - r.top) / r.height - 0.5) * strength;
      btn.style.transition = 'box-shadow 0.3s ease';
      btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.7, 0.3, 1.4), box-shadow 0.3s ease';
      btn.style.transform = 'translate(0, 0)';
    });
  }

  /* ---------------- three.js hero scene (energy core) ---------------- */

  var GLSL_NOISE = [
    'vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}',
    'vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}',
    'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
    'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}',
    'float snoise(vec3 v){',
    '  const vec2 C = vec2(1.0/6.0, 1.0/3.0);',
    '  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',
    '  vec3 i = floor(v + dot(v, C.yyy));',
    '  vec3 x0 = v - i + dot(i, C.xxx);',
    '  vec3 g = step(x0.yzx, x0.xyz);',
    '  vec3 l = 1.0 - g;',
    '  vec3 i1 = min(g.xyz, l.zxy);',
    '  vec3 i2 = max(g.xyz, l.zxy);',
    '  vec3 x1 = x0 - i1 + C.xxx;',
    '  vec3 x2 = x0 - i2 + C.yyy;',
    '  vec3 x3 = x0 - D.yyy;',
    '  i = mod289(i);',
    '  vec4 p = permute(permute(permute(',
    '        i.z + vec4(0.0, i1.z, i2.z, 1.0))',
    '      + i.y + vec4(0.0, i1.y, i2.y, 1.0))',
    '      + i.x + vec4(0.0, i1.x, i2.x, 1.0));',
    '  float n_ = 0.142857142857;',
    '  vec3 ns = n_ * D.wyz - D.xzx;',
    '  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);',
    '  vec4 x_ = floor(j * ns.z);',
    '  vec4 y_ = floor(j - 7.0 * x_);',
    '  vec4 x = x_ * ns.x + ns.yyyy;',
    '  vec4 y = y_ * ns.x + ns.yyyy;',
    '  vec4 h = 1.0 - abs(x) - abs(y);',
    '  vec4 b0 = vec4(x.xy, y.xy);',
    '  vec4 b1 = vec4(x.zw, y.zw);',
    '  vec4 s0 = floor(b0)*2.0 + 1.0;',
    '  vec4 s1 = floor(b1)*2.0 + 1.0;',
    '  vec4 sh = -step(h, vec4(0.0));',
    '  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;',
    '  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;',
    '  vec3 p0 = vec3(a0.xy, h.x);',
    '  vec3 p1 = vec3(a0.zw, h.y);',
    '  vec3 p2 = vec3(a1.xy, h.z);',
    '  vec3 p3 = vec3(a1.zw, h.w);',
    '  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));',
    '  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;',
    '  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
    '  m = m * m;',
    '  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));',
    '}'
  ].join('\n');

  var BLOB_VERT = GLSL_NOISE + '\n' + [
    'uniform float uTime;',
    'uniform float uAmp;',
    'uniform float uFreq;',
    'varying float vDisp;',
    'varying vec3 vNormal;',
    'varying vec3 vView;',
    'void main(){',
    '  float t = uTime * 0.22;',
    '  float n1 = snoise(position * uFreq * 0.6 + vec3(t, t * 0.8, -t));',
    '  float n2 = snoise(position * uFreq * 1.7 + vec3(-t * 1.3, t, t * 0.6)) * 0.35;',
    '  float d = n1 + n2;',
    '  vDisp = d;',
    '  vec3 displaced = position + normal * d * uAmp;',
    '  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);',
    '  vNormal = normalize(normalMatrix * normal);',
    '  vView = normalize(-mv.xyz);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var BLOB_FRAG = [
    'uniform vec3 uDeep;',
    'uniform vec3 uLeaf;',
    'uniform vec3 uMint;',
    'uniform vec3 uWater;',
    'varying float vDisp;',
    'varying vec3 vNormal;',
    'varying vec3 vView;',
    'void main(){',
    '  vec3 N = normalize(vNormal);',
    '  vec3 V = normalize(vView);',
    '  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.1);',
    '  float band = smoothstep(-0.9, 1.1, vDisp);',
    '  vec3 base = mix(uDeep, uLeaf * 0.85, band * 0.85);',
    '  vec3 rim = mix(uLeaf, uWater, clamp(vDisp * 0.5 + 0.5, 0.0, 1.0));',
    '  vec3 col = base + rim * fres * 1.05;',
    '  col += uMint * pow(band, 3.0) * 0.18;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var THEME_3D = {
    dark: {
      deep: '#0a2540', leaf: '#2dd4bf', mint: '#22d3ee', water: '#38bdf8',
      ring1: '#2dd4bf', ring1o: 0.4, ring2: '#fbbf24', ring2o: 0.32,
      pColor: '#fbbf24', pOpacity: 0.9, additive: true
    },
    light: {
      deep: '#0284c7', leaf: '#0d9488', mint: '#0891b2', water: '#0ea5e9',
      ring1: '#0d9488', ring1o: 0.42, ring2: '#d97706', ring2o: 0.3,
      pColor: '#0d9488', pOpacity: 0.42, additive: false
    }
  };

  function initThree() {
    var canvas = document.getElementById('bg3d');
    if (!canvas || !hasThree) return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) {
      return null;
    }
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
    camera.position.z = 6.4;

    var blobMat = new THREE.ShaderMaterial({
      vertexShader: BLOB_VERT,
      fragmentShader: BLOB_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.46 },
        uFreq: { value: 1.2 },
        uDeep: { value: new THREE.Color(THEME_3D.dark.deep) },
        uLeaf: { value: new THREE.Color(THEME_3D.dark.leaf) },
        uMint: { value: new THREE.Color(THEME_3D.dark.mint) },
        uWater: { value: new THREE.Color(THEME_3D.dark.water) }
      }
    });
    var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 48), blobMat);

    var blobGroup = new THREE.Group();
    blobGroup.add(blob);

    var ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.012, 12, 220),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(THEME_3D.dark.ring1), transparent: true, opacity: THEME_3D.dark.ring1o })
    );
    ring1.rotation.set(Math.PI * 0.46, 0.4, 0);
    var ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.78, 0.009, 12, 220),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(THEME_3D.dark.ring2), transparent: true, opacity: THEME_3D.dark.ring2o })
    );
    ring2.rotation.set(Math.PI * 0.38, -0.55, 0);
    blobGroup.add(ring1, ring2);
    scene.add(blobGroup);

    /* drifting energy-spark particles */
    var COUNT = 380;
    var positions = new Float32Array(COUNT * 3);
    var shades = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      var r = 2.6 + Math.random() * 5.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 1.5;
      var dim = 0.35 + Math.random() * 0.65;
      shades[i * 3] = dim; shades[i * 3 + 1] = dim; shades[i * 3 + 2] = dim;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(shades, 3));
    var pMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: THEME_3D.dark.pOpacity,
      color: new THREE.Color(THEME_3D.dark.pColor),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    var baseY = 0;
    function resize() {
      var w = canvas.clientWidth || 1;
      var h = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      var wide = w > 880;
      blobGroup.position.x = wide ? 1.55 : 0;
      baseY = wide ? 0.05 : 1.55;
      var s = wide ? 1 : 0.55;
      blobGroup.scale.set(s, s, s);
    }
    resize();
    window.addEventListener('resize', resize);

    var visible = true;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible = entry.isIntersecting; });
    }).observe(canvas);

    var clock = new THREE.Clock();

    function setTheme(light) {
      var p = light ? THEME_3D.light : THEME_3D.dark;
      blobMat.uniforms.uDeep.value.set(p.deep);
      blobMat.uniforms.uLeaf.value.set(p.leaf);
      blobMat.uniforms.uMint.value.set(p.mint);
      blobMat.uniforms.uWater.value.set(p.water);
      ring1.material.color.set(p.ring1);
      ring1.material.opacity = p.ring1o;
      ring2.material.color.set(p.ring2);
      ring2.material.opacity = p.ring2o;
      pMat.color.set(p.pColor);
      pMat.opacity = p.pOpacity;
      pMat.blending = p.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      pMat.needsUpdate = true;
      if (reduceMotion) renderer.render(scene, camera);
    }

    if (reduceMotion) {
      blobMat.uniforms.uTime.value = 4;
      renderer.render(scene, camera);
      return { setTheme: setTheme };
    }

    (function tick() {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      var t = clock.getElapsedTime();
      blobMat.uniforms.uTime.value = t;
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      blobGroup.rotation.y = t * 0.14 + cx * 0.55;
      blobGroup.rotation.x = Math.sin(t * 0.18) * 0.08 + cy * 0.4;
      blobGroup.position.y = baseY + Math.sin(t * 0.7) * 0.07;
      ring1.rotation.z = t * 0.18;
      ring2.rotation.z = -t * 0.13;
      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.1) * 0.04;
      renderer.render(scene, camera);
    })();

    return { setTheme: setTheme };
  }

  /* ---------------- boot ---------------- */

  var threeAPI = initThree();
  initTheme(threeAPI);
  initChrome();
  initMarquees();
  initCutscene();
  initHeroIntro();
  initHeroParallax();
  initReveals();
  initDrift();
  initStatsShowcase();
  initVizSee();
  initVizCatch();
  initVizCut();
  initVizClock();
  initCTA();
  initLoader(setupEntrance());
})();
