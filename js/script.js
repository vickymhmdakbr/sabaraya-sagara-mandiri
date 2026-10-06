/* =====================================================
   PT. Sabaraya Sagara Mandiri - interaksi dasar
   Vanilla JS, tanpa dependensi
   ===================================================== */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelectorAll('.nav-link');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Menu hamburger (mobile) ---------- */
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  // Tutup menu saat link diklik
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  // Tutup dengan tombol Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  // Tutup menu jika layar diperlebar ke desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setMenu(false);
  });

  /* ---------- 2. Bayangan navbar saat scroll ---------- */
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Menu aktif sesuai section (scroll spy) ---------- */
  var sectionIds = ['about', 'services', 'products', 'partners', 'contact'];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });

    // Hapus status aktif saat kembali ke hero
    window.addEventListener('scroll', function () {
      if (window.scrollY < 200) setActive('');
    }, { passive: true });
  }

  /* ---------- 4. Reveal animation saat masuk viewport ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  function finishReveal(el) {
    // Setelah animasi selesai, lepas class agar transisi hover kartu normal
    window.setTimeout(function () {
      el.classList.remove('reveal', 'is-visible');
    }, 1200);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          finishReveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Fallback gambar & logo yang belum tersedia ---------- */
  function handleMissing(img) {
    var media = img.closest('.media');
    var brand = img.closest('.brand');
    var partner = img.closest('.partner-item');

    if (media) media.classList.add('img-missing');
    if (brand) brand.classList.add('logo-missing');
    if (partner) {
      var label = document.createElement('span');
      label.className = 'partner-name';
      label.textContent = img.getAttribute('alt') || '';
      img.replaceWith(label);
    }
  }

  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) {
      handleMissing(img);
    } else {
      img.addEventListener('error', function () { handleMissing(img); }, { once: true });
    }
  });

  /* ---------- 6. Sembunyikan pesan kosong jika produk sudah ditambahkan ---------- */
  var grid = document.getElementById('product-grid');
  var empty = document.getElementById('product-empty');
  if (grid && empty && grid.children.length > 0) {
    empty.classList.add('is-hidden');
  }
})();
