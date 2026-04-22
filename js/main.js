/* =========================================================
   K.M. Tanvir — site interactions
   - Navbar shadow on scroll
   - Mobile drawer
   - Theme toggle (light/dark, persisted)
   - Reveal on scroll
   - Active nav link
   - Publication search & filter
   - Inject current year
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Theme ---------- */
  const THEME_KEY = 'kmt-theme';
  const root = document.documentElement;

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      // Label shows the mode you'll switch TO (inverse of current)
      const toDark  = btn.querySelector('.mode-label-dark');   // shown when current = light
      const toLight = btn.querySelector('.mode-label-light');  // shown when current = dark
      if (toDark)  toDark.style.display  = t === 'dark' ? 'none'   : 'inline';
      if (toLight) toLight.style.display = t === 'dark' ? 'inline' : 'none';
    });
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  function toggleTheme() {
    const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(now);
    try { localStorage.setItem(THEME_KEY, now); } catch (e) { /* ignore */ }
  }

  /* ---------- Navbar shadow ---------- */
  function initNavShadow() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  function initDrawer() {
    const openBtn  = document.querySelector('[data-drawer-open]');
    const closeBtn = document.querySelector('[data-drawer-close]');
    const drawer   = document.querySelector('.drawer');
    if (!openBtn || !drawer) return;
    const open  = () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { drawer.classList.remove('open'); document.body.style.overflow = ''; };
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', (e) => {
      if (e.target.matches('a') || e.target === drawer) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-links a, .drawer nav a').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href === here || (here === '' && href === 'index.html') || (here === 'index.html' && href === './')) {
        a.classList.add('active');
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Publications search + filter ---------- */
  function initPubs() {
    const search = document.querySelector('#pub-search');
    const chips  = document.querySelectorAll('.chip[data-year]');
    const pubs   = document.querySelectorAll('.pub');
    const groups = document.querySelectorAll('.pub-year-group');
    const empty  = document.querySelector('#pub-empty');
    if (!search && !chips.length) return;

    let activeYear = 'all';
    let q = '';

    const apply = () => {
      let anyVisible = false;
      pubs.forEach(p => {
        const year = p.getAttribute('data-year');
        const text = (p.textContent || '').toLowerCase();
        const yearOk = activeYear === 'all' || activeYear === year;
        const qOk = !q || text.indexOf(q) !== -1;
        const show = yearOk && qOk;
        p.style.display = show ? '' : 'none';
        if (show) anyVisible = true;
      });
      // hide empty year groups
      groups.forEach(g => {
        const visiblePubs = g.querySelectorAll('.pub:not([style*="display: none"])');
        g.style.display = visiblePubs.length ? '' : 'none';
      });
      if (empty) empty.style.display = anyVisible ? 'none' : '';
    };

    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      activeYear = c.getAttribute('data-year');
      apply();
    }));

    if (search) search.addEventListener('input', (e) => {
      q = e.target.value.trim().toLowerCase();
      apply();
    });
  }

  /* ---------- Year in footer ---------- */
  function initYear() {
    const el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Search ---------- */
  // A small static index. Add/edit entries here as pages are added.
  const SEARCH_INDEX = [
    { title: 'Home',            meta: 'Page',         url: 'index.html' },
    { title: 'About',           meta: 'Page',         url: 'about.html' },
    { title: 'Research',        meta: 'Page',         url: 'research.html' },
    { title: 'Publications',    meta: 'Research · full list', url: 'research.html#publications' },
    { title: 'Teaching',        meta: 'Page',         url: 'teaching.html' },
    { title: 'Statistical Talks', meta: 'Page',       url: 'talks.html' },
    { title: 'Awards',          meta: 'Page',         url: 'awards.html' },
    { title: 'Contact',         meta: 'Page',         url: 'contact.html' },
    { title: 'Clinical trials methodology', meta: 'Research focus', url: 'research.html#interests' },
    { title: 'Machine Learning for Health Systems', meta: 'Research focus', url: 'research.html#interests' },
    { title: 'Maternal and newborn health', meta: 'Research focus', url: 'research.html#interests' },
    { title: 'Research grants', meta: 'Funded projects', url: 'research.html#grants' },
    { title: 'Education',       meta: 'About',        url: 'about.html#education' },
    { title: 'Experience',      meta: 'About',        url: 'about.html#experience' },
    { title: 'Additional crossovers in cluster randomised crossover trials do not always increase statistical power', meta: 'Clinical Trials · 2026', url: 'https://doi.org/10.1177/17407745261431140' },
    { title: 'Testing a reusable chemical warming pad and insulating jacket for hypothermia in preterm and low birthweight neonates', meta: 'Scientific Reports · 2025', url: 'https://doi.org/10.1038/s41598-025-96275-1' },
    { title: 'Introducing a standardised register for strengthening inpatient management of newborns and sick children in Bangladesh', meta: 'Journal of Global Health · 2024', url: 'https://doi.org/10.7189/jogh.14.04086' },
    { title: 'Lifestyle and environmental risk factors associated with cancer: a case control study in Bangladesh', meta: 'PLOS ONE · 2026', url: 'https://doi.org/10.1371/journal.pone.0328745' },
  ];

  function initSearch() {
    const btn     = document.querySelector('[data-search-open]');
    const overlay = document.querySelector('.search-overlay');
    const input   = document.querySelector('.search-input');
    const results = document.querySelector('.search-results');
    const closeBtn= document.querySelector('[data-search-close]');
    if (!btn || !overlay || !input || !results) return;

    function render(q) {
      q = (q || '').trim().toLowerCase();
      const list = q
        ? SEARCH_INDEX.filter(e => (e.title + ' ' + e.meta).toLowerCase().includes(q))
        : SEARCH_INDEX.slice(0, 8);
      if (!list.length) {
        results.innerHTML = '<div class="search-empty">No results for "' + q.replace(/</g,'&lt;') + '"</div>';
        return;
      }
      results.innerHTML = list.map(e => {
        const external = /^https?:/.test(e.url);
        const target = external ? ' target="_blank" rel="noopener"' : '';
        return '<a class="search-result" href="' + e.url + '"' + target + '>' +
               '<div class="sr-title">' + e.title + '</div>' +
               '<div class="sr-meta">' + e.meta + '</div></a>';
      }).join('');
    }

    function open() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      render('');
      setTimeout(() => input.focus(), 40);
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      input.value = '';
    }

    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
    });
    input.addEventListener('input', (e) => render(e.target.value));
  }

  /* ---------- Boot ---------- */
  initTheme();
  document.addEventListener('DOMContentLoaded', () => {
    initNavShadow();
    initDrawer();
    initActiveNav();
    initReveal();
    initPubs();
    initYear();
    initSearch();

    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) toggle.addEventListener('click', toggleTheme);
  });
})();
