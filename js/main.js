/* ============================================================
   DEMCO QUARTZ — main.js
   Interactions : cursor, header, mobile nav, scroll reveal,
                  counters, testimonials slider, collection filter, modal
   ============================================================ */

(function () {
  'use strict';

  // ════════════════════════════════════════
  // 0. LENIS — scroll fluide, sans hijacking
  // ════════════════════════════════════════
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      lerp: 0.05,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: true,
    });

    let lenisRafId = 0;
    function lenisRaf(time) {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(lenisRaf);
    }
    lenisRafId = requestAnimationFrame(lenisRaf);

    window._lenis = lenis;

    // Attributs data-lenis-start | stop | toggle
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-lenis-start],[data-lenis-stop],[data-lenis-toggle]');
      if (!trigger) return;
      if (trigger.hasAttribute('data-lenis-start')) {
        lenis.start(); trigger.classList.remove('stop-scroll');
      } else if (trigger.hasAttribute('data-lenis-stop')) {
        lenis.stop(); trigger.classList.add('stop-scroll');
      } else if (trigger.hasAttribute('data-lenis-toggle')) {
        const shouldStop = !trigger.classList.contains('stop-scroll');
        trigger.classList.toggle('stop-scroll', shouldStop);
        shouldStop ? lenis.stop() : lenis.start();
      }
    });
  }

  // ════════════════════════════════════════
  // 1. CUSTOM CURSOR
  // ════════════════════════════════════════
  const cursor = document.querySelector('.cursor');

  if (cursor && !('ontouchstart' in window)) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });

    // Agrandissement sur éléments interactifs
    const clickables = 'a, button, .btn, .filter-btn, .watch-card, .watch-card-full, .slider-dot, .hamburger, .modal-close';
    document.querySelectorAll(clickables).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Observer les éléments ajoutés dynamiquement (modal, etc.)
    document.addEventListener('mouseenter', (e) => {
      if (e.target.matches && e.target.matches(clickables)) {
        cursor.classList.add('hover');
      }
    }, true);
    document.addEventListener('mouseleave', (e) => {
      if (e.target.matches && e.target.matches(clickables)) {
        cursor.classList.remove('hover');
      }
    }, true);
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // ════════════════════════════════════════
  // 2. HEADER SCROLL
  // ════════════════════════════════════════
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = function (y) {
      header.classList.toggle('scrolled', y > 60);
    };
    if (window._lenis) {
      window._lenis.on('scroll', function (e) { onScroll(e.scroll); });
    } else {
      window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
    }
    onScroll(window.scrollY);
  }

  // ════════════════════════════════════════
  // 3. MOBILE NAV
  // ════════════════════════════════════════
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ════════════════════════════════════════
  // 4. SCROLL REVEAL — Intersection Observer
  // ════════════════════════════════════════
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Délai décalé par index pour les grilles
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // Timeline reveal (page à-propos)
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length) {
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          tlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    timelineItems.forEach(item => tlObserver.observe(item));
  }

  // ════════════════════════════════════════
  // 5. COMPTEURS ANIMÉS
  // ════════════════════════════════════════
  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-target], .about-stat-number[data-target]');
  if (statNumbers.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix, 1800);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  // ════════════════════════════════════════
  // 6. TESTIMONIALS SLIDER
  // ════════════════════════════════════════
  const track = document.querySelector('.testimonials-track');
  const dots  = document.querySelectorAll('.slider-dot');

  if (track && dots.length) {
    let current = 0;
    const total = dots.length;
    let autoTimer;

    const goTo = (index) => {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(autoTimer);
        goTo(i);
        startAuto();
      });
    });

    const startAuto = () => {
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    };

    goTo(0);
    startAuto();

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', startAuto);
  }

  // ════════════════════════════════════════
  // 7. COLLECTION FILTER (collection.html)
  // ════════════════════════════════════════
  const filterBtns = document.querySelectorAll('.filter-btn');
  const watchCards = document.querySelectorAll('.watch-card-full');

  if (filterBtns.length && watchCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        watchCards.forEach(card => {
          if (filter === 'all' || card.dataset.brand === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // ════════════════════════════════════════
  // 8. MODAL LIGHTBOX (collection.html)
  // ════════════════════════════════════════
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.querySelector('.modal-close');

  if (modalOverlay) {
    // Ouvrir modal au clic sur une carte
    document.querySelectorAll('.watch-card-full').forEach(card => {
      card.addEventListener('click', () => {
        populateModal(card);
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    // Fermer
    const closeModal = () => {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function populateModal(card) {
    const brand    = card.dataset.brand    || '';
    const ref      = card.dataset.ref      || '';
    const model    = card.dataset.model    || '';
    const year     = card.dataset.year     || '';
    const cond     = card.dataset.cond     || '';
    const price    = card.dataset.price    || '';
    const movement = card.dataset.movement || '';
    const case_dia = card.dataset.casedia  || '';

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('modal-brand',    brand);
    setEl('modal-ref',      'REF. ' + ref);
    setEl('modal-model',    model);
    setEl('modal-year',     year);
    setEl('modal-cond',     cond);
    setEl('modal-price',    price);
    setEl('modal-movement', movement);
    setEl('modal-casedia',  case_dia);

    // Injecter l'image (photo ou SVG) dans le modal
    const modalSvgContainer = document.getElementById('modal-svg');
    if (modalSvgContainer) {
      const cardPhoto = card.querySelector('.watch-photo');
      const cardSvg   = card.querySelector('.watch-face-svg');
      if (cardPhoto) {
        modalSvgContainer.innerHTML = '<img src="' + cardPhoto.src + '" alt="' + cardPhoto.alt + '" style="width:100%;height:100%;object-fit:cover;border-radius:4px;"/>';
      } else if (cardSvg) {
        modalSvgContainer.innerHTML = cardSvg.outerHTML;
      }
    }

    // Bouton "Ajouter au panier" du modal
    const modalCartBtn = document.getElementById('modal-cart-btn');
    if (modalCartBtn && typeof window.addToCart === 'function') {
      modalCartBtn.onclick = () => {
        const img = card.dataset.img || '';
        window.addToCart(ref, brand, model, price, img);
      };
    }
  }

  // ════════════════════════════════════════
  // 9. CONTACT FORM VALIDATION
  // ════════════════════════════════════════
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const fields = contactForm.querySelectorAll('[data-required]');
      fields.forEach(field => {
        const group = field.closest('.form-group');
        if (!group) return;

        let ok = true;
        if (field.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        } else if (field.type === 'tel') {
          ok = field.value.trim() === '' || /^[+\d\s\-()]{7,20}$/.test(field.value.trim());
        } else {
          ok = field.value.trim().length > 0;
        }

        group.classList.toggle('error', !ok);
        if (!ok) valid = false;
      });

      if (valid) {
        const btn = contactForm.querySelector('[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Message envoyé ✓';
        btn.disabled = true;
        btn.style.background = 'rgba(46,109,164,0.4)';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
          btn.style.background = '';
          contactForm.reset();
        }, 4000);
      }
    });

    // Clear error on input
    contactForm.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => {
        field.closest('.form-group')?.classList.remove('error');
      });
    });
  }

  // ════════════════════════════════════════
  // 10. ACTIVE NAV LINK
  // ════════════════════════════════════════
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ════════════════════════════════════════
  // 11. PRELOADER
  // ════════════════════════════════════════
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hide = () => preloader.classList.add('done');
    // N'afficher le preloader qu'à la première ouverture du site
    if (sessionStorage.getItem('dq_visited')) {
      // Déjà visité : masquer immédiatement sans animation
      preloader.style.transition = 'none';
      hide();
    } else {
      // Première visite : marquer + attendre durée minimale
      sessionStorage.setItem('dq_visited', '1');
      const minDelay = new Promise(r => setTimeout(r, 1600));
      const pageLoad = new Promise(r => {
        if (document.readyState === 'complete') r();
        else window.addEventListener('load', r, { once: true });
      });
      Promise.all([minDelay, pageLoad]).then(hide);
    }
  }

  // ════════════════════════════════════════
  // 12. PANIER (CART SYSTEM)
  // ════════════════════════════════════════
  const cart = JSON.parse(sessionStorage.getItem('dq_cart') || '[]');

  function saveCart() {
    sessionStorage.setItem('dq_cart', JSON.stringify(cart));
  }

  function formatPrice(str) {
    // "€ 8 900" → number
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
  }

  function showToast(msg) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function updateCartBadges() {
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = cart.length;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 300);
    });
    // Mettre à jour les boutons "Ajouter"
    document.querySelectorAll('.btn-cart[data-ref]').forEach(btn => {
      const inCart = cart.some(i => i.ref === btn.dataset.ref);
      btn.classList.toggle('in-cart', inCart);
      btn.textContent = inCart ? '✓ Dans le panier' : 'Ajouter au panier';
    });
  }

  function renderCartItems() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;

    if (cart.length === 0) {
      list.innerHTML = '<p class="cart-empty-msg">Votre panier est vide.</p>';
    } else {
      list.innerHTML = cart.map(item => `
        <div class="cart-item">
          ${item.img
            ? `<img src="${item.img}" alt="${item.brand}" class="cart-item-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
               <div class="cart-item-img-fallback" style="display:none"></div>`
            : `<div class="cart-item-img-fallback"></div>`
          }
          <div>
            <div class="cart-item-brand">${item.brand}</div>
            <div class="cart-item-ref">REF. ${item.ref}</div>
            <div class="cart-item-model">${item.model || ''}</div>
            <div class="cart-item-price">${item.price}</div>
          </div>
          <button class="cart-item-remove" data-remove="${item.ref}" aria-label="Retirer">✕</button>
        </div>
      `).join('');
    }

    // Total
    const total = cart.reduce((s, i) => s + formatPrice(i.price), 0);
    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) totalEl.textContent = '€ ' + total.toLocaleString('fr-BE');

    // Listeners remove
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.remove);
      });
    });
  }

  window.addToCart = function (ref, brand, model, price, img) {
    if (cart.some(i => i.ref === ref)) {
      showToast('Déjà dans le panier — ' + brand);
      openCart();
      return;
    }
    cart.push({ ref, brand, model, price, img });
    saveCart();
    updateCartBadges();
    renderCartItems();
    showToast(brand + ' · ' + model + ' ajouté');
    openCart();
  };

  window.removeFromCart = function (ref) {
    const idx = cart.findIndex(i => i.ref === ref);
    if (idx > -1) {
      cart.splice(idx, 1);
      saveCart();
      updateCartBadges();
      renderCartItems();
    }
  };

  function openCart() {
    const drawer  = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer)  drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const drawer  = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Bouton panier header
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  // Fermeture
  const cartCloseBtn = document.getElementById('cart-close-btn');
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Boutons "Ajouter au panier" sur les cards
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // ne pas déclencher le modal
      const card = btn.closest('[data-ref]');
      if (!card) return;
      // Lire le nom affiché depuis le DOM, pas la clé de filtre
      const displayBrand = card.querySelector('.watch-brand')?.textContent.trim()
                        || card.dataset.brand || '';
      const displayModel = card.querySelector('.watch-model')?.textContent.trim()
                        || card.dataset.model || '';
      addToCart(
        card.dataset.ref,
        displayBrand,
        displayModel,
        card.dataset.price,
        card.dataset.img || ''
      );
    });
  });

  // Init
  updateCartBadges();
  renderCartItems();

})();
