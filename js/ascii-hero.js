/* ============================================================
   DEMCO QUARTZ — ascii-hero.js
   Montre ASCII animée — fond hero interactif
   ============================================================ */
(function () {
  'use strict';

  const el = document.getElementById('ascii-watch');
  if (!el) return;

  /* ── Dimensions de la grille ── */
  const W = 79, H = 41;
  const cx = 39, cy = 20;

  /* ── Rayons de l'ellipse ──
     ry ≈ rx × (charWidth / charHeight) ≈ rx × 0.47
     Les caractères mono sont ~2× plus hauts que larges           */
  const RX = 36, RY = 17;   // cadran extérieur
  const IRX = 31, IRY = 14; // anneau intérieur (ring des minutes)

  /* ── Helpers ──────────────────────────────────────────────── */
  function makeGrid() {
    return Array.from({ length: H }, () => Array(W).fill(' '));
  }

  function put(g, x, y, ch, force) {
    if (x >= 0 && x < W && y >= 0 && y < H)
      if (force || g[y][x] === ' ') g[y][x] = ch;
  }

  function putStr(g, x, y, s, force) {
    [...s].forEach((c, i) => put(g, x + i, y, c, force));
  }

  /* Point sur l'ellipse à l'angle a (a=0 → droite, a=π/2 → bas écran) */
  function ep(rx, ry, a) {
    return [Math.round(cx + rx * Math.cos(a)), Math.round(cy + ry * Math.sin(a))];
  }

  /* Caractère de bordure qui suit la tangente de l'ellipse */
  function bezCh(a) {
    const sinA = Math.sin(a);
    if (Math.abs(sinA) < 0.001) return '│';
    const slope = -Math.cos(a) / sinA; // -cot(a), pente visuelle écran
    if (Math.abs(slope) > 2.0) return '│';
    if (Math.abs(slope) < 0.48) return '─';
    return slope < 0 ? '/' : '\\';
  }

  /* Ellipse générique */
  function drawEllipse(g, rx, ry, ch) {
    const steps = (rx + ry) * 14;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * 2 * Math.PI;
      const [x, y] = ep(rx, ry, a);
      put(g, x, y, ch != null ? ch : bezCh(a));
    }
  }

  /* Aiguille : angle clockwise depuis 12h (en radians standard écran) */
  function drawHand(g, a, frac, ch) {
    const lx = RX * frac, ly = RY * frac;
    const steps = Math.ceil(Math.hypot(lx, ly) * 2.8);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(cx + lx * t * Math.cos(a));
      const y = Math.round(cy + ly * t * Math.sin(a));
      put(g, x, y, ch, true);
    }
  }

  /* Conversion heure → angle écran (0 = 12h = haut de l'ellipse) */
  const toA = turns => turns * 2 * Math.PI - Math.PI / 2;

  /* ── Rendu d'une frame ──────────────────────────────────── */
  function render(smoothSec) {
    const g = makeGrid();

    /* Biseau extérieur — double trait */
    drawEllipse(g, RX, RY);
    drawEllipse(g, RX - 1, RY - 1, '·');

    /* Anneau intérieur */
    drawEllipse(g, IRX, IRY, '·');

    /* Graduations minutes (60 traits) */
    for (let m = 0; m < 60; m++) {
      const a = toA(m / 60);
      const [x, y] = ep(IRX + 1, IRY + 1, a);
      put(g, x, y, m % 5 === 0 ? '┼' : '▪');
    }

    /* Index d'heures (marqueurs cardinaux, remplaceront les graduations) */
    for (let h = 0; h < 12; h++) {
      const a = toA(h / 12);
      const [x1, y1] = ep(IRX + 1, IRY + 1, a);
      const [x2, y2] = ep(IRX, IRY, a);
      if (h % 3 === 0) {
        put(g, x1, y1, '◆', true);
        put(g, x2, y2, '◆', true);
      } else {
        put(g, x1, y1, '│', true);
      }
    }

    /* Chiffres cardinaux */
    putStr(g, cx - 1, cy - RY + 2, 'XII', true);
    putStr(g, cx + RX - 4, cy, ' III', true);
    putStr(g, cx - 1, cy + RY - 2, ' VI', true);
    putStr(g, cx - RX + 1, cy, 'IX ', true);

    /* Textes du cadran */
    putStr(g, cx - 4, cy - 3, 'AUTOMATIC', true);
    putStr(g, cx - 6, cy + 2, 'DEMCO QUARTZ', true);
    putStr(g, cx - 4, cy + 4, '· Est. 1994 ·', true);

    /* Couronne (droite du boîtier) */
    put(g, cx + RX + 1, cy - 2, '╔', true);
    put(g, cx + RX + 1, cy - 1, '║', true);
    put(g, cx + RX + 1, cy,     '║', true);
    put(g, cx + RX + 1, cy + 1, '║', true);
    put(g, cx + RX + 1, cy + 2, '╚', true);
    put(g, cx + RX + 2, cy - 2, '╗', true);
    put(g, cx + RX + 2, cy - 1, '║', true);
    put(g, cx + RX + 2, cy,     '║', true);
    put(g, cx + RX + 2, cy + 1, '║', true);
    put(g, cx + RX + 2, cy + 2, '╝', true);

    /* Calcul heure courante */
    const now = new Date();
    const rawSec = now.getSeconds() + now.getMilliseconds() / 1000;
    const sec  = smoothSec !== undefined ? smoothSec : Math.floor(rawSec);
    const min  = now.getMinutes() + sec / 60;
    const hour = (now.getHours() % 12) + min / 60;

    const hourA = toA(hour / 12);
    const minA  = toA(min  / 60);
    const secA  = toA(sec  / 60);

    /* Contre-masse aiguille secondes */
    drawHand(g, secA + Math.PI, 0.16, '░');

    /* Aiguille heures — courte, épaisse */
    drawHand(g, hourA, 0.42, '█');

    /* Aiguille minutes — longue, moyenne */
    drawHand(g, minA, 0.68, '▓');

    /* Aiguille secondes — fine, longue */
    drawHand(g, secA, 0.78, '·');

    /* Pivot central */
    put(g, cx, cy, '◉', true);

    return g.map(r => r.join('')).join('\n');
  }

  /* ── Boucle animation ───────────────────────────────────── */
  let hovered = false;
  let tickId  = null;
  let rafId   = null;

  function tick() {
    clearTimeout(tickId);
    el.textContent = render();
    const delay = 1000 - (Date.now() % 1000);
    tickId = setTimeout(tick, delay + 8); // +8ms marge
  }

  function smoothLoop() {
    if (!hovered) { tick(); return; }
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    el.textContent = render(s);
    rafId = requestAnimationFrame(smoothLoop);
  }

  el.addEventListener('mouseenter', () => {
    hovered = true;
    clearTimeout(tickId);
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(smoothLoop);
  });

  el.addEventListener('mouseleave', () => {
    hovered = false;
    cancelAnimationFrame(rafId);
    tick();
  });

  tick();
})();
