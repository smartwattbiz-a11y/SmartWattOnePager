/* ============================================================
   WHY HYDROPONICS? — Farmspherica Innovations
   anime.js  → stat counters, SVG line-drawing, mini-viz one-shots
   GSAP      → intro, scroll reveals, sideways ghost text, parallax
   three.js  → hero "living droplet" 3D scene
   Everything degrades gracefully: if a library fails to load,
   the page stays fully readable in its final state.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasAnime = typeof window.anime !== 'undefined';
  var hasThree = typeof window.THREE !== 'undefined';

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

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

  /* ---------------- loader + intro ---------------- */

  function setupIntro() {
    if (!hasGSAP || reduceMotion) return null;
    gsap.set('.hero-title .line-inner', { yPercent: 112 });
    gsap.set('[data-intro]', { autoAlpha: 0, y: 24 });
    gsap.set('#nav', { autoAlpha: 0, y: -16 });
    gsap.set('#bg3d', { autoAlpha: 0 });
    return function playIntro() {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to('#bg3d', { autoAlpha: 1, duration: 1.8, ease: 'power2.out' }, 0)
        .to('.hero-title .line-inner', { yPercent: 0, duration: 1.25, stagger: 0.14 }, 0.15)
        .to('[data-intro]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.6)
        .to('#nav', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.85);
    };
  }

  function initLoader(playIntro) {
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
          onStart: function () { if (playIntro) playIntro(); },
          onComplete: function () { loader.style.display = 'none'; }
        });
      } else {
        if (loader) loader.classList.add('is-done');
        if (playIntro) playIntro();
      }
    }
    window.addEventListener('load', finish);
    setTimeout(finish, 3200); // safety net if a CDN stalls the load event
  }

  /* ---------------- nav + scroll progress ---------------- */

  function initChrome() {
    var nav = $('#nav');
    function onScroll() {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (hasGSAP && !reduceMotion) {
      gsap.to('#progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
      });
    }
  }

  /* ---------------- scroll fade-in reveals ---------------- */

  function initReveals() {
    if (!hasGSAP || reduceMotion) return;
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

    /* stat cards rise in as a staggered group */
    var cards = $$('.stat-card');
    if (cards.length) {
      gsap.from(cards, {
        autoAlpha: 0, y: 70,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#statsGrid', start: 'top 80%', once: true }
      });
    }
  }

  /* ---------------- marquees ---------------- */

  function initMarquees() {
    $$('.marquee-track').forEach(function (track) {
      /* duplicate the groups so ultrawide screens never see a gap */
      $$('.marquee-group', track).forEach(function (g) {
        var clone = g.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      /* normalize speed: same px/s regardless of track width */
      var half = track.scrollWidth / 2;
      if (half > 0) track.style.animationDuration = Math.max(18, half / 95) + 's';
    });
  }

  /* ---------------- sideways-moving text (GSAP scrub) ---------------- */

  function initDrift() {
    if (!hasGSAP || reduceMotion) return;

    $$('.ghost[data-drift]').forEach(function (el) {
      var dir = parseFloat(el.getAttribute('data-drift')) || 1;
      gsap.fromTo(el, { xPercent: 12 * dir }, {
        xPercent: -12 * dir,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    });

    /* marquee lanes get an extra scroll-linked shift for depth
       (always toward negative x so the track's left edge never gaps) */
    $$('.marquee').forEach(function (mq) {
      var lane = $('.marquee-lane', mq);
      if (!lane) return;
      gsap.fromTo(lane, { x: 0 }, {
        x: -130,
        ease: 'none',
        scrollTrigger: { trigger: mq, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });
  }

  function initHeroParallax() {
    if (!hasGSAP || reduceMotion) return;
    gsap.to('.hero-inner', {
      yPercent: 16, autoAlpha: 0.2, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('#bg3d', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* ---------------- stat counters (anime.js) ---------------- */

  function initStats() {
    var grid = $('#statsGrid');
    if (!grid || !hasAnime || reduceMotion) return;

    var nums = $$('.num', grid);
    nums.forEach(function (el) { el.textContent = el.dataset.from || '0'; });

    var segs = $$('.stat-icon svg *', grid).filter(function (n) { return typeof n.getTotalLength === 'function'; });
    segs.forEach(function (s) { s.style.strokeDashoffset = anime.setDashoffset(s); });

    onEnter(grid, function () {
      anime({
        targets: segs,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1500,
        delay: anime.stagger(90),
        easing: 'easeInOutSine'
      });
      nums.forEach(function (el, i) {
        var from = parseFloat(el.dataset.from || '0');
        var to = parseFloat(el.dataset.to || '0');
        var state = { v: from };
        anime({
          targets: state,
          v: to,
          duration: 2300,
          delay: 250 + i * 150,
          easing: 'easeOutExpo',
          update: function () { el.textContent = String(Math.round(state.v)); }
        });
      });
    }, 0.25);
  }

  /* ---------------- benefit mini-infographics ---------------- */

  function initVizWater() {
    var root = $('#vizWater');
    if (!root || !hasAnime || reduceMotion) return;
    var fills = $$('.tube-fill', root);
    fills.forEach(function (f) { f.style.height = '0%'; });
    onEnter(root, function () {
      fills.forEach(function (f, i) {
        anime({
          targets: f,
          height: (parseFloat(f.dataset.fill) || 0) + '%',
          duration: 1700,
          delay: 150 + i * 400,
          easing: 'easeInOutQuart'
        });
      });
    });
  }

  function initVizSpeed() {
    var root = $('#vizSpeed');
    if (!root || !hasAnime || reduceMotion) return;
    var hydro = $('.race-fill.hydro', root);
    var soil = $('.race-fill.soil', root);
    var chip = $('#raceChip');
    [hydro, soil].forEach(function (b) { if (b) b.style.width = '0%'; });
    if (chip) chip.style.opacity = '0';

    onEnter(root, function () {
      /* a literal race: both bars head for harvest, hydro arrives 3× sooner */
      if (soil) anime({ targets: soil, width: '100%', duration: 3600, easing: 'linear' });
      if (hydro) {
        anime({
          targets: hydro,
          width: '100%',
          duration: 1200,
          easing: 'linear',
          complete: function () {
            if (!chip) return;
            anime({
              targets: chip,
              opacity: [0, 1],
              scale: [0.4, 1],
              rotate: 4,
              duration: 650,
              easing: 'easeOutBack'
            });
          }
        });
      }
    });
  }

  function initVizClean() {
    var root = $('#vizClean');
    if (!root || !hasAnime || reduceMotion) return;
    var segs = $$('.shield path', root);
    segs.forEach(function (s) { s.style.strokeDashoffset = anime.setDashoffset(s); });
    var chips = $$('.chip', root);
    chips.forEach(function (c) { c.style.opacity = '0'; });

    onEnter(root, function () {
      anime({
        targets: segs,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1600,
        delay: anime.stagger(280),
        easing: 'easeInOutQuart'
      });
      anime({
        targets: chips,
        opacity: [0, 1],
        translateY: [14, 0],
        delay: anime.stagger(140, { start: 1000 }),
        duration: 700,
        easing: 'easeOutCubic'
      });
    });
  }

  function initVizYear() {
    var root = $('#vizYear');
    if (!root || !hasAnime || reduceMotion) return;
    var sweep = $('.ring-sweep', root);
    var num = $('#ringNum');
    if (sweep) sweep.style.strokeDashoffset = '100';
    if (num) num.textContent = num.dataset.from || '0';

    onEnter(root, function () {
      if (sweep) {
        anime({ targets: sweep, strokeDashoffset: [100, 0], duration: 2300, easing: 'easeInOutQuart' });
      }
      if (num) {
        var state = { v: parseFloat(num.dataset.from || '0') };
        anime({
          targets: state,
          v: parseFloat(num.dataset.to || '365'),
          duration: 2300,
          easing: 'easeInOutQuart',
          update: function () { num.textContent = String(Math.round(state.v)); }
        });
      }
    });
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

    /* magnetic hover */
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

  /* ---------------- three.js hero scene ---------------- */

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
    '  float t = uTime * 0.18;',
    '  float n1 = snoise(position * uFreq * 0.55 + vec3(t, t * 0.8, -t));',
    '  float n2 = snoise(position * uFreq * 1.6 + vec3(-t * 1.3, t, t * 0.6)) * 0.35;',
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
    '  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);',
    '  float band = smoothstep(-0.9, 1.1, vDisp);',
    '  vec3 base = mix(uDeep, uLeaf * 0.8, band * 0.8);',
    '  vec3 rim = mix(uLeaf, uWater, clamp(vDisp * 0.5 + 0.5, 0.0, 1.0));',
    '  vec3 col = base + rim * fres * 0.95;',
    '  col += uMint * pow(band, 3.0) * 0.16;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function initThree() {
    var canvas = document.getElementById('bg3d');
    if (!canvas || !hasThree) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) {
      return; // no WebGL — the CSS glows carry the hero on their own
    }
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
    camera.position.z = 6.4;

    var cDeep = new THREE.Color('#0b3d1e');
    var cLeaf = new THREE.Color('#aed581');
    var cMint = new THREE.Color('#d0f0c0');
    var cWater = new THREE.Color('#81d4fa');

    /* the living droplet */
    var blobMat = new THREE.ShaderMaterial({
      vertexShader: BLOB_VERT,
      fragmentShader: BLOB_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.42 },
        uFreq: { value: 1.15 },
        uDeep: { value: cDeep },
        uLeaf: { value: cLeaf },
        uMint: { value: cMint },
        uWater: { value: cWater }
      }
    });
    var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 48), blobMat);

    var blobGroup = new THREE.Group();
    blobGroup.add(blob);

    /* orbit rings */
    var ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.012, 12, 220),
      new THREE.MeshBasicMaterial({ color: cLeaf, transparent: true, opacity: 0.38 })
    );
    ring1.rotation.set(Math.PI * 0.46, 0.4, 0);
    var ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.78, 0.009, 12, 220),
      new THREE.MeshBasicMaterial({ color: cWater, transparent: true, opacity: 0.2 })
    );
    ring2.rotation.set(Math.PI * 0.38, -0.55, 0);
    blobGroup.add(ring1, ring2);
    scene.add(blobGroup);

    /* drifting spore particles */
    var COUNT = 380;
    var positions = new Float32Array(COUNT * 3);
    var colors = new Float32Array(COUNT * 3);
    var palette = [cLeaf, cMint, cWater, cLeaf];
    for (var i = 0; i < COUNT; i++) {
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      var r = 2.6 + Math.random() * 5.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 1.5;
      var c = palette[(Math.random() * palette.length) | 0];
      var dim = 0.35 + Math.random() * 0.65;
      colors[i * 3] = c.r * dim;
      colors[i * 3 + 1] = c.g * dim;
      colors[i * 3 + 2] = c.b * dim;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var points = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    scene.add(points);

    /* pointer parallax */
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
      baseY = wide ? 0.05 : 1.55; /* on phones, park the droplet above the headline */
      var s = wide ? 1 : 0.55;
      blobGroup.scale.set(s, s, s);
    }
    resize();
    window.addEventListener('resize', resize);

    /* only render while the hero is on screen */
    var visible = true;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible = entry.isIntersecting; });
    }).observe(canvas);

    var clock = new THREE.Clock();

    if (reduceMotion) {
      blobMat.uniforms.uTime.value = 4;
      renderer.render(scene, camera);
      return;
    }

    (function tick() {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      var t = clock.getElapsedTime();
      blobMat.uniforms.uTime.value = t;
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      blobGroup.rotation.y = t * 0.12 + cx * 0.55;
      blobGroup.rotation.x = Math.sin(t * 0.18) * 0.08 + cy * 0.4;
      blobGroup.position.y = baseY + Math.sin(t * 0.7) * 0.07;
      ring1.rotation.z = t * 0.16;
      ring2.rotation.z = -t * 0.11;
      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.1) * 0.04;
      renderer.render(scene, camera);
    })();
  }

  /* ---------------- boot ---------------- */

  initThree();
  initChrome();
  initMarquees();
  initReveals();
  initDrift();
  initHeroParallax();
  initStats();
  initVizWater();
  initVizSpeed();
  initVizClean();
  initVizYear();
  initCTA();
  initLoader(setupIntro());
})();
