/* ============================================================
   DEMCO QUARTZ — three-hero.js
   Scène 3D : mécanisme horloger (engrenages, balancier, roue d'échappement)
   Three.js r128
   ============================================================ */

(function () {
  'use strict';

  window.addEventListener('load', initHero);

  /* ── Création d'un engrenage complet ─────────────────────── */
  function createGear(radius, teethCount, mat) {
    const group = new THREE.Group();
    const tube  = radius * 0.065;

    // Couronne extérieure (torus)
    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 14, 100), mat));

    // Couronne intérieure (moyeu)
    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius * 0.42, tube * 0.65, 8, 48), mat));

    // Rayons (5 bras)
    for (let i = 0; i < 5; i++) {
      const a  = (i / 5) * Math.PI * 2;
      const L  = radius * 0.58;
      const s  = new THREE.Mesh(
        new THREE.CylinderGeometry(tube * 0.38, tube * 0.38, L, 6),
        mat
      );
      s.rotation.z = a - Math.PI / 2;
      s.position.set(Math.cos(a) * L / 2, Math.sin(a) * L / 2, 0);
      group.add(s);
    }

    // Dents périphériques
    const toothH = radius * 0.13;
    const toothW = (2 * Math.PI * radius / teethCount) * 0.52;
    for (let i = 0; i < teethCount; i++) {
      const a = (i / teethCount) * Math.PI * 2;
      const r = radius + toothH / 2;
      const t = new THREE.Mesh(
        new THREE.BoxGeometry(toothW, toothH, tube * 1.6),
        mat
      );
      t.rotation.z = a;
      t.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      group.add(t);
    }

    // Axe central
    const axle = new THREE.CylinderGeometry(tube * 1.4, tube * 1.4, tube * 3.5, 12);
    axle.rotateX(Math.PI / 2);
    group.add(new THREE.Mesh(axle, mat));

    return group;
  }

  /* ── Balancier (oscillant) ────────────────────────────────── */
  function createBalanceWheel(radius, mat) {
    const group = new THREE.Group();

    // Anneau principal
    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.055, 12, 80), mat));

    // Deux barreaux en croix
    for (let i = 0; i < 2; i++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.03, radius * 0.03, radius * 1.85, 8),
        mat
      );
      bar.rotation.z = (i / 2) * Math.PI;
      group.add(bar);
    }

    // Petite roue centrale
    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius * 0.18, radius * 0.04, 8, 24), mat));

    return group;
  }

  /* ── Roue d'échappement ───────────────────────────────────── */
  function createEscapement(radius, mat) {
    const group = new THREE.Group();

    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.04, 8, 60), mat));

    // 15 dents inclinées (forme échappe)
    for (let i = 0; i < 15; i++) {
      const a    = (i / 15) * Math.PI * 2;
      const tip  = new THREE.Mesh(
        new THREE.ConeGeometry(radius * 0.06, radius * 0.2, 4),
        mat
      );
      tip.rotation.z = a + 0.35;
      tip.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      group.add(tip);
    }

    // Centre
    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius * 0.22, radius * 0.05, 8, 20), mat));

    return group;
  }

  /* ── Main ─────────────────────────────────────────────────── */
  function initHero() {
    const container = document.getElementById('hero-canvas');
    if (!container || typeof THREE === 'undefined') return;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x06090F, 1);
    container.appendChild(renderer.domElement);

    /* Scène & Caméra */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 14);

    /* Éclairage */
    scene.add(new THREE.AmbientLight(0x0B1220, 0.4));

    const pL1 = new THREE.PointLight(0x4A90D9, 4, 80);   // bleu froid — haut gauche
    pL1.position.set(-9, 9, 7);
    scene.add(pL1);

    const pL2 = new THREE.PointLight(0xE8ECEF, 3, 80);   // blanc — bas droite
    pL2.position.set(9, -7, 8);
    scene.add(pL2);

    const pL3 = new THREE.PointLight(0x2E6DA4, 2, 50);   // accent
    pL3.position.set(0, 0, 12);
    scene.add(pL3);

    /* Matériaux */
    const matChrome = new THREE.MeshStandardMaterial({ color: 0xA8B4C0, metalness: 1.0, roughness: 0.08 });
    const matNavy   = new THREE.MeshStandardMaterial({ color: 0x1E3A5F, metalness: 0.9, roughness: 0.18 });
    const matAccent = new THREE.MeshStandardMaterial({ color: 0x3A7ABD, metalness: 1.0, roughness: 0.12 });

    /* ── Groupe principal ── */
    const group = new THREE.Group();
    scene.add(group);

    /* Engrenages */
    const gearBig    = createGear(2.5, 28, matChrome);
    const gearMid    = createGear(1.5, 17, matNavy);
    const gearSmall  = createGear(0.85, 10, matChrome);

    // Positions (gears visuellement proches = engrenés)
    gearBig.position.set(-3.8, 0.8, -4);
    gearBig.rotation.x = 0.15;

    gearMid.position.set(-0.1, 0.8, -5);   // à droite du grand
    gearMid.rotation.x = 0.1;

    gearSmall.position.set(1.5, -1.2, -3.5);  // en bas à droite du moyen
    gearSmall.rotation.x = 0.2;

    group.add(gearBig, gearMid, gearSmall);

    /* Balancier — en haut à droite */
    const balance = createBalanceWheel(1.1, matAccent);
    balance.position.set(3.8, 2.8, -2);
    balance.rotation.x = 0.25;
    group.add(balance);

    /* Roue d'échappement — bas gauche */
    const escape = createEscapement(0.9, matChrome);
    escape.position.set(-2.2, -2.8, -2);
    escape.rotation.x = -0.15;
    group.add(escape);

    /* Couronne de remontage — détail droit */
    const crownGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.55, 20);
    crownGeo.rotateX(Math.PI / 2);
    const crown = new THREE.Mesh(crownGeo, matAccent);
    crown.position.set(4.2, -1.5, -1.5);
    group.add(crown);

    /* Aiguille stylisée — détail */
    const handGeo = new THREE.CylinderGeometry(0.02, 0.06, 2.0, 6);
    const hand    = new THREE.Mesh(handGeo, matChrome);
    hand.position.set(2.5, 1.2, -1);
    hand.rotation.z = 0.8;
    group.add(hand);

    /* Vitesses d'engrenage (ratios de rayon) */
    const ωBase   = 0.004;
    const ωMid    = ωBase  * (2.5 / 1.5);
    const ωSmall  = ωMid   * (1.5 / 0.85);

    /* ── Particules chrome ── */
    const N = 220;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xA8B4C0, size: 0.055, transparent: true, opacity: 0.5, sizeAttenuation: true
    }));
    scene.add(particles);

    /* ── Parallax souris ── */
    let tgtX = 0, tgtY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', e => {
      tgtX = (e.clientX / window.innerWidth  - 0.5) * 2.2;
      tgtY = (e.clientY / window.innerHeight - 0.5) * 1.6;
    });

    /* ── Resize ── */
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    /* ── Boucle animation ── */
    let last = 0;
    const INTERVAL = 1000 / 60;

    function animate(now) {
      requestAnimationFrame(animate);
      if (now - last < INTERVAL) return;
      last = now - ((now - last) % INTERVAL);

      const t = now * 0.001;

      // Engrenages (rotation + légère oscillation)
      gearBig.rotation.z  += ωBase;
      gearMid.rotation.z  -= ωMid;
      gearSmall.rotation.z += ωSmall;

      gearBig.position.y   = 0.8  + Math.sin(t * 0.3) * 0.08;
      gearMid.position.y   = 0.8  + Math.sin(t * 0.4 + 1) * 0.06;
      gearSmall.position.y = -1.2 + Math.sin(t * 0.5 + 2) * 0.05;

      // Balancier : oscillation réaliste
      balance.rotation.z = Math.sin(t * 3.5) * 0.65;
      balance.position.y = 2.8 + Math.sin(t * 0.25) * 0.1;

      // Roue d'échappement : rotation lente avec saccades
      escape.rotation.z += 0.012 * (1 + 0.3 * Math.sin(t * 7));

      // Couronne : légère rotation
      crown.rotation.z = t * 0.5;

      // Aiguille : rotation
      hand.rotation.z = t * 0.8;

      // Particules
      particles.rotation.y = t * 0.015;
      particles.rotation.x = t * 0.006;

      // Parallax caméra (lerp doux)
      curX += (tgtX * 1.4 - curX) * 0.035;
      curY += (-tgtY * 0.9 - curY) * 0.035;
      camera.position.x = curX;
      camera.position.y = curY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate(0);
  }

})();
