/*
  Tamirci — site etkileşimleri
  Öncesi/sonrası çubuğu, kaydırmaya bağlı hareketler, mobil menü, teklif formu
  ve footer'daki gizli panel girişi.
*/
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, win = window;
  var reduce = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var BASE = (function () {
    var s = doc.currentScript && doc.currentScript.src;
    return s ? s.replace(/js\/main\.js(\?.*)?$/, '') : 'assets/';
  })();

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var els = { morph: [], hs: [], proc: [], par: [], sx: [], marq: [], nav: [] };
  var revealIo, countIo, marqIo;
  var lastY = win.scrollY, hdrY = lastY, vel = 0, dir = 1, ticking = false, loopOn = false;
  var vw = win.innerWidth, vh = win.innerHeight;

  /* ---------- öncesi / sonrası ---------- */
  function initBA(stage) {
    var handle = $('.ba__handle', stage), pos = 50, drag = null;

    function set(p) {
      pos = clamp(p, 0, 100);
      stage.style.setProperty('--pos', pos.toFixed(2) + '%');
      stage.classList.toggle('is-lo', pos < 16);
      stage.classList.toggle('is-hi', pos > 84);
      if (handle) handle.setAttribute('aria-valuenow', Math.round(pos));
    }
    function at(e) {
      var r = stage.getBoundingClientRect();
      return (e.clientX - r.left) / r.width * 100;
    }
    function touched() { stage._touched = true; stage.classList.add('is-touched'); }
    function begin(e) {
      drag.on = true; touched();
      try { stage.setPointerCapture(e.pointerId); } catch (x) { /* yok say */ }
      stage.classList.add('is-dragging');
      set(at(e));
    }

    stage.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || e.target.closest('a, input, select, textarea, .hero__tab')) return;
      var onHandle = handle && handle.contains(e.target);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false };
      // fare ile her yerden; dokunmatikte ise yatay hareket başlayınca sürüklenir
      if (e.pointerType === 'mouse' || onHandle) { begin(e); if (onHandle) e.preventDefault(); }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.on) {
        var dx = Math.abs(e.clientX - drag.x), dy = Math.abs(e.clientY - drag.y);
        if (dx > 6 && dx > dy) begin(e);
        else if (dy > 10) drag = null;
        return;
      }
      set(at(e));
    });
    stage.addEventListener('pointerup', function (e) {
      if (!drag) return;
      if (!drag.on && e.pointerType !== 'mouse') { touched(); set(at(e)); }
      drag = null; stage.classList.remove('is-dragging');
    });
    stage.addEventListener('pointercancel', function () { drag = null; stage.classList.remove('is-dragging'); });
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    if (handle) handle.addEventListener('keydown', function (e) {
      var st = e.shiftKey ? 10 : 4, k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowDown') set(pos - st);
      else if (k === 'ArrowRight' || k === 'ArrowUp') set(pos + st);
      else if (k === 'Home') set(0);
      else if (k === 'End') set(100);
      else return;
      e.preventDefault(); touched();
    });

    set(50);
    stage._set = set;
  }

  // açılışta çubuğu bir kez sağa sola gezdirip "sürüklenebilir" olduğunu gösterir
  function sweep(stage) {
    if (reduce || !stage || !stage._set) return;
    var keys = [[0, 50], [750, 76], [1650, 26], [2400, 50]], t0 = 0;
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function frame(ts) {
      if (stage._touched || !stage.isConnected) return;
      if (!t0) t0 = ts;
      var t = ts - t0;
      for (var i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          var a = keys[i - 1], b = keys[i];
          stage._set(a[1] + (b[1] - a[1]) * ease((t - a[0]) / (b[0] - a[0])));
          return win.requestAnimationFrame(frame);
        }
      }
      stage._set(50);
    }
    win.setTimeout(function () { win.requestAnimationFrame(frame); }, 1100);
  }

  function initHeroTabs(hero) {
    var tabs = $$('.hero__tab', hero), slides = $$('.ba__slide', hero);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, j) { x.setAttribute('aria-selected', String(j === i)); });
        slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      });
    });
  }

  /* ---------- mobil menü ---------- */
  function setMenu(open) {
    var b = $('.burger'), m = $('#mnav');
    if (!b || !m) return;
    root.classList.toggle('menu-open', open);
    b.setAttribute('aria-expanded', String(open));
    b.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    m.setAttribute('aria-hidden', String(!open));
    if (open && els.hdr) els.hdr.classList.remove('is-hidden');
  }
  function initMenu() {
    var b = $('.burger'), m = $('#mnav');
    if (!b || !m) return;
    b.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  /* ---------- teklif formu → WhatsApp ---------- */
  function initForms() {
    $$('[data-cform]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var el = f.elements, need = [el.ad, el.tel], bad = null;
        need.forEach(function (i) {
          var empty = !i.value.trim();
          i.classList.toggle('is-bad', empty);
          if (empty && !bad) bad = i;
        });
        if (bad) { bad.focus(); return; }
        var lines = ['Merhaba, web sitenizden teklif almak istiyorum.', 'Ad: ' + el.ad.value.trim(), 'Telefon: ' + el.tel.value.trim()];
        if (el.hizmet && el.hizmet.value) lines.push('Hizmet: ' + el.hizmet.value);
        if (el.mesaj && el.mesaj.value.trim()) lines.push('Not: ' + el.mesaj.value.trim());
        win.open('https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      });
      f.addEventListener('input', function (e) { if (e.target.classList) e.target.classList.remove('is-bad'); });
    });
  }

  /* ---------- sayaçlar ---------- */
  function fmt(n, dec) { return n.toLocaleString('tr-TR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function countUp(el) {
    var raw = String(el.getAttribute('data-count')).replace(',', '.'), to = parseFloat(raw);
    if (isNaN(to)) return;
    var dec = (raw.split('.')[1] || '').length, t0 = 0;
    function f(ts) {
      if (!t0) t0 = ts;
      var k = clamp((ts - t0) / 1800, 0, 1), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      el.textContent = fmt(to * e, dec);
      if (k < 1) win.requestAnimationFrame(f);
    }
    win.requestAnimationFrame(f);
  }

  /* ---------- ölçüm ---------- */
  // menü sığmıyorsa (dar ekran, panel açık ya da çok bölüm) hamburger menüye geçer
  function fitNav() {
    var h = els.hdr, nav = h && $('.hdr__nav', h);
    if (!nav) return;
    h.classList.remove('is-compact');
    if (win.getComputedStyle(nav).display === 'none') return;
    var inn = $('.hdr__in', h), cs = win.getComputedStyle(inn);
    var room = inn.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var need = $('.logo', h).offsetWidth + nav.scrollWidth + $('.hdr__act', h).offsetWidth + 48;
    if (need > room) h.classList.add('is-compact');
  }

  function layout() {
    vw = win.innerWidth; vh = win.innerHeight;
    fitNav();
    els.hs.forEach(function (o) {
      if (reduce) return;
      o.el.classList.add('is-pin');
      var cards = o.track.children, last = cards[cards.length - 1];
      if (!last) return;
      var padL = parseFloat(win.getComputedStyle(o.track).paddingLeft) || 0;
      var dist = Math.max(0, last.offsetLeft + last.offsetWidth + padL - o.track.clientWidth);
      if (dist < 40) { o.el.classList.remove('is-pin'); o.el.style.height = ''; o.track.style.transform = ''; o.dist = 0; return; }
      o.dist = dist;
      o.el.style.height = (o.sticky.offsetHeight + dist) + 'px';
    });
    els.marq.forEach(function (m) { m.w = m.el.firstElementChild ? m.el.firstElementChild.offsetWidth : 0; });
  }

  /* ---------- kaydırma döngüsü ---------- */
  function onScroll() {
    var y = win.scrollY;
    vel = y - lastY;
    if (vel) dir = vel > 0 ? 1 : -1;
    lastY = y;
    if (!ticking) { ticking = true; win.requestAnimationFrame(update); }
  }

  function update() {
    ticking = false;
    var y = win.scrollY, max = root.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : '0');

    var h = els.hdr;
    if (h) {
      h.classList.toggle('is-solid', y > 30);
      if (!root.classList.contains('menu-open')) {
        if (y > hdrY + 8 && y > 320) h.classList.add('is-hidden');
        else if (y < hdrY - 8 || y < 320) h.classList.remove('is-hidden');
      }
      hdrY = y;
    }

    // aktif menü bağlantısı
    var mark = vh * .35, cur = null;
    els.nav.forEach(function (n) { if (n.sec.getBoundingClientRect().top < mark) cur = n; });
    els.nav.forEach(function (n) { n.links.forEach(function (a) { a.classList.toggle('is-active', n === cur); }); });

    if (reduce) return;

    if (els.hero) {
      var hh = els.hero.offsetHeight;
      if (y < hh * 1.3) els.hero.style.setProperty('--hp', clamp(y / hh, 0, 1).toFixed(4));
    }

    els.morph.forEach(function (m) {
      var r = m.el.getBoundingClientRect(), total = r.height - vh;
      if (total <= 0 || r.bottom < 0 || r.top > vh) return;
      var raw = clamp(-r.top / total, 0, 1), p = clamp((raw - .1) / .78, 0, 1);
      m.el.style.setProperty('--p', p.toFixed(4));
      var n = m.steps.length, idx = Math.min(n - 1, Math.floor(p * n));
      m.steps.forEach(function (s, i) { s.classList.toggle('is-on', i === idx); });
      if (m.pct) m.pct.textContent = Math.round(p * 100);
    });

    els.hs.forEach(function (o) {
      if (!o.dist) return;
      var r = o.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = clamp(-r.top / o.dist, 0, 1);
      o.track.style.transform = 'translate3d(' + (-p * o.dist).toFixed(1) + 'px,0,0)';
      o.el.style.setProperty('--hp2', (.1 + p * .9).toFixed(4));
      if (o.cur) {
        var c = Math.min(o.n, 1 + Math.floor(p * o.n * .999));
        o.cur.textContent = (c < 10 ? '0' : '') + c;
      }
    });

    els.proc.forEach(function (o) {
      var r = o.el.getBoundingClientRect(), line = vh * .6;
      if (r.bottom < -200 || r.top > vh + 200) return;
      o.el.style.setProperty('--pp', clamp((line - r.top) / r.height, 0, 1).toFixed(4));
      o.steps.forEach(function (s) { s.classList.toggle('is-on', s.getBoundingClientRect().top < line); });
    });

    els.par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var sp = parseFloat(el.getAttribute('data-parallax')) || .1;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -sp).toFixed(1) + 'px,0)';
    });

    els.sx.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height), amt = parseFloat(el.getAttribute('data-scroll-x')) || 30;
      el.style.transform = 'translate3d(' + ((.5 - p) * amt).toFixed(2) + '%,0,0)';
    });
  }

  // kayan şerit: sürekli akar, kaydırma hızıyla hızlanır, kaydırma yönüyle yön değiştirir
  function loop() {
    vel *= .9;
    els.marq.forEach(function (m) {
      if (!m.vis || !m.w) return;
      m.x -= dir * (.55 + Math.min(Math.abs(vel), 80) * .22);
      if (m.x <= -m.w) m.x += m.w;
      if (m.x > 0) m.x -= m.w;
      m.el.style.transform = 'translate3d(' + m.x.toFixed(1) + 'px,0,0)';
    });
    if (els.marq.length) win.requestAnimationFrame(loop);
    else loopOn = false;
  }

  /* ---------- kurulum ---------- */
  function refresh(opts) {
    opts = opts || {};
    if (revealIo) revealIo.disconnect();
    if (countIo) countIo.disconnect();
    if (marqIo) marqIo.disconnect();
    root.classList.toggle('no-anim', !!opts.instant);

    els.hdr = $('#hdr');
    els.hero = $('.hero');
    els.morph = $$('[data-morph]').map(function (el) {
      if (reduce) { el.style.height = 'auto'; el.style.setProperty('--p', '.5'); }
      return { el: el, steps: $$('.morph__steps li', el), pct: $('[data-morph-pct]', el) };
    });
    els.hs = $$('[data-hscroll]').map(function (el) {
      return { el: el, sticky: $('.hscroll__sticky', el), track: $('[data-hs-track]', el), cur: $('[data-hs-cur]', el), n: $$('[data-hs-track] > *', el).length, dist: 0 };
    });
    els.proc = $$('[data-process]').map(function (el) { return { el: el, steps: $$('.step', el) }; });
    els.par = $$('[data-parallax]');
    els.sx = $$('[data-scroll-x]');
    els.marq = reduce ? [] : $$('[data-marquee]').map(function (el) { return { el: el, x: 0, w: 0, vis: true }; });
    els.nav = $$('.hdr__nav a[href^="#"]').map(function (a) {
      var id = a.getAttribute('href').slice(1), sec = doc.getElementById(id);
      return sec ? { sec: sec, links: $$('a[href="#' + id + '"]', $('.hdr__nav')) } : null;
    }).filter(Boolean);

    $$('[data-ba]').forEach(initBA);
    if (els.hero) {
      initHeroTabs(els.hero);
      if (!opts.instant) sweep($('[data-ba]', els.hero));
    }
    initMenu();
    initForms();
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var reveals = $$('[data-reveal]');
    if (opts.instant || reduce || !('IntersectionObserver' in win)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      revealIo = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIo.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
      reveals.forEach(function (el) { revealIo.observe(el); });
    }

    if (!opts.instant && !reduce && 'IntersectionObserver' in win) {
      countIo = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); countIo.unobserve(e.target); } });
      }, { threshold: .6 });
      $$('[data-count]').forEach(function (el) { el.textContent = '0'; countIo.observe(el); });
    }

    if (els.marq.length && 'IntersectionObserver' in win) {
      marqIo = new IntersectionObserver(function (en) {
        en.forEach(function (e) { els.marq.forEach(function (m) { if (m.el === e.target) m.vis = e.isIntersecting; }); });
      });
      els.marq.forEach(function (m) { marqIo.observe(m.el); });
    }

    layout();
    update();
    if (els.marq.length && !loopOn) { loopOn = true; win.requestAnimationFrame(loop); }
  }

  /* ---------- gizli panel ---------- */
  function load(src) {
    return new Promise(function (res, rej) {
      var s = doc.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      doc.body.appendChild(s);
    });
  }
  function openPanel() {
    if (win.TamirciPanel) { win.TamirciPanel.open(); return; }
    if (!$('link[data-panel-css]')) {
      var l = doc.createElement('link');
      l.rel = 'stylesheet'; l.href = BASE + 'css/panel.css'; l.setAttribute('data-panel-css', '');
      doc.head.appendChild(l);
    }
    load(BASE + 'js/render.js')
      .then(function () { return load(BASE + 'js/varsayilan.js'); })
      .then(function () { return load(BASE + 'js/panel.js'); })
      .then(function () { win.TamirciPanel.open(); })
      .catch(function () { win.alert('Panel dosyaları yüklenemedi.'); });
  }

  /* ---------- genel olaylar (bir kez) ---------- */
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', function () {
    // mobilde adres çubuğu açılıp kapanınca gereksiz yeniden hesaplamayı önler
    if (win.innerWidth === vw && Math.abs(win.innerHeight - vh) < 120) return;
    layout(); update();
  });
  win.addEventListener('load', function () { layout(); update(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });
  doc.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-admin]')) { e.preventDefault(); openPanel(); }
  });
  function checkHash() { if (win.location.hash === '#yonetim') openPanel(); }
  win.addEventListener('hashchange', checkHash);

  win.TamirciApp = { refresh: refresh, openPanel: openPanel, layout: function () { layout(); update(); } };
  refresh();
  checkHash();
})();
