/* ============================================================
   DEMCO QUARTZ — dot-hero.js
   Dot grid watch · hover doré réactif
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('dot-hero');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── Config ── */
  const SPACING    = 20;    // px entre les points
  const R_BASE     = 1.2;   // rayon repos
  const R_WATCH    = 2.4;   // rayon sur tracé montre
  const R_HOVER    = 7.0;   // rayon max au hover
  const HOVER_DIST = 130;   // zone d'influence souris (px)

  /* ── État ── */
  let W, H, cx, cy, rx, ry;
  let dots = [];
  const mouse = { x: -9999, y: -9999 };
  let raf;

  /* ── Resize ── */
  function resize() {
    const hero = document.getElementById('hero') || canvas.parentElement;
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    const dpr = devicePixelRatio || 1;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cx = W / 2;
    cy = H / 2;
    const minDim = Math.min(W, H);
    rx = minDim * 0.285;
    ry = minDim * 0.245;
    buildDots();
  }

  /* ── Grille ── */
  function buildDots() {
    dots = [];
    const cols = Math.ceil(W / SPACING) + 1;
    const rows = Math.ceil(H / SPACING) + 1;
    const ox = (W - (cols - 1) * SPACING) / 2;
    const oy = (H - (rows - 1) * SPACING) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * SPACING;
        const y = oy + r * SPACING;
        dots.push({ x, y, sw: staticStrength(x - cx, y - cy) });
      }
    }
  }

  /* ── Gaussian bell ── */
  function bell(x, center, sigma) {
    const d = (x - center) / sigma;
    return Math.max(0, 1 - d * d);
  }

  /* ── Strength statique : bordure, anneaux, graduations ── */
  function staticStrength(dx, dy) {
    const nxn = dx / rx, nyn = dy / ry;
    const nr  = Math.sqrt(nxn * nxn + nyn * nyn);

    const outer = bell(nr, 1.00, 0.022);         // bordure extérieure
    const bevel = bell(nr, 0.955, 0.018) * 0.45; // biseau intérieur
    const ring  = bell(nr, 0.845, 0.018) * 0.55; // anneau graduations

    /* Ticks minutes sur l'anneau */
    let tickStr = 0;
    if (nr > 0.80 && nr < 0.895) {
      const ang   = Math.atan2(nyn, nxn);
      const turns = ((ang + Math.PI / 2) / (2 * Math.PI) + 1) % 1;
      const frac60 = (turns * 60) % 1;
      const nearMin  = Math.min(frac60, 1 - frac60);
      tickStr = Math.max(0, 1 - nearMin / 0.0065) * 0.45;
      /* Marqueurs d'heures (plus larges) */
      const frac12 = (turns * 12) % 1;
      const nearHour = Math.min(frac12, 1 - frac12);
      tickStr = Math.max(tickStr, Math.max(0, 1 - nearHour / 0.012) * 0.85);
    }

    return Math.max(outer * 0.72, bevel, ring, tickStr);
  }

  /* ── Strength dynamique : aiguilles ── */
  function handStr(dx, dy, turnsFrac, lenFrac, widthPx) {
    const a  = turnsFrac * 2 * Math.PI - Math.PI / 2;
    const ex = rx * lenFrac * Math.cos(a);
    const ey = ry * lenFrac * Math.sin(a);
    const lenSq = ex * ex + ey * ey;
    if (lenSq < 1) return 0;
    const t  = Math.max(0, Math.min(1, (dx * ex + dy * ey) / lenSq));
    const px = dx - ex * t, py = dy - ey * t;
    const dist = Math.sqrt(px * px + py * py);
    return Math.max(0, 1 - dist / widthPx);
  }

  /* ── Interpolation linéaire ── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── Rendu ── */
  function draw() {
    const dpr = devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Heure courante */
    const now  = new Date();
    const sec  = now.getSeconds() + now.getMilliseconds() / 1000;
    const min  = now.getMinutes() + sec / 60;
    const hour = (now.getHours() % 12) + min / 60;

    const mx = mouse.x, my = mouse.y;

    for (let i = 0; i < dots.length; i++) {
      const d  = dots[i];
      const dx = d.x - cx;
      const dy = d.y - cy;

      /* Aiguilles */
      const hs  = handStr(dx, dy, hour / 12,       0.42, 4.8);  // heures
      const ms  = handStr(dx, dy, min  / 60,       0.64, 3.2);  // minutes
      const ss  = handStr(dx, dy, sec  / 60,       0.76, 1.8);  // secondes
      const scs = handStr(dx, dy, sec  / 60 + 0.5, 0.14, 1.5);  // contre-poids

      const watchStr = Math.max(d.sw, hs * 0.92, ms * 0.85, ss * 0.75, scs * 0.55);

      /* Hover */
      const mdx = d.x - mx, mdy = d.y - my;
      const md2 = mdx * mdx + mdy * mdy;
      const hRaw = Math.max(0, 1 - md2 / (HOVER_DIST * HOVER_DIST));
      const hFactor = hRaw * hRaw; // carré pour chute rapide

      /* Rayon */
      const rBase = R_BASE + watchStr * (R_WATCH - R_BASE);
      const rFinal = Math.max(0.5, (rBase + hFactor * (R_HOVER - rBase)) * dpr);

      /* Facteur or : hover prime sur la montre */
      const gold = Math.min(1, hFactor * 1.15 + watchStr * 0.22);

      /* Couleur */
      let red, grn, blu, alpha;
      if (gold < 0.45) {
        const t = gold / 0.45;
        red   = Math.round(lerp(38,  195, t));
        grn   = Math.round(lerp(44,  158, t));
        blu   = Math.round(lerp(68,  100, t));
        alpha = lerp(0.055, 0.42, t) + watchStr * 0.25;
      } else {
        const t = (gold - 0.45) / 0.55;
        red   = Math.round(lerp(195, 255, t));
        grn   = Math.round(lerp(158, 208, t));
        blu   = Math.round(lerp(100,  48, t));
        alpha = lerp(0.42, 1.0, t);
      }
      alpha = Math.min(1, alpha);

      ctx.beginPath();
      ctx.arc(d.x * dpr, d.y * dpr, rFinal, 0, 6.2832);
      ctx.fillStyle = 'rgba(' + red + ',' + grn + ',' + blu + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  /* ── Événements ── */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    resize();
    raf = requestAnimationFrame(draw);
  });

  /* ── Init ── */
  resize();
  raf = requestAnimationFrame(draw);
})();
