/* =====================================================
   PT. Sabaraya Sagara Mandiri - Halaman Products
   =====================================================

   CARA MENAMBAH PRODUK
   1. Simpan foto ke folder yang sesuai, misalnya:
        assets/products/instruments/hematology/nama-file.png
   2. Tambahkan SATU object di daftar "products" di bawah.
   3. Selesai. Produk otomatis muncul di grid, foto otomatis
      masuk ke kotak persegi (1:1) tanpa terpotong.
      HTML dan CSS tidak perlu diubah.

   Nilai "category" dan "subcategory" harus sama dengan "id"
   pada konfigurasi "catalog" di bawah.
   ===================================================== */


/* ---------- A. STRUKTUR KATALOG (sidebar & filter) ----------
   Jarang berubah. Edit hanya jika ingin menambah/menamai ulang
   kategori atau subkategori. */
const catalog = [
  {
    id: "instruments",
    label: "Instruments",
    subcategories: [
      { id: "hematology",  label: "Hematology Analyzer" },
      { id: "chemistry",   label: "Chemistry Analyzer" },
      { id: "urine",       label: "Urine Analyzer" },
      { id: "electrolyte", label: "Electrolyte Analyzer" }
    ]
  },
  {
    id: "consumables",
    label: "Consumables",
    subcategories: [
      { id: "reagent",          label: "Reagent" },
      { id: "blood-collection", label: "Blood Collection Tube" }
    ]
  },
  {
    id: "systems",
    label: "Systems",
    subcategories: [
      { id: "laboratory-system", label: "Laboratory System" },
      { id: "e-catalogue",       label: "E-Catalogue" }
    ]
  }
];


/* ---------- B. DATA PRODUK ----------
   Tambahkan produk baru di sini (satu object per produk).
   Data di bawah masih dummy untuk menguji layout; foto yang
   belum ada otomatis menampilkan placeholder. */
const products = [
  // INSTRUMENTS
  {
    name: "Mindray BC 5000 Automated Hematology Analyzer",
    category: "instruments",
    subcategory: "hematology",
    image: "assets/products/instruments/hematology/bc5000.png"
  },
  {
    name: "Veterinary Auto Hematology Analyzer BH-HA310VET",
    category: "instruments",
    subcategory: "hematology",
    image: "assets/products/instruments/hematology/BJPX-HDO43-1.jpg"
  },
  {
    name: "Mindray BS 430 Chemistry Analyzer",
    category: "instruments",
    subcategory: "chemistry",
    image: "assets/products/instruments/chemistry/bs430.jpg"
  },
  {
    name: "Semi Auto Chemistry Analyzer",
    category: "instruments",
    subcategory: "chemistry",
    image: "assets/products/instruments/chemistry/product-02.png"
  },
  {
    name: "Semi Auto Urine Analyzer",
    category: "instruments",
    subcategory: "urine",
    image: "assets/products/instruments/urine/product-01.png"
  },
  {
    name: "Electrolyte Analyzer",
    category: "instruments",
    subcategory: "electrolyte",
    image: "assets/products/instruments/electrolyte/product-01.png"
  },

  // CONSUMABLES
  {
    name: "Reagent",
    category: "consumables",
    subcategory: "reagent",
    image: "assets/products/consumables/reagent/product-01.png"
  },
  {
    name: "Blood Collection Tube",
    category: "consumables",
    subcategory: "blood-collection",
    image: "assets/products/consumables/blood-collection/product-01.png"
  },

  // SYSTEMS
  {
    name: "Laboratory System",
    category: "systems",
    subcategory: "laboratory-system",
    image: "assets/products/systems/laboratory-system/product-01.png"
  },
  {
    name: "E-Catalogue",
    category: "systems",
    subcategory: "e-catalogue",
    image: "assets/products/systems/e-catalogue/product-01.png"
  }
];


/* =====================================================
   ===  LOGIKA HALAMAN - tidak perlu diedit di bawah ini  ===
   ===================================================== */
