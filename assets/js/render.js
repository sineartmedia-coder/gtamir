/*
  Tamirci — sayfa şablonları.
  Panel "Yayınla" dediğinde index.html bu dosyadaki page() fonksiyonuyla baştan üretilir.
  Böylece yayındaki sayfa düz HTML olur (arama motorları içeriği doğrudan okur).
*/
(function (g) {
  'use strict';

  /* ---------- yardımcılar ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // *yıldız* arası vurgulanır, satır sonu <br> olur
  function rich(s) {
    return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\*/g, ''); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function json(o) { return JSON.stringify(o).replace(/</g, '\\u003c'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var TR = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  function slug(s) {
    return String(s || '').replace(/[çğıİöşüÇĞÖŞÜ]/g, function (c) { return TR[c]; })
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bolum';
  }

  function telHref(S) {
    var d = digits(S.phone);
    if (d.indexOf('0') === 0) d = '90' + d.slice(1);
    else if (d.length === 10) d = '90' + d;
    return 'tel:+' + d;
  }
  function waHref(S, msg) {
    return 'https://wa.me/' + digits(S.whatsapp) + '?text=' + encodeURIComponent(msg || 'Merhaba, web sitenizden ulaşıyorum. Teklif almak istiyorum.');
  }
  // panelde "tel" veya "whatsapp" yazılırsa otomatik bağlantı olur
  function link(v, S) {
    if (v === 'tel') return telHref(S);
    if (v === 'whatsapp') return waHref(S);
    return v || '#iletisim';
  }
  function siteUrl(D) { return String(D.seo.siteUrl || '').replace(/\/+$/, ''); }
  function abs(D, u) {
    if (!u || /^(https?:|data:)/.test(u)) return u || '';
    var b = siteUrl(D);
    return b ? b + '/' + u.replace(/^\.?\//, '') : u;
  }

  /* ---------- renk ---------- */
  function accentInk(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#121417';
    var n = parseInt(m[1], 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L > 0.22 ? '#121417' : '#ffffff';
  }
  // "HMK" + "TEKNİK" bitişik yazılmasın
  function logoTxt(St) {
    return esc(St.logoText) + (St.logoText && St.logoAccent ? ' ' : '') + '<b>' + esc(St.logoAccent) + '</b>';
  }
  function rootStyle(D) {
    var a = D.settings.accent || '#FFC20E';
    return '--accent:' + a + ';--accent-ink:' + accentInk(a);
  }
  function applyRoot(D, el) {
    var a = D.settings.accent || '#FFC20E';
    el.style.setProperty('--accent', a);
    el.style.setProperty('--accent-ink', accentInk(a));
  }

  /* ---------- görseller ---------- */
  function isUns(u) { return /^https:\/\/images\.unsplash\.com\//.test(u || ''); }
  function src(u, w) {
    if (!u) return '';
    if (isUns(u)) return u.split('?')[0] + '?auto=format&fit=crop&w=' + w + '&q=' + (w > 1600 ? 70 : 76);
    return u;
  }
  var WIDTHS = [480, 800, 1200, 1600, 2400];
  function img(u, o) {
    o = o || {};
    if (!u) return '<span class="ph' + (o.cls ? ' ' + o.cls : '') + '" aria-hidden="true"></span>';
    var max = o.max || 1600, h = '<img';
    if (o.cls) h += ' class="' + o.cls + '"';
    h += ' src="' + esc(src(u, Math.min(max, 1200))) + '"';
    if (isUns(u)) {
      h += ' srcset="' + esc(WIDTHS.filter(function (w) { return w <= max; }).map(function (w) { return src(u, w) + ' ' + w + 'w'; }).join(', ')) + '"';
      h += ' sizes="' + (o.sizes || '100vw') + '"';
    }
    h += ' alt="' + esc(o.alt || '') + '" width="' + (o.w || 1200) + '" height="' + (o.h || 800) + '"';
    h += o.eager ? (o.high ? ' fetchpriority="high"' : '') : ' loading="lazy"';
    if (o.parallax) h += ' data-parallax="' + o.parallax + '"';
    return h + ' decoding="async" draggable="false">';
  }

  /* ---------- ikonlar ---------- */
  var IC = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    helmet: '<path d="M2 18h20"/><path d="M4 18v-2a8 8 0 0 1 16 0v2"/><path d="M10 8V4h4v4"/>',
    ruler: '<path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    paint: '<rect x="2" y="2" width="16" height="6" rx="2"/><path d="M18 5h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8v3"/><rect x="10" y="14" width="4" height="8" rx="1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrows: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.8 4 12 4 12 4s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2c1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6z"/><path d="m10 15 5-3-5-3z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    quote: '<path d="M10 11H6a4 4 0 0 1 4-4V5a6 6 0 0 0-6 6v7h6zM20 11h-4a4 4 0 0 1 4-4V5a6 6 0 0 0-6 6v7h6z"/>',
    whatsapp: '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41"/>'
  };
  var FILLED = { star: 1, quote: 1, whatsapp: 1 };
  function icon(n, cls) {
    return '<svg class="i' + (FILLED[n] ? ' i--f' : '') + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (IC[n] || IC.wrench) + '</svg>';
  }
  // HMK Teknik amblemi (vektör kaynağı: logo/ klasörü)
  var LOGO = '<svg class="logo__mark" viewBox="92 84 834 794" aria-hidden="true"><g fill="var(--accent)" fill-rule="evenodd"><path d="M119 645 A396 396 0 0 1 456 193 L456 227 A362 362 0 0 0 153 645Z"/><path d="M691 233 A396 396 0 0 1 901 645 L867 645 A362 362 0 0 0 691 272Z"/><path d="M772 574 L772 486 A14 14 0 0 1 800 486 L800 596 Z"/><path d="M217 645 L293 645 L562 477 L778 645 L844 645 L565 428Z"/><path d="M347 507 L116 621 L116 621 L116 623 L116 624 L116 625 L116 626 L116 627 L116 629 L117 630 L117 631 L117 632 L117 633 L117 635 L117 636 L117 637 L118 638 L118 640 L118 641 L118 642 L118 643 L118 644 L119 645 L153 645 L347 549Z"/><path d="M375 401 L322 375 L239 420 L239 547 L257 538 L257 431 L313 400 L313 510 L331 501 L331 399 L357 412 L357 544 L375 532Z"/><path d="M450 243 L407 265 L334 302 L334 368 L352 376 L352 313 L389 294 L389 524 L450 486Z"/><path d="M540 285 L540 429 L566 413 L604 443 L604 140 L661 182 L661 294 L679 288 L679 173 L586 104 L468 160 L468 225ZM468 235 L468 474 L492 460 L492 255ZM498 455 L532 434 L532 288 L498 261Z"/><path d="M619 455 L715 530 L715 329 L737 345 L737 547 L755 561 L755 336 L697 294 L619 322Z"/><path d="M112 668 L112 736 L112 790 L112 858 L178 858 L178 790 L264 790 L264 858 L330 858 L330 790 L330 736 L330 668 L264 668 L264 736 L178 736 L178 668ZM406 858 L406 750 L465 808 L524 750 L524 858 L590 858 L590 668 L524 668 L465 726 L406 668 L340 668 L340 858ZM666 668 L600 668 L600 858 L666 858 L666 840 L676 829 L719 858 L830 858 L718 783 L822 668 L738 668 L666 748Z"/><rect x="497" y="549" width="46" height="41" rx="5"/><rect x="552" y="549" width="46" height="41" rx="5"/><rect x="497" y="599" width="46" height="41" rx="5"/><rect x="552" y="599" width="46" height="41" rx="5"/></g></svg>';

  /* ---------- ortak parçalar ---------- */
  function vis(D) { return D.sections.filter(function (s) { return s.visible !== false; }); }
  function navItems(D) { return vis(D).filter(function (s) { return s.nav; }); }
  function firstOf(D, type) { for (var i = 0, v = vis(D); i < v.length; i++) if (v[i].type === type) return v[i]; return null; }

  function head(s, o) {
    o = o || {};
    var h = '<div class="sec-head' + (o.center ? ' sec-head--center' : '') + '" data-reveal>';
    if (s.eyebrow) h += '<p class="eyebrow">' + esc(s.eyebrow) + '</p>';
    if (s.title) h += '<h2 class="h2" id="' + esc(s.id) + '-t">' + rich(s.title) + '</h2>';
    if (s.text) h += '<p class="lead">' + rich(s.text) + '</p>';
    return h + '</div>';
  }
  function open(s, cls, extra) {
    return '<section id="' + esc(s.id) + '" class="sec ' + cls + ' tone-' + esc(s.tone || 'light') + '"' +
      (s.title ? ' aria-labelledby="' + esc(s.id) + '-t"' : '') + (extra || '') + '>';
  }
  // öncesi/sonrası karşılaştırma katmanları
  function baLayers(it, o) {
    var aged = !it.before || it.before === it.after;
    var alt = it.alt || it.title || '';
    return img(it.after, { cls: 'ba__img', alt: alt ? alt + ' – sonrası' : 'Sonrası', sizes: o.sizes, max: o.max, eager: o.eager, high: o.high, w: o.w, h: o.h }) +
      '<div class="ba__before' + (aged ? ' is-aged' : '') + '">' +
      img(aged ? it.after : it.before, { cls: 'ba__img', alt: alt ? alt + ' – öncesi' : 'Öncesi', sizes: o.sizes, max: o.max, eager: o.eager, w: o.w, h: o.h }) +
      '</div>';
  }
  function baLine(label) {
    return '<div class="ba__line"><span class="ba__tag ba__tag--before">Öncesi</span><span class="ba__tag ba__tag--after">Sonrası</span>' +
      '<button type="button" class="ba__handle" role="slider" aria-label="' + esc(label || 'Öncesi ve sonrası karşılaştırma') + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' + icon('arrows') + '</button></div>';
  }

  /* ---------- bölümler ---------- */
  var S = {};

  S.hero = function (s, D) {
    var slides = (s.slides || []).filter(function (x) { return x.after; });
    var h = '<section id="' + esc(s.id) + '" class="hero" aria-labelledby="' + esc(s.id) + '-t">';
    h += '<div class="hero__stage ba" data-ba data-hero><div class="hero__media">';
    slides.forEach(function (sl, i) {
      h += '<div class="ba__slide' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '">' +
        baLayers(sl, { sizes: '100vw', max: 2400, eager: i === 0, high: i === 0, w: 2400, h: 1600 }) + '</div>';
    });
    if (!slides.length) h += '<span class="ph"></span>';
    h += '</div><div class="hero__shade" aria-hidden="true"></div>' + baLine('Öncesi ve sonrası karşılaştırma çubuğu') + '</div>';
    h += '<div class="hero__content wrap">';
    if (s.eyebrow) h += '<p class="eyebrow eyebrow--glass">' + esc(s.eyebrow) + '</p>';
    h += '<h1 class="h1" id="' + esc(s.id) + '-t">' + rich(s.title) + '</h1>';
    if (s.text) h += '<p class="hero__text">' + rich(s.text) + '</p>';
    h += '<div class="hero__ctas">';
    if (s.btn1) h += '<a class="btn btn--accent btn--lg" href="' + esc(link(s.btn1Link, D.settings)) + '">' + esc(s.btn1) + icon('arrow') + '</a>';
    if (s.btn2) h += '<a class="btn btn--glass btn--lg" href="' + esc(waHref(D.settings)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(s.btn2) + '</a>';
    h += '</div></div>';
    h += '<div class="hero__dock wrap">';
    if (slides.length > 1) {
      h += '<div class="hero__tabs" role="tablist" aria-label="Oda seçin">';
      slides.forEach(function (sl, i) {
        h += '<button type="button" class="hero__tab" role="tab" aria-selected="' + (i === 0) + '" data-slide-to="' + i + '">' + esc(sl.label || ('Görsel ' + (i + 1))) + '</button>';
      });
      h += '</div>';
    }
    if (s.hint) h += '<p class="hero__hint">' + icon('arrows') + esc(s.hint) + '</p>';
    return h + '</div></section>';
  };

  S.marquee = function (s) {
    var items = (s.items || []).map(function (x) { return '<span>' + esc(x.text) + '</span><i aria-hidden="true">✦</i>'; }).join('');
    return '<section id="' + esc(s.id) + '" class="marquee tone-' + esc(s.tone || 'accent') + '" aria-label="Hizmet başlıkları">' +
      '<div class="marquee__track" data-marquee><div class="marquee__set">' + items + '</div><div class="marquee__set" aria-hidden="true">' + items + '</div></div></section>';
  };

  S.stats = function (s) {
    var h = open(s, 'stats', ' aria-label="Rakamlarla biz"') + '<div class="wrap stats__grid">';
    (s.items || []).forEach(function (x, i) {
      h += '<div class="stat" data-reveal style="--i:' + i + '"><p class="stat__num">' + (x.prefix ? '<em>' + esc(x.prefix) + '</em>' : '') + '<span data-count="' + esc(x.value) + '">' + esc(String(x.value).replace('.', ',')) + '</span>' + (x.suffix ? '<em>' + esc(x.suffix) + '</em>' : '') + '</p><p class="stat__label">' + esc(x.label) + '</p></div>';
    });
    return h + '</div></section>';
  };

  S.services = function (s) {
    var h = open(s, 'services') + '<div class="wrap">' + head(s) + '<div class="services__grid">';
    (s.items || []).forEach(function (x, i) {
      h += '<article class="svc" data-reveal style="--i:' + (i % 3) + '"><div class="svc__media">' +
        img(x.image, { alt: x.title + ' hizmeti', sizes: '(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw', max: 1200, w: 800, h: 600 }) +
        '</div><div class="svc__body"><span class="svc__no">' + pad(i + 1) + '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div></article>';
    });
    return h + '</div></div></section>';
  };

  S.morph = function (s) {
    var it = { after: s.after, before: s.before, alt: s.alt };
    var h = '<section id="' + esc(s.id) + '" class="morph" data-morph' + (s.title ? ' aria-labelledby="' + esc(s.id) + '-t"' : '') + '><div class="morph__sticky">';
    h += '<div class="morph__media">' + baLayers(it, { sizes: '100vw', max: 2400, w: 2400, h: 1600 }) + '<span class="morph__line" aria-hidden="true"></span></div>';
    h += '<div class="morph__shade" aria-hidden="true"></div><div class="morph__ui wrap"><div class="morph__top">';
    if (s.eyebrow) h += '<p class="eyebrow eyebrow--glass">' + esc(s.eyebrow) + '</p>';
    if (s.title) h += '<h2 class="h2" id="' + esc(s.id) + '-t">' + rich(s.title) + '</h2>';
    h += '<p class="morph__meter"><span class="morph__pct">%<b data-morph-pct>0</b></span>' + esc(s.meter || '') + '</p></div><ol class="morph__steps">';
    (s.items || []).forEach(function (x, i) {
      h += '<li class="' + (i === 0 ? 'is-on' : '') + '"><span>' + pad(i + 1) + '</span><strong>' + esc(x.title) + '</strong><p>' + esc(x.text) + '</p></li>';
    });
    return h + '</ol></div></div></section>';
  };

  S.gallery = function (s) {
    var h = open(s, 'gallery') + '<div class="wrap">' + head(s) + '<div class="gallery__grid">';
    (s.items || []).forEach(function (x, i) {
      h += '<figure class="proj" data-reveal style="--i:' + (i % 3) + '"><div class="ba ba--card" data-ba>' +
        baLayers({ after: x.after, before: x.before, alt: x.location + ' ' + x.title }, { sizes: '(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw', max: 1200, w: 900, h: 675 }) +
        baLine(x.title + ' öncesi ve sonrası') + '</div><figcaption><h3>' + esc(x.title) + '</h3><p>' +
        (x.location ? '<span>' + icon('pin') + esc(x.location) + '</span>' : '') +
        (x.duration ? '<span>' + icon('clock') + esc(x.duration) + '</span>' : '') + '</p></figcaption></figure>';
    });
    return h + '</div></div></section>';
  };

  S.process = function (s, D) {
    var h = open(s, 'process') + '<div class="wrap process__grid"><div class="process__aside">' + head(s);
    if (s.btn) h += '<a class="btn btn--dark" href="' + esc(link(s.btnLink, D.settings)) + '" data-reveal>' + esc(s.btn) + icon('arrow') + '</a>';
    h += '</div><ol class="process__list" data-process><span class="process__rail" aria-hidden="true"><i></i></span>';
    (s.items || []).forEach(function (x, i) {
      h += '<li class="step" data-reveal><span class="step__no">' + pad(i + 1) + '</span><div><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div></li>';
    });
    return h + '</ol></div></section>';
  };

  S.features = function (s) {
    var n = (s.items || []).length;
    var h = open(s, 'hscroll', ' data-hscroll') + '<div class="hscroll__sticky"><div class="wrap hscroll__head">' + head(s) +
      '<p class="hscroll__count" aria-hidden="true"><b data-hs-cur>01</b> / ' + pad(n) + '</p></div><div class="hscroll__track" data-hs-track>';
    (s.items || []).forEach(function (x, i) {
      h += '<article class="feat"><span class="feat__ic">' + icon(x.icon) + '</span><span class="feat__no" aria-hidden="true">' + pad(i + 1) + '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></article>';
    });
    return h + '</div><div class="wrap"><div class="hscroll__bar" aria-hidden="true"><i></i></div></div></div></section>';
  };

  S.about = function (s, D) {
    var h = open(s, 'about') + '<div class="wrap about__grid"><div class="about__media" data-reveal><div class="about__frame">' +
      img(s.image, { alt: s.alt || plain(s.title), sizes: '(min-width: 1000px) 560px, 100vw', max: 1600, w: 1000, h: 1250, parallax: '.12' }) + '</div>';
    if (s.badgeValue) h += '<div class="about__badge"><strong>' + esc(s.badgeValue) + '</strong><span>' + esc(s.badgeText) + '</span></div>';
    h += '</div><div class="about__text">' + head(s);
    if ((s.items || []).length) {
      h += '<ul class="checks">';
      s.items.forEach(function (x, i) { h += '<li data-reveal style="--i:' + i + '">' + icon('check') + esc(x.text) + '</li>'; });
      h += '</ul>';
    }
    if (s.btn) h += '<a class="btn btn--accent" href="' + esc(link(s.btnLink, D.settings)) + '" data-reveal>' + (s.btnLink === 'tel' ? icon('phone') : '') + esc(s.btn) + '</a>';
    return h + '</div></div></section>';
  };

  S.text = function (s, D) {
    var hasImg = !!s.image;
    var h = open(s, 'textsec' + (hasImg ? ' textsec--img' : '') + (s.imageSide === 'left' ? ' textsec--left' : '')) + '<div class="wrap textsec__grid"><div class="textsec__body">' + head(s);
    if (s.body) h += '<div class="textsec__prose" data-reveal>' + s.body.split(/\n{2,}/).map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('') + '</div>';
    if (s.btn) h += '<a class="btn btn--accent" href="' + esc(link(s.btnLink, D.settings)) + '" data-reveal>' + esc(s.btn) + icon('arrow') + '</a>';
    h += '</div>';
    if (hasImg) h += '<div class="textsec__media" data-reveal>' + img(s.image, { alt: s.alt || plain(s.title), sizes: '(min-width: 1000px) 560px, 100vw', max: 1600, w: 1000, h: 750 }) + '</div>';
    return h + '</div></section>';
  };

  S.testimonials = function (s) {
    var cards = (s.items || []).map(function (x) {
      var st = Math.max(0, Math.min(5, parseInt(x.stars, 10) || 5)), stars = '';
      for (var i = 0; i < 5; i++) stars += icon('star', i < st ? '' : 'is-off');
      return '<figure class="rev"><div class="rev__stars" role="img" aria-label="5 üzerinden ' + st + ' yıldız">' + stars + '</div><blockquote>' + esc(x.text) + '</blockquote>' +
        '<figcaption><span class="rev__av" aria-hidden="true">' + esc(String(x.name || '?').charAt(0)) + '</span><span><strong>' + esc(x.name) + '</strong><small>' + esc(x.place) + '</small></span></figcaption></figure>';
    }).join('');
    return open(s, 'reviews') + '<div class="wrap">' + head(s) + '</div><div class="reviews__rail"><div class="reviews__track"><div class="reviews__set">' + cards +
      '</div><div class="reviews__set" aria-hidden="true">' + cards + '</div></div></div></section>';
  };

  S.faq = function (s, D) {
    var h = open(s, 'faq') + '<div class="wrap faq__grid"><div class="faq__aside">' + head(s);
    if (s.cardTitle) h += '<div class="faq__card" data-reveal><strong>' + esc(s.cardTitle) + '</strong><p>' + esc(s.cardText) + '</p><a class="btn btn--accent btn--sm" href="' + esc(waHref(D.settings)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'WhatsApp</a></div>';
    h += '</div><div class="faq__list">';
    (s.items || []).forEach(function (x, i) {
      h += '<details class="qa" data-reveal style="--i:' + (i % 4) + '"' + (i === 0 ? ' open' : '') + '><summary><h3>' + esc(x.q) + '</h3><span class="qa__ic" aria-hidden="true"></span></summary><div class="qa__a"><p>' + rich(x.a) + '</p></div></details>';
    });
    return h + '</div></div></section>';
  };

  S.cta = function (s, D) {
    var t = esc(s.ticker || ''), tk = '';
    for (var i = 0; i < 6; i++) tk += '<span>' + t + '</span><i>✦</i>';
    return '<section id="' + esc(s.id) + '" class="cta"' + (s.title ? ' aria-labelledby="' + esc(s.id) + '-t"' : '') + '>' +
      (t ? '<div class="cta__ticker" aria-hidden="true"><div data-scroll-x="30">' + tk + '</div></div>' : '') +
      '<div class="wrap cta__in" data-reveal><h2 class="h2" id="' + esc(s.id) + '-t">' + rich(s.title) + '</h2>' + (s.text ? '<p class="lead">' + rich(s.text) + '</p>' : '') +
      '<div class="cta__btns"><a class="cta__phone" href="' + esc(telHref(D.settings)) + '">' + icon('phone') + esc(D.settings.phone) + '</a>' +
      (s.btn ? '<a class="btn btn--dark btn--lg" href="' + esc(waHref(D.settings)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(s.btn) + '</a>' : '') +
      '</div></div></section>';
  };

  S.contact = function (s, D) {
    var St = D.settings, svc = firstOf(D, 'services');
    var h = open(s, 'contact') + '<div class="wrap"><div class="contact__grid"><div class="contact__info">' + head(s) + '<ul class="contact__list" data-reveal>';
    h += '<li><span class="contact__ic">' + icon('phone') + '</span><span><small>Telefon</small><a href="' + esc(telHref(St)) + '">' + esc(St.phone) + '</a></span></li>';
    if (St.whatsapp) h += '<li><span class="contact__ic contact__ic--wa">' + icon('whatsapp') + '</span><span><small>WhatsApp</small><a href="' + esc(waHref(St)) + '" target="_blank" rel="noopener">Mesaj gönderin</a></span></li>';
    if (St.email) h += '<li><span class="contact__ic">' + icon('mail') + '</span><span><small>E-posta</small><a href="mailto:' + esc(St.email) + '">' + esc(St.email) + '</a></span></li>';
    if (St.address) h += '<li><span class="contact__ic">' + icon('pin') + '</span><span><small>Adres</small><address>' + esc(St.address) + ', ' + esc(St.district) + ' / ' + esc(St.city) + '</address></span></li>';
    if (St.hours) h += '<li><span class="contact__ic">' + icon('clock') + '</span><span><small>Çalışma saatleri</small>' + esc(St.hours) + '</span></li>';
    h += '</ul></div><form class="cform" data-cform data-wa="' + esc(digits(St.whatsapp)) + '" novalidate data-reveal>';
    h += '<h3>' + esc(s.formTitle || 'Teklif formu') + '</h3><div class="cform__row">';
    h += '<label><span>Adınız Soyadınız</span><input name="ad" autocomplete="name" required></label>';
    h += '<label><span>Telefon</span><input name="tel" type="tel" autocomplete="tel" inputmode="tel" required></label></div>';
    if (svc && (svc.items || []).length) {
      h += '<label><span>Hizmet</span><select name="hizmet"><option value="">Seçiniz</option>';
      svc.items.forEach(function (x) { h += '<option>' + esc(x.title) + '</option>'; });
      h += '<option>Diğer</option></select></label>';
    }
    h += '<label><span>Kısaca işiniz</span><textarea name="mesaj" rows="4" placeholder="Örn: 3+1 daire komple tadilat ve dekorasyon"></textarea></label>';
    h += '<button class="btn btn--accent btn--lg btn--block" type="submit">' + icon('whatsapp') + 'WhatsApp ile Gönder</button>';
    if (s.formNote) h += '<p class="cform__note">' + esc(s.formNote) + '</p>';
    h += '</form></div>';
    if (s.showMap) {
      var q = s.mapQuery || [St.address, St.district, St.city].filter(Boolean).join(', ');
      h += '<div class="contact__map" data-reveal><iframe title="' + esc(St.businessName) + ' konumu" src="https://www.google.com/maps?q=' + esc(encodeURIComponent(q)) + '&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>';
    }
    return h + '</div></section>';
  };

  /* ---------- sayfa iskeleti ---------- */
  function header(D) {
    var St = D.settings, nav = navItems(D), first = vis(D)[0];
    var links = nav.map(function (s) { return '<a href="#' + esc(s.id) + '">' + esc(s.nav) + '</a>'; }).join('');
    var h = '<header class="hdr" id="hdr"><div class="wrap hdr__in">';
    h += '<a class="logo" href="#' + esc(first ? first.id : '') + '" aria-label="' + esc(St.businessName) + ' ana sayfa">' + LOGO + '<span class="logo__txt">' + logoTxt(St) + '</span></a>';
    h += '<nav class="hdr__nav" aria-label="Ana menü">' + links + '</nav>';
    h += '<div class="hdr__act"><a class="btn btn--accent btn--sm hdr__call" href="' + esc(telHref(St)) + '">' + icon('phone') + '<span>' + esc(St.phone) + '</span></a>';
    h += '<button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Menüyü aç"><span></span><span></span></button></div></div></header>';
    h += '<div class="mnav" id="mnav" aria-hidden="true"><nav class="mnav__links" aria-label="Mobil menü">' +
      nav.map(function (s, i) { return '<a href="#' + esc(s.id) + '" style="--i:' + i + '"><small>' + pad(i + 1) + '</small>' + esc(s.nav) + '</a>'; }).join('') +
      '</nav><div class="mnav__foot"><a class="btn btn--accent" href="' + esc(telHref(St)) + '">' + icon('phone') + esc(St.phone) + '</a>' +
      '<a class="btn btn--glass" href="' + esc(waHref(St)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'WhatsApp</a></div></div>';
    return h;
  }

  function footer(D) {
    var St = D.settings, svc = firstOf(D, 'services'), nav = navItems(D), year = new Date().getFullYear();
    var social = [['instagram', St.instagram, 'Instagram'], ['facebook', St.facebook, 'Facebook'], ['youtube', St.youtube, 'YouTube']]
      .filter(function (x) { return x[1]; })
      .map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener" aria-label="' + x[2] + '">' + icon(x[0]) + '</a>'; }).join('');
    var h = '<footer class="ftr"><div class="wrap"><div class="ftr__top">';
    h += '<div class="ftr__brand"><a class="logo" href="#' + esc((vis(D)[0] || {}).id || '') + '">' + LOGO + '<span class="logo__txt">' + logoTxt(St) + '</span></a><p>' + esc(St.footerText) + '</p>' + (social ? '<div class="social">' + social + '</div>' : '') + '</div>';
    if (svc) h += '<div class="ftr__col"><h3>Hizmetler</h3><ul>' + (svc.items || []).map(function (x) { return '<li><a href="#' + esc(svc.id) + '">' + esc(x.title) + '</a></li>'; }).join('') + '</ul></div>';
    if (nav.length) h += '<div class="ftr__col"><h3>Menü</h3><ul>' + nav.map(function (s) { return '<li><a href="#' + esc(s.id) + '">' + esc(s.nav) + '</a></li>'; }).join('') + '</ul></div>';
    h += '<div class="ftr__col"><h3>İletişim</h3><ul><li><a href="' + esc(telHref(St)) + '">' + esc(St.phone) + '</a></li>';
    if (St.email) h += '<li><a href="mailto:' + esc(St.email) + '">' + esc(St.email) + '</a></li>';
    if (St.address) h += '<li>' + esc(St.address) + ', ' + esc(St.district) + ' / ' + esc(St.city) + '</li>';
    if (St.hours) h += '<li>' + esc(St.hours) + '</li>';
    h += '</ul></div></div>';
    if (St.areas) h += '<p class="ftr__areas"><strong>Hizmet bölgelerimiz:</strong> ' + esc(St.areas) + '</p>';
    h += '<p class="ftr__big" aria-hidden="true">' + esc(St.logoText) + (St.logoText && St.logoAccent ? ' ' : '') + '<span>' + esc(St.logoAccent) + '</span></p>';
    // © işareti gizli panel girişidir
    h += '<div class="ftr__bottom"><p><button type="button" class="ftr__key" data-admin tabindex="-1" aria-hidden="true">©</button> <span data-year>' + year + '</span> ' + esc(St.businessName) + '. Tüm hakları saklıdır.</p>';
    h += '<p>' + esc(St.city) + ' ' + esc(String(St.slogan || '').toLocaleLowerCase('tr-TR')) + '</p></div></div></footer>';
    return h;
  }

  function extras(D) {
    var St = D.settings;
    return '<nav class="mbar" aria-label="Hızlı iletişim"><a href="' + esc(telHref(St)) + '">' + icon('phone') + '<span>Ara</span></a>' +
      '<a href="' + esc(waHref(St)) + '" target="_blank" rel="noopener" class="mbar__wa">' + icon('whatsapp') + '<span>WhatsApp</span></a>' +
      '<a href="#' + esc((firstOf(D, 'contact') || {}).id || 'iletisim') + '" class="mbar__cta">' + icon('calendar') + '<span>Teklif Al</span></a></nav>' +
      '<a class="wa-float" href="' + esc(waHref(St)) + '" target="_blank" rel="noopener" aria-label="WhatsApp ile yazın">' + icon('whatsapp') + '</a>';
  }

  function app(D) {
    var main = vis(D).map(function (s) { return S[s.type] ? S[s.type](s, D) : ''; }).join('\n');
    return header(D) + '\n<main id="main">\n' + main + '\n</main>\n' + footer(D) + extras(D);
  }

  /* ---------- SEO ---------- */
  function schema(D) {
    var St = D.settings, url = siteUrl(D), svc = firstOf(D, 'services'), faq = firstOf(D, 'faq');
    var biz = {
      '@type': 'HomeAndConstructionBusiness',
      '@id': (url ? url + '/' : '') + '#isletme',
      name: St.businessName,
      description: D.seo.description,
      telephone: telHref(St).replace('tel:', ''),
      priceRange: D.seo.priceRange || undefined,
      address: { '@type': 'PostalAddress', streetAddress: St.address, addressLocality: St.district, addressRegion: St.city, addressCountry: 'TR' },
      areaServed: String(St.areas || St.city).split(',').map(function (x) { return { '@type': 'Place', name: x.trim() }; }),
      openingHours: St.hoursSchema || undefined,
      foundingDate: D.seo.foundingYear || undefined
    };
    if (url) biz.url = url + '/';
    if (St.email) biz.email = St.email;
    if (D.seo.ogImage) biz.image = abs(D, src(D.seo.ogImage, 1200));
    var same = [St.instagram, St.facebook, St.youtube].filter(Boolean);
    if (same.length) biz.sameAs = same;
    if (svc && (svc.items || []).length) {
      biz.hasOfferCatalog = { '@type': 'OfferCatalog', name: 'Hizmetler', itemListElement: svc.items.map(function (x) {
        return { '@type': 'Offer', itemOffered: { '@type': 'Service', name: x.title, description: x.text, areaServed: St.city } };
      }) };
    }
    var graph = [biz, { '@type': 'WebSite', name: St.businessName, url: url ? url + '/' : undefined, inLanguage: 'tr-TR' }];
    if (faq && (faq.items || []).length) {
      graph.push({ '@type': 'FAQPage', mainEntity: faq.items.map(function (x) {
        return { '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } };
      }) });
    }
    return { '@context': 'https://schema.org', '@graph': graph };
  }

  function page(D) {
    var St = D.settings, seo = D.seo, url = siteUrl(D), hero = firstOf(D, 'hero');
    var og = seo.ogImage ? abs(D, src(seo.ogImage, 1200)) : '';
    var lcp = hero && (hero.slides || []).filter(function (x) { return x.after; })[0];
    var h = '<!doctype html>\n<html lang="tr" style="' + rootStyle(D) + '">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<title>' + esc(seo.title) + '</title>\n' +
      '<meta name="description" content="' + esc(seo.description) + '">\n' +
      (seo.keywords ? '<meta name="keywords" content="' + esc(seo.keywords) + '">\n' : '') +
      '<meta name="robots" content="index, follow, max-image-preview:large">\n' +
      (url ? '<link rel="canonical" href="' + esc(url) + '/">\n' : '') +
      '<meta name="theme-color" content="#121417">\n' +
      '<meta name="geo.region" content="TR">\n<meta name="geo.placename" content="' + esc(St.city) + '">\n' +
      '<meta property="og:type" content="website">\n<meta property="og:locale" content="tr_TR">\n' +
      '<meta property="og:site_name" content="' + esc(St.businessName) + '">\n' +
      '<meta property="og:title" content="' + esc(seo.title) + '">\n' +
      '<meta property="og:description" content="' + esc(seo.description) + '">\n' +
      (url ? '<meta property="og:url" content="' + esc(url) + '/">\n' : '') +
      (og ? '<meta property="og:image" content="' + esc(og) + '">\n' : '') +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      (JSON.stringify(D.sections).indexOf('images.unsplash.com') > -1 ? '<link rel="preconnect" href="https://images.unsplash.com">\n' : '') +
      (lcp && isUns(lcp.after) ? '<link rel="preload" as="image" href="' + esc(src(lcp.after, 1200)) + '" imagesrcset="' + esc(WIDTHS.map(function (w) { return src(lcp.after, w) + ' ' + w + 'w'; }).join(', ')) + '" imagesizes="100vw" fetchpriority="high">\n' : '') +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Manrope:wght@400..800&display=swap">\n' +
      '<link rel="stylesheet" href="assets/css/style.css">\n' +
      '<script>document.documentElement.classList.add(\'js\')</script>\n' +
      '<script type="application/ld+json">' + json(schema(D)) + '</script>\n' +
      '</head>\n<body>\n<a class="skip" href="#main">İçeriğe geç</a>\n<div class="progress" aria-hidden="true"></div>\n' +
      '<div id="app">\n' + app(D) + '\n</div>\n' +
      '<script type="application/json" id="site-data">' + json(D) + '</script>\n' +
      '<script src="assets/js/main.js" defer></script>\n</body>\n</html>\n';
    return h;
  }

  function sitemap(D) {
    var u = siteUrl(D), d = new Date();
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>' + esc(u) + '/</loc>\n    <lastmod>' +
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n';
  }
  function robots(D) {
    var u = siteUrl(D);
    return 'User-agent: *\nAllow: /\nDisallow: /_yedek/\n' + (u ? '\nSitemap: ' + u + '/sitemap.xml\n' : '');
  }

  g.TamirciRender = {
    page: page, app: app, sitemap: sitemap, robots: robots, applyRoot: applyRoot,
    esc: esc, plain: plain, slug: slug, src: src, icon: icon, IC: IC
  };
})(typeof window !== 'undefined' ? window : this);