(function () {
  'use strict';

  var grid       = document.getElementById('cat-grid');
  var chipsEl    = document.getElementById('cat-chips');
  var statusEl   = document.getElementById('cat-status');
  var treeEl     = document.getElementById('cat-tree');
  var toolbar    = document.getElementById('cat-toolbar');
  var side       = document.getElementById('cat-side');
  var sideToggle = document.getElementById('cat-side-toggle');

  if (!grid || !chipsEl || !treeEl) return;

  var mobileMq     = window.matchMedia('(max-width: 899px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state  = { category: 'all', sub: null };
  var chips  = {};   // id kategori -> tombol filter
  var groups = {};   // id kategori -> elemen accordion

  /* ---------- Util ---------- */
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function humanize(slug) {
    return String(slug).replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function findCategory(id) {
    for (var i = 0; i < catalog.length; i++) if (catalog[i].id === id) return catalog[i];
    return null;
  }

  function categoryLabel(id) {
    var c = findCategory(id);
    return c ? c.label : humanize(id);
  }

  function subLabel(catId, subId) {
    var c = findCategory(catId);
    if (c) {
      for (var i = 0; i < c.subcategories.length; i++) {
        if (c.subcategories[i].id === subId) return c.subcategories[i].label;
      }
    }
    return humanize(subId);
  }

  // Bantu mendeteksi salah ketik pada data produk
  products.forEach(function (p) {
    var c = findCategory(p.category);
    if (!c) {
      console.warn('[products.js] Kategori tidak dikenal untuk "' + p.name + '": ' + p.category);
    } else if (p.subcategory && !c.subcategories.some(function (s) { return s.id === p.subcategory; })) {
      console.warn('[products.js] Subkategori tidak dikenal untuk "' + p.name + '": ' + p.subcategory);
    }
  });

  /* ---------- Ikon SVG statis (tanpa bergantung icon font) ---------- */
  var ICON_IMAGE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 16l-5.2-5.2a1.5 1.5 0 0 0-2.1 0L5 19.5"/></svg>';
  var ICON_BOX =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';

  /* ---------- Bangun filter kategori utama ---------- */
  function buildChips() {
    var items = [{ id: 'all', label: 'All' }].concat(
      catalog.map(function (c) { return { id: c.id, label: c.label }; })
    );
    items.forEach(function (item) {
      var b = el('button', 'cat-chip', item.label);
      b.type = 'button';
      b.dataset.category = item.id;
      b.setAttribute('aria-pressed', 'false');
      chipsEl.appendChild(b);
      chips[item.id] = b;
    });
  }

  /* ---------- Bangun sidebar (accordion) ---------- */
  function buildTree() {
    catalog.forEach(function (cat) {
      var panelId = 'cat-panel-' + cat.id;

      var group = el('div', 'cat-group is-open');
      group.dataset.category = cat.id;

      var btn = el('button', 'cat-group-btn');
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-controls', panelId);
      btn.appendChild(el('span', 'cat-group-label', cat.label));
      var chev = el('span', 'cat-chevron');
      chev.setAttribute('aria-hidden', 'true');
      btn.appendChild(chev);

      var panel = el('div', 'cat-panel');
      panel.id = panelId;
      var inner = el('div', 'cat-panel-inner');
      var list = el('ul', 'cat-sublist');

      cat.subcategories.forEach(function (sub) {
        var li = el('li');
        var sb = el('button', 'cat-sub', sub.label);
        sb.type = 'button';
        sb.dataset.category = cat.id;
        sb.dataset.sub = sub.id;
        li.appendChild(sb);
        list.appendChild(li);
      });

      inner.appendChild(list);
      panel.appendChild(inner);
      group.appendChild(btn);
      group.appendChild(panel);
      treeEl.appendChild(group);

      groups[cat.id] = { group: group, btn: btn, inner: inner };
    });
  }

  function setGroupOpen(catId, open) {
    var g = groups[catId];
    if (!g) return;
    g.group.classList.toggle('is-open', open);
    g.btn.setAttribute('aria-expanded', String(open));
    if ('inert' in g.inner) g.inner.inert = !open;   // isi yang tertutup tidak bisa difokus keyboard
  }

  /* ---------- Kartu produk ---------- */
  function showPlaceholder(media, img) {
    media.classList.add('is-missing');
    if (img && img.parentNode) img.remove();
    var ph = el('div', 'cat-placeholder');
    ph.innerHTML = ICON_IMAGE;                         // string statis, bukan data pengguna
    ph.appendChild(el('span', null, 'Foto produk belum tersedia'));
    media.appendChild(ph);
  }

  function createCard(p, index) {
    var card = el('article', 'cat-card');
    card.style.setProperty('--i', Math.min(index, 8));

    var media = el('div', 'cat-image');
    if (p.image) {
      var img = document.createElement('img');
      img.alt = p.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', function () { showPlaceholder(media, img); }, { once: true });
      img.src = p.image;
      media.appendChild(img);
    } else {
      showPlaceholder(media, null);
    }

    var info = el('div', 'cat-info');
    info.appendChild(el('p', 'cat-label', categoryLabel(p.category)));
    info.appendChild(el('h3', 'cat-name', p.name));

    card.appendChild(media);
    card.appendChild(info);
    return card;
  }

  function createEmpty() {
    var box = el('div', 'cat-empty');
    box.innerHTML = ICON_BOX;                          // string statis
    box.appendChild(el('p', null, 'Produk pada kategori ini sedang dipersiapkan.'));
    if (state.category !== 'all' || state.sub) {
      var btn = el('button', 'cat-empty-btn', 'Lihat semua produk');
      btn.type = 'button';
      btn.addEventListener('click', function () { setFilter('all', null); });
      box.appendChild(btn);
    }
    return box;
  }

  /* ---------- Render ---------- */
  function matches(p) {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.sub && p.subcategory !== state.sub) return false;
    return true;
  }

  function updateStatus(count) {
    var scope = 'Semua produk';
    if (state.category !== 'all') {
      scope = categoryLabel(state.category);
      if (state.sub) scope += ' \u203A ' + subLabel(state.category, state.sub);
    }
    statusEl.textContent = '';
    statusEl.appendChild(el('strong', null, scope));
    statusEl.appendChild(document.createTextNode(' \u00B7 ' + count + ' produk'));
  }

  function updateControls() {
    Object.keys(chips).forEach(function (id) {
      chips[id].setAttribute('aria-pressed', String(id === state.category));
    });
    Object.keys(groups).forEach(function (id) {
      groups[id].group.classList.toggle('is-current', id === state.category);
    });
    treeEl.querySelectorAll('.cat-sub').forEach(function (b) {
      var active = b.dataset.category === state.category && b.dataset.sub === state.sub;
      if (active) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  function render() {
    var list = products.filter(matches);
    var frag = document.createDocumentFragment();

    if (!list.length) {
      frag.appendChild(createEmpty());
    } else {
      list.forEach(function (p, i) { frag.appendChild(createCard(p, i)); });
    }

    grid.textContent = '';
    grid.appendChild(frag);
    updateStatus(list.length);
    updateControls();
  }

  function setFilter(category, sub) {
    state.category = category;
    state.sub = sub || null;
    if (category !== 'all') setGroupOpen(category, true);
    render();
  }

  /* ---------- Sidebar versi mobile (dropdown di atas) ---------- */
  function syncSideA11y() {
    if (!side || !sideToggle) return;
    if (mobileMq.matches) {
      sideToggle.removeAttribute('aria-disabled');
      sideToggle.tabIndex = 0;
      sideToggle.setAttribute('aria-expanded', String(!side.classList.contains('is-collapsed')));
    } else {
      sideToggle.setAttribute('aria-disabled', 'true');
      sideToggle.tabIndex = -1;
      sideToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function setSideCollapsed(collapsed) {
    side.classList.toggle('is-collapsed', collapsed);
    syncSideA11y();
  }

  /* ---------- Event ---------- */
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.cat-chip');
    if (b) setFilter(b.dataset.category, null);
  });

  treeEl.addEventListener('click', function (e) {
    var sub = e.target.closest('.cat-sub');
    if (sub) {
      setFilter(sub.dataset.category, sub.dataset.sub);
      if (mobileMq.matches) {
        setSideCollapsed(true);
        toolbar.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    var head = e.target.closest('.cat-group-btn');
    if (head) {
      var group = head.closest('.cat-group');
      setGroupOpen(group.dataset.category, !group.classList.contains('is-open'));
    }
  });

  if (sideToggle) {
    sideToggle.addEventListener('click', function () {
      if (!mobileMq.matches) return;
      setSideCollapsed(!side.classList.contains('is-collapsed'));
    });
  }

  if (mobileMq.addEventListener) mobileMq.addEventListener('change', syncSideA11y);
  else if (mobileMq.addListener) mobileMq.addListener(syncSideA11y);

  /* ---------- Mulai ---------- */
  buildChips();
  buildTree();
  Object.keys(groups).forEach(function (id) { setGroupOpen(id, true); });
  syncSideA11y();
  render();
})();
