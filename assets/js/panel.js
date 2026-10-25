/*
  Tamirci — yönetim paneli
  Footer'daki © işaretine (ya da adresin sonuna #yonetim) tıklanınca yüklenir.

  Çalışma şekli:
  - Değişiklikler anında sayfada önizlenir ve bu tarayıcıda "taslak" olarak saklanır.
  - "Yayınla" index.html'i baştan üretir: site klasörüne doğrudan kaydeder (Chrome/Edge)
    ya da indirilecek dosya olarak verir (Safari/Firefox).
*/
(function () {
  'use strict';

  var R = window.TamirciRender, DEF = window.TamirciVarsayilan;
  var doc = document, root = doc.documentElement, win = window;
  var DRAFT = 'tamirci-taslak', AUTH = 'tamirci-oturum', SALT = 'tamirci::';
  var esc = R.esc, plain = R.plain;
  var FS = 'showDirectoryPicker' in win;

  var published = null, data = null, ui = null, body = null, fab = null;
  var tab = 'sections', openSec = -1, openItem = {}, picker = false;
  var dirHandle = null, renderT = 0, saveT = 0, toastT = 0;

  /* ---------- SHA-256 (şifre kontrolü) ---------- */
  function sha256(str) {
    var ascii = unescape(encodeURIComponent(str));
    var i, j, maxWord = Math.pow(2, 32), result = '', words = [], bitLen = ascii.length * 8;
    var hash = [], k = [], primeCounter = 0, isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (Math.pow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (bitLen / maxWord) | 0;
    words[words.length] = bitLen;
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  /* ---------- bölüm tanımları ---------- */
  function F(k, l, t, x) {
    var f = { k: k, l: l, t: t || 'text' };
    if (x) for (var n in x) f[n] = x[n];
    return f;
  }
  var HEAD = [
    F('eyebrow', 'Üst küçük yazı'),
    F('title', 'Başlık', 'textarea', { rows: 2, h: '*yıldız* arasına aldığınız kelimeler renkli görünür.' }),
    F('text', 'Açıklama', 'textarea')
  ];
  var BEFORE_H = { h: 'Boş bırakırsanız sonrası görseli eskitilerek "öncesi" gibi gösterilir. Gerçek öncesi fotoğrafınızı yüklemeniz önerilir.' };
  var LINK_H = { h: 'Bölüm için #iletisim gibi yazın. Arama için tel, WhatsApp için whatsapp yazın.' };
  var TONES = [['light', 'Açık (krem)'], ['white', 'Beyaz'], ['dark', 'Koyu']];
  var ICONS = [['ruler', 'Metre / keşif'], ['tag', 'Etiket / fiyat'], ['clock', 'Saat / zaman'], ['spark', 'Parıltı / temizlik'],
    ['shield', 'Kalkan / garanti'], ['helmet', 'Baret / ekip'], ['wrench', 'Anahtar / tamir'], ['home', 'Ev'], ['users', 'İnsanlar'],
    ['calendar', 'Takvim'], ['paint', 'Boya rulosu'], ['phone', 'Telefon'], ['check', 'Onay'], ['star', 'Yıldız']];

  var TYPES = {
    hero: {
      name: 'Giriş — Öncesi / Sonrası', desc: 'Tam ekran, sürüklenebilir öncesi-sonrası alanı ve ana başlık.', icon: 'home', single: true,
      fields: [F('eyebrow', 'Üst küçük yazı'), F('title', 'Ana başlık (H1)', 'textarea', { rows: 2, h: '*yıldız* arasına aldığınız kelimeler renkli görünür.' }), F('text', 'Açıklama', 'textarea'),
        F('btn1', '1. buton yazısı'), F('btn1Link', '1. buton bağlantısı', 'text', LINK_H), F('btn2', 'WhatsApp butonu yazısı', 'text', { h: 'Boş bırakılırsa buton gizlenir.' }), F('hint', 'Sürükleme ipucu')],
      list: { key: 'slides', label: 'Öncesi / sonrası görselleri', item: 'Oda', title: 'label',
        fields: [F('label', 'Sekme adı (ör. Mutfak)'), F('after', 'SONRASI görseli', 'image'), F('before', 'ÖNCESİ görseli', 'image', BEFORE_H), F('alt', 'Görsel açıklaması (SEO)')],
        blank: { label: 'Yeni oda', after: '', before: '', alt: '' } }
    },
    marquee: {
      name: 'Kayan yazı şeridi', desc: 'Kaydırma hızıyla akan, yön değiştiren büyük yazı şeridi.', icon: 'arrows',
      tones: [['accent', 'Vurgu rengi'], ['dark', 'Koyu'], ['light', 'Açık']], fields: [],
      list: { key: 'items', label: 'Yazılar', item: 'Yazı', title: 'text', fields: [F('text', 'Yazı')], blank: { text: 'Yeni hizmet' } }
    },
    stats: {
      name: 'Rakamlar', desc: 'Ekrana gelince sayarak artan rakamlar.', icon: 'calendar', tones: TONES, fields: [],
      list: { key: 'items', label: 'Rakamlar', item: 'Rakam', title: 'label',
        fields: [F('prefix', 'Önek (ör. %)'), F('value', 'Sayı'), F('suffix', 'Sonek (ör. +, yıl)'), F('label', 'Açıklama')],
        blank: { prefix: '', value: '10', suffix: '+', label: 'Yeni rakam' } }
    },
    services: {
      name: 'Hizmetler', desc: 'Görselli hizmet kartları.', icon: 'wrench', tones: TONES, fields: HEAD,
      list: { key: 'items', label: 'Hizmetler', item: 'Hizmet', title: 'title',
        fields: [F('title', 'Hizmet adı'), F('text', 'Açıklama', 'textarea'), F('image', 'Görsel', 'image')],
        blank: { title: 'Yeni hizmet', text: '', image: '' } }
    },
    morph: {
      name: 'Kaydırınca dönüşüm', desc: 'Sayfa kaydırıldıkça görsel öncesinden sonrasına dönüşür.', icon: 'spark',
      fields: [F('eyebrow', 'Üst küçük yazı'), F('title', 'Başlık', 'textarea', { rows: 2 }), F('after', 'SONRASI görseli', 'image'), F('before', 'ÖNCESİ görseli', 'image', BEFORE_H),
        F('alt', 'Görsel açıklaması (SEO)'), F('meter', 'Yüzdenin yanındaki yazı')],
      list: { key: 'items', label: 'Aşamalar', item: 'Aşama', title: 'title', fields: [F('title', 'Aşama adı'), F('text', 'Açıklama', 'textarea')], blank: { title: 'Yeni aşama', text: '' } }
    },
    gallery: {
      name: 'Öncesi / Sonrası galerisi', desc: 'Her biri sürüklenebilir proje kartları.', icon: 'home', tones: TONES, fields: HEAD,
      list: { key: 'items', label: 'Projeler', item: 'Proje', title: 'title',
        fields: [F('title', 'Proje adı'), F('location', 'Semt'), F('duration', 'Süre (ör. 5 gün)'), F('after', 'SONRASI görseli', 'image'), F('before', 'ÖNCESİ görseli', 'image', BEFORE_H)],
        blank: { title: 'Yeni proje', location: '', duration: '', after: '', before: '' } }
    },
    process: {
      name: 'Çalışma süreci', desc: 'Kaydırdıkça dolan adım çizgisi.', icon: 'check', tones: TONES,
      fields: HEAD.concat([F('btn', 'Buton yazısı'), F('btnLink', 'Buton bağlantısı', 'text', LINK_H)]),
      list: { key: 'items', label: 'Adımlar', item: 'Adım', title: 'title', fields: [F('title', 'Adım adı'), F('text', 'Açıklama', 'textarea')], blank: { title: 'Yeni adım', text: '' } }
    },
    features: {
      name: 'Yatay kayan kartlar', desc: 'Aşağı kaydırdıkça yana kayan "Neden biz?" kartları.', icon: 'shield', tones: TONES, fields: HEAD,
      list: { key: 'items', label: 'Kartlar', item: 'Kart', title: 'title',
        fields: [F('icon', 'İkon', 'select', { o: ICONS }), F('title', 'Başlık'), F('text', 'Açıklama', 'textarea')],
        blank: { icon: 'check', title: 'Yeni kart', text: '' } }
    },
    about: {
      name: 'Hakkımızda', desc: 'Görsel, rozet ve madde listesi.', icon: 'users', tones: TONES,
      fields: [F('eyebrow', 'Üst küçük yazı'), F('title', 'Başlık', 'textarea', { rows: 2 }), F('text', 'Açıklama', 'textarea', { rows: 5 }), F('image', 'Görsel', 'image'),
        F('alt', 'Görsel açıklaması (SEO)'), F('badgeValue', 'Rozet sayısı (ör. 15+)'), F('badgeText', 'Rozet yazısı'), F('btn', 'Buton yazısı'), F('btnLink', 'Buton bağlantısı', 'text', LINK_H)],
      list: { key: 'items', label: 'Maddeler', item: 'Madde', title: 'text', fields: [F('text', 'Madde')], blank: { text: 'Yeni madde' } }
    },
    text: {
      name: 'Metin + görsel', desc: 'Serbest yazı bölümü. Uzun SEO metinleri için uygundur.', icon: 'paint', tones: TONES,
      fields: HEAD.concat([F('body', 'Uzun metin', 'textarea', { rows: 8, h: 'Paragrafları boş bir satırla ayırın.' }), F('image', 'Görsel (isteğe bağlı)', 'image'),
        F('alt', 'Görsel açıklaması'), F('imageSide', 'Görsel konumu', 'select', { o: [['right', 'Sağda'], ['left', 'Solda']] }), F('btn', 'Buton yazısı'), F('btnLink', 'Buton bağlantısı', 'text', LINK_H)]),
      blank: { eyebrow: 'Yeni bölüm', title: 'Başlığınızı *buraya* yazın', text: '', body: 'Metninizi buraya yazın.', image: '', alt: '', imageSide: 'right', btn: '', btnLink: '#iletisim' }
    },
    testimonials: {
      name: 'Müşteri yorumları', desc: 'Kendiliğinden kayan yorum kartları.', icon: 'star', tones: TONES, fields: HEAD,
      list: { key: 'items', label: 'Yorumlar', item: 'Yorum', title: 'name',
        fields: [F('name', 'Ad'), F('place', 'Semt · Hizmet'), F('stars', 'Yıldız (1–5)', 'number'), F('text', 'Yorum', 'textarea')],
        blank: { name: 'Yeni müşteri', place: '', stars: 5, text: '' } }
    },
    faq: {
      name: 'Sıkça sorulan sorular', desc: 'Açılır sorular. Google için SSS işaretlemesi otomatik eklenir.', icon: 'quote', tones: TONES,
      fields: HEAD.concat([F('cardTitle', 'WhatsApp kartı başlığı'), F('cardText', 'WhatsApp kartı yazısı')]),
      list: { key: 'items', label: 'Sorular', item: 'Soru', title: 'q', fields: [F('q', 'Soru'), F('a', 'Cevap', 'textarea')], blank: { q: 'Yeni soru?', a: '' } }
    },
    cta: {
      name: 'Çağrı bandı', desc: 'Büyük telefon numarası ve WhatsApp butonu.', icon: 'phone',
      fields: [F('ticker', 'Arkadaki büyük kayan yazı'), F('title', 'Başlık', 'textarea', { rows: 2 }), F('text', 'Açıklama', 'textarea'), F('btn', 'WhatsApp butonu yazısı')]
    },
    contact: {
      name: 'İletişim & form', desc: 'İletişim bilgileri, WhatsApp teklif formu ve harita.', icon: 'mail', tones: TONES,
      fields: HEAD.concat([F('formTitle', 'Form başlığı'), F('formNote', 'Form alt notu'), F('showMap', 'Haritayı göster', 'check'),
        F('mapQuery', 'Harita adresi', 'text', { h: 'Boş bırakılırsa Genel Ayarlar\'daki adres kullanılır.' })])
    }
  };

  var GENERAL = [
    ['İşletme', [F('businessName', 'İşletme adı'), F('logoText', 'Logo yazısı'), F('logoAccent', 'Logonun renkli kısmı'),
      F('slogan', 'Kısa slogan'), F('footerText', 'Alt bilgi yazısı', 'textarea')]],
    ['İletişim', [F('phone', 'Telefon'), F('whatsapp', 'WhatsApp numarası', 'text', { h: 'Ülke koduyla ve boşluksuz yazın: 905xxxxxxxxx' }), F('email', 'E-posta'),
      F('address', 'Adres'), F('district', 'İlçe'), F('city', 'Şehir'),
      F('areas', 'Hizmet bölgeleri', 'textarea', { h: 'Virgülle ayırın. Yerel aramalarda (ör. "Ataşehir tadilat") öne çıkmanıza yardımcı olur.' }),
      F('hours', 'Çalışma saatleri (sitede görünen)'), F('hoursSchema', 'Çalışma saatleri (Google için)', 'text', { h: 'Örnek: Mo-Sa 08:00-19:00' })]],
    ['Sosyal medya', [F('instagram', 'Instagram adresi'), F('facebook', 'Facebook adresi'), F('youtube', 'YouTube adresi')]],
    ['Görünüm', [F('accent', 'Vurgu rengi', 'color')]]
  ];
  var SEO = [
    F('title', 'Sayfa başlığı (title)', 'text', { max: 60, h: 'Google\'da mavi başlık olarak görünür. Şehir ve ana hizmet geçsin.' }),
    F('description', 'Açıklama (meta description)', 'textarea', { max: 160, h: 'Google\'da başlığın altında görünen kısa açıklama.' }),
    F('keywords', 'Anahtar kelimeler', 'textarea', { h: 'Virgülle ayırın.' }),
    F('siteUrl', 'Site adresi', 'text', { h: 'https://www.siteniz.com — sitemap ve paylaşım bağlantıları bununla oluşur.' }),
    F('ogImage', 'Paylaşım görseli (WhatsApp / Facebook önizlemesi)', 'image'),
    F('priceRange', 'Fiyat seviyesi (₺, ₺₺, ₺₺₺)'),
    F('foundingYear', 'Kuruluş yılı')
  ];
  var COLORS = ['#ff6b2c', '#f5b301', '#e11d48', '#16a34a', '#0ea5e9', '#2563eb', '#7c3aed', '#121417'];

  /* ---------- yardımcılar ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function $(s, c) { return (c || doc).querySelector(s); }
  function getPath(p) { return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, data); }
  function setPath(p, v) {
    var ks = p.split('.'), o = data;
    for (var i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = v;
  }
  function move(arr, i, d) {
    var j = i + d;
    if (j < 0 || j >= arr.length) return false;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    return true;
  }
  function uniqueId(base, skip) {
    var id = R.slug(base), n = 2;
    function taken(x) { return data.sections.some(function (s) { return s !== skip && s.id === x; }); }
    var out = id;
    while (taken(out)) out = id + '-' + n++;
    return out;
  }
  function time() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function ls(k, v) {
    try {
      if (v === undefined) return win.localStorage.getItem(k);
      if (v === null) win.localStorage.removeItem(k); else win.localStorage.setItem(k, v);
    } catch (e) { return null; }
    return true;
  }
  function ss(k, v) {
    try {
      if (v === undefined) return win.sessionStorage.getItem(k);
      if (v === null) win.sessionStorage.removeItem(k); else win.sessionStorage.setItem(k, v);
    } catch (e) { return null; }
    return true;
  }
  function ic(n) { return R.icon(n); }
  var TI = {
    up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    off: '<path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.4 0-10-7-10-7a18.4 18.4 0 0 1 5.1-5.9M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    del: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>', min: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>'
  };
  function ti(n) { return '<svg class="tp-i" viewBox="0 0 24 24" aria-hidden="true">' + TI[n] + '</svg>'; }
  function tool(act, i, title, icon, dis, j) {
    return '<button type="button" class="tp-tool" data-act="' + act + '" data-i="' + i + '"' + (j != null ? ' data-j="' + j + '"' : '') +
      ' title="' + title + '" aria-label="' + title + '"' + (dis ? ' disabled' : '') + '>' + ti(icon) + '</button>';
  }

  /* ---------- kayıt / önizleme ---------- */
  function readPublished() {
    var el = doc.getElementById('site-data');
    try { return JSON.parse(el.textContent); } catch (e) { return clone(DEF); }
  }
  function migrate(d) {
    d.settings = d.settings || {};
    d.seo = d.seo || {};
    d.sections = d.sections || [];
    Object.keys(DEF.settings).forEach(function (k) { if (d.settings[k] == null) d.settings[k] = DEF.settings[k]; });
    Object.keys(DEF.seo).forEach(function (k) { if (d.seo[k] == null) d.seo[k] = DEF.seo[k]; });
    return d;
  }
  function isDirty() { return JSON.stringify(data) !== JSON.stringify(published); }
  function saveDraft() {
    var ok = isDirty() ? ls(DRAFT, JSON.stringify({ at: Date.now(), data: data })) : ls(DRAFT, null);
    status(ok ? (isDirty() ? 'Taslak kaydedildi · ' + time() : 'Yayındaki hâliyle aynı') : 'Taslak kaydedilemedi (tarayıcı depolaması dolu olabilir)', !ok);
    markDirty();
  }
  function preview() {
    var app = doc.getElementById('app');
    if (!app) return;
    app.innerHTML = R.app(data);
    R.applyRoot(data, root);
    doc.title = data.seo.title || doc.title;
    if (win.TamirciApp) win.TamirciApp.refresh({ instant: true });
  }
  function changed(now) {
    clearTimeout(saveT); saveT = setTimeout(saveDraft, 350);
    clearTimeout(renderT); renderT = setTimeout(preview, now ? 0 : 260);
    markDirty();
  }
  function status(t, bad) {
    var el = ui && $('.tp__status', ui);
    if (el) { el.textContent = t; el.classList.toggle('is-bad', !!bad); }
  }
  function markDirty() {
    if (!ui) return;
    var d = isDirty();
    ui.classList.toggle('is-dirty', d);
    var b = $('[data-pub-state]', ui);
    if (b) b.outerHTML = pubState();
  }
  function toast(t, bad) {
    if (!ui) return;
    var el = $('.tp-toast', ui);
    el.textContent = t;
    el.classList.toggle('is-bad', !!bad);
    el.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove('is-on'); }, 4200);
  }

  /* ---------- giriş ---------- */
  function login() {
    if ($('.tpl')) return;
    var w = doc.createElement('div');
    w.className = 'tpl';
    w.innerHTML = '<form class="tpl__card" role="dialog" aria-modal="true" aria-labelledby="tpl-t">' +
      '<span class="tpl__ic">' + ti('lock') + '</span><h2 id="tpl-t">Yönetim Paneli</h2><p>Devam etmek için panel şifrenizi girin.</p>' +
      '<input type="password" autocomplete="current-password" placeholder="Şifre" aria-label="Şifre" required>' +
      '<p class="tpl__err" role="alert" hidden></p><button class="tp-btn tp-btn--primary tp-btn--block" type="submit">Giriş Yap</button>' +
      '<button type="button" class="tp-link" data-x>Vazgeç</button></form>';
    doc.body.appendChild(w);
    var f = $('form', w), inp = $('input', w), err = $('.tpl__err', w), tries = 0, lockUntil = 0;
    setTimeout(function () { inp.focus(); }, 60);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (Date.now() < lockUntil) { err.textContent = 'Çok fazla deneme yapıldı. 30 saniye bekleyin.'; err.hidden = false; return; }
      if (sha256(SALT + inp.value) === published.settings.adminHash) {
        ss(AUTH, published.settings.adminHash);
        w.remove();
        start();
      } else {
        if (++tries >= 5) { lockUntil = Date.now() + 30000; tries = 0; }
        err.textContent = 'Şifre hatalı.'; err.hidden = false;
        inp.select();
        f.classList.remove('is-shake'); void f.offsetWidth; f.classList.add('is-shake');
      }
    });
    w.addEventListener('click', function (e) { if (e.target === w || e.target.closest('[data-x]')) w.remove(); });
    w.addEventListener('keydown', function (e) { if (e.key === 'Escape') w.remove(); });
  }

  function start() {
    data = migrate(clone(published));
    var d = null;
    try { d = JSON.parse(ls(DRAFT) || 'null'); } catch (e) { d = null; }
    var note = '';
    if (d && d.data && JSON.stringify(d.data) !== JSON.stringify(published)) {
      data = migrate(d.data);
      note = 'Yayınlanmamış taslağınız yüklendi (' + new Date(d.at).toLocaleString('tr-TR') + ').';
    }
    build();
    if (note) { preview(); toast(note); }
    loadDir();
  }

  /* ---------- arayüz ---------- */
  function build() {
    ui = doc.createElement('aside');
    ui.className = 'tp';
    ui.setAttribute('aria-label', 'Yönetim paneli');
    ui.innerHTML =
      '<div class="tp__bar"><div class="tp__brand"><span class="tp__dot"></span><div><strong>Site Paneli</strong><small class="tp__status">Hazır</small></div></div>' +
      '<div class="tp__barbtns"><button type="button" class="tp-tool" data-act="min" title="Paneli gizle, siteyi gör" aria-label="Paneli gizle">' + ti('min') + '</button>' +
      '<button type="button" class="tp-tool" data-act="close" title="Paneli kapat" aria-label="Paneli kapat">' + ti('x') + '</button></div></div>' +
      '<nav class="tp__tabs" role="tablist">' +
      [['sections', 'Bölümler'], ['general', 'Genel'], ['seo', 'SEO'], ['publish', 'Yayınla']].map(function (t) {
        return '<button type="button" role="tab" class="tp__tab" data-act="tab" data-tab="' + t[0] + '">' + t[1] + (t[0] === 'publish' ? '<i class="tp__pip"></i>' : '') + '</button>';
      }).join('') + '</nav>' +
      '<div class="tp__body"></div>' +
      '<div class="tp__foot"><button type="button" class="tp-btn tp-btn--primary tp-btn--block" data-act="publish-quick">' + ti('folder') + '<span>Yayınla</span><i class="tp__pip"></i></button></div>' +
      '<div class="tp-toast" role="status" aria-live="polite"></div>';
    doc.body.appendChild(ui);
    fab = doc.createElement('button');
    fab.type = 'button';
    fab.className = 'tp-fab';
    fab.innerHTML = ti('panel') + 'Paneli aç';
    fab.addEventListener('click', function () { showUi(true); });
    doc.body.appendChild(fab);
    body = $('.tp__body', ui);
    ui.addEventListener('click', onClick);
    ui.addEventListener('input', onInput);
    ui.addEventListener('change', onChange);
    doc.addEventListener('keydown', onKey);
    showUi(true);
    draw();
    markDirty();
  }

  function showUi(on) {
    ui.classList.toggle('is-min', !on);
    root.classList.toggle('tp-open', on);
    root.classList.toggle('tp-min', !on);
    if (win.TamirciApp) setTimeout(win.TamirciApp.layout, 60);
  }

  function draw() {
    if (!ui) return;
    Array.prototype.forEach.call(ui.querySelectorAll('.tp__tab'), function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === tab));
    });
    var st = body.scrollTop;
    body.innerHTML = tab === 'sections' ? (picker ? drawPicker() : drawSections()) : tab === 'general' ? drawGeneral() : tab === 'seo' ? drawSeo() : drawPublish();
    body.scrollTop = st;
  }

  function connectBanner() {
    if (!FS || dirHandle) return '';
    return '<div class="tp-note tp-note--accent">' + ti('folder') + '<div><strong>Site klasörünü bağlayın</strong><span>Yayınla dediğinizde index.html ve yüklediğiniz görseller doğrudan "tamirci" klasörüne kaydedilir.</span>' +
      '<button type="button" class="tp-btn tp-btn--sm" data-act="connect">Klasörü bağla</button></div></div>';
  }

  function drawSections() {
    var h = connectBanner() + '<p class="tp-hint">Sıralamak için oklar, gizlemek için göz, düzenlemek için bölümün adına tıklayın. Değişiklikler sitede anında görünür.</p><div class="tp-secs">';
    data.sections.forEach(function (s, i) {
      var T = TYPES[s.type] || { name: s.type, icon: 'wrench' }, open = openSec === i, off = s.visible === false;
      h += '<div class="tp-sec' + (open ? ' is-open' : '') + (off ? ' is-off' : '') + '">' +
        '<div class="tp-sec__head"><button type="button" class="tp-sec__main" data-act="toggle-sec" data-i="' + i + '" aria-expanded="' + open + '">' +
        '<span class="tp-sec__ic">' + ic(T.icon) + '</span><span class="tp-sec__meta"><small>' + esc(T.name) + (off ? ' · gizli' : '') + '</small>' +
        '<strong data-sec-title="' + i + '">' + esc(plain(s.title || s.nav || T.name)) + '</strong></span></button>' +
        '<span class="tp-sec__tools">' + tool('up', i, 'Yukarı taşı', 'up', i === 0) + tool('down', i, 'Aşağı taşı', 'down', i === data.sections.length - 1) +
        tool('vis', i, off ? 'Göster' : 'Gizle', off ? 'off' : 'eye') + (T.single ? '' : tool('dup', i, 'Çoğalt', 'copy')) + tool('del', i, 'Sil', 'del') + '</span></div>' +
        (open ? '<div class="tp-sec__body">' + sectionForm(s, i) + '</div>' : '') + '</div>';
    });
    return h + '</div><button type="button" class="tp-add" data-act="add-open">' + ti('plus') + 'Yeni bölüm ekle</button>';
  }

  function drawPicker() {
    var hasHero = data.sections.some(function (s) { return s.type === 'hero'; });
    var h = '<div class="tp-pick__head"><strong>Hangi bölümü eklemek istersiniz?</strong><button type="button" class="tp-link" data-act="add-cancel">Vazgeç</button></div><div class="tp-pick">';
    Object.keys(TYPES).forEach(function (k) {
      var T = TYPES[k], dis = T.single && hasHero;
      h += '<button type="button" class="tp-pick__item" data-act="add-type" data-type="' + k + '"' + (dis ? ' disabled title="Sayfada zaten bir tane var"' : '') + '>' +
        '<span class="tp-sec__ic">' + ic(T.icon) + '</span><strong>' + esc(T.name) + '</strong><small>' + esc(dis ? 'Sayfada zaten var' : T.desc) + '</small></button>';
    });
    return h + '</div>';
  }

  function sectionForm(s, i) {
    var T = TYPES[s.type] || { fields: [] }, p = 'sections.' + i + '.';
    var h = '<div class="tp-row">' + field(F('nav', 'Menüdeki adı', 'text', { ph: 'Boşsa menüde görünmez' }), p) + field(F('id', 'Bağlantı (#)', 'slug'), p) + '</div>';
    if (T.tones) h += field(F('tone', 'Arka plan', 'select', { o: T.tones }), p);
    T.fields.forEach(function (f) { h += field(f, p); });
    if (T.list) h += listEditor(s, i, T.list);
    return h;
  }

  function listEditor(s, i, L) {
    var arr = s[L.key] || (s[L.key] = []), p = 'sections.' + i + '.' + L.key + '.';
    var h = '<div class="tp-list"><div class="tp-list__head"><strong>' + esc(L.label) + '</strong><span>' + arr.length + ' adet</span></div>';
    arr.forEach(function (it, j) {
      var open = openItem[i] === j;
      h += '<div class="tp-item' + (open ? ' is-open' : '') + '"><div class="tp-item__head">' +
        '<button type="button" class="tp-item__main" data-act="toggle-item" data-i="' + i + '" data-j="' + j + '" aria-expanded="' + open + '"><span class="tp-item__no">' + (j + 1) + '</span>' +
        '<span class="tp-item__t" data-item-title="' + i + '-' + j + '">' + esc(plain(it[L.title]) || L.item) + '</span></button><span class="tp-sec__tools">' +
        tool('item-up', i, 'Yukarı', 'up', j === 0, j) + tool('item-down', i, 'Aşağı', 'down', j === arr.length - 1, j) + tool('item-dup', i, 'Çoğalt', 'copy', false, j) + tool('item-del', i, 'Sil', 'del', false, j) +
        '</span></div>' + (open ? '<div class="tp-item__body">' + L.fields.map(function (f) { return field(f, p + j + '.'); }).join('') + '</div>' : '') + '</div>';
    });
    return h + '<button type="button" class="tp-add tp-add--sm" data-act="item-add" data-i="' + i + '">' + ti('plus') + esc(L.item) + ' ekle</button></div>';
  }

  function field(f, pre) {
    var path = pre + f.k, v = getPath(path), id = 'f-' + path.replace(/\./g, '-');
    if (v == null) v = '';
    var lab = '<label class="tp-f__l" for="' + id + '">' + esc(f.l) + '</label>', inp = '';
    var counter = f.max ? '<small class="tp-f__c" data-count-for="' + path + '">' + String(v).length + ' / ' + f.max + '</small>' : '';
    switch (f.t) {
      case 'textarea':
        inp = '<textarea id="' + id + '" rows="' + (f.rows || 3) + '" data-path="' + path + '">' + esc(v) + '</textarea>';
        break;
      case 'select':
        inp = '<select id="' + id + '" data-path="' + path + '">' + f.o.map(function (o) {
          return '<option value="' + o[0] + '"' + (String(v) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        }).join('') + '</select>';
        break;
      case 'check':
        return '<div class="tp-f"><label class="tp-check"><input type="checkbox" data-path="' + path + '"' + (v ? ' checked' : '') + '><span>' + esc(f.l) + '</span></label></div>';
      case 'number':
        inp = '<input id="' + id + '" type="number" min="1" max="5" data-path="' + path + '" value="' + esc(v) + '">';
        break;
      case 'color':
        inp = '<div class="tp-colors"><input id="' + id + '" type="color" data-path="' + path + '" value="' + esc(v) + '">' +
          COLORS.map(function (c) { return '<button type="button" class="tp-sw' + (c === v ? ' is-on' : '') + '" style="background:' + c + '" data-act="color" data-v="' + c + '" aria-label="' + c + '"></button>'; }).join('') + '</div>';
        break;
      case 'image':
        inp = imageField(path, v, id);
        break;
      case 'slug':
        inp = '<input id="' + id + '" data-path="' + path + '" data-slug value="' + esc(v) + '" spellcheck="false">';
        break;
      default:
        inp = '<input id="' + id + '" data-path="' + path + '" value="' + esc(v) + '"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '>';
    }
    return '<div class="tp-f">' + lab + inp + (f.h || counter ? '<div class="tp-f__meta">' + (f.h ? '<small class="tp-f__h">' + esc(f.h) + '</small>' : '<span></span>') + counter + '</div>' : '') + '</div>';
  }

  function imageField(path, v, id) {
    var isData = /^data:/.test(v);
    return '<div class="tp-img"><div class="tp-img__prev"' + (v ? ' style="background-image:url(&quot;' + esc(R.src(v, 480)) + '&quot;)"' : '') + '>' + (v ? '' : '<span>Görsel yok</span>') + '</div>' +
      '<div class="tp-img__ctl"><input id="' + id + '" data-path="' + path + '" data-img value="' + (isData ? '' : esc(v)) + '" placeholder="' + (isData ? 'Yüklenen görsel (sayfaya gömülü)' : 'Görsel adresi veya Yükle') + '" spellcheck="false">' +
      '<div class="tp-img__btns"><label class="tp-btn tp-btn--sm">Yükle<input type="file" accept="image/*" data-upload="' + path + '" hidden></label>' +
      (v ? '<button type="button" class="tp-btn tp-btn--sm tp-btn--ghost" data-act="img-clear" data-p="' + path + '">Kaldır</button>' : '') + '</div></div></div>';
  }

  function drawGeneral() {
    var h = '';
    GENERAL.forEach(function (g) {
      h += '<div class="tp-card"><h4>' + esc(g[0]) + '</h4>' + g[1].map(function (f) { return field(f, 'settings.'); }).join('') + '</div>';
    });
    h += '<div class="tp-card"><h4>Panel şifresi</h4><p class="tp-hint">Yeni şifre, Yayınla\'dan sonra geçerli olur.</p>' +
      '<div class="tp-f"><input type="password" data-pw="cur" placeholder="Mevcut şifre" autocomplete="current-password"></div>' +
      '<div class="tp-f"><input type="password" data-pw="new" placeholder="Yeni şifre (en az 6 karakter)" autocomplete="new-password"></div>' +
      '<div class="tp-f"><input type="password" data-pw="new2" placeholder="Yeni şifre (tekrar)" autocomplete="new-password"></div>' +
      '<button type="button" class="tp-btn" data-act="pw">Şifreyi değiştir</button></div>';
    return h;
  }

  function seoChecks() {
    var s = data.seo, st = data.settings, t = s.title || '', d = s.description || '';
    var city = (st.city || '').toLocaleLowerCase('tr-TR');
    var hasType = function (ty) { return data.sections.some(function (x) { return x.type === ty && x.visible !== false; }); };
    var imgs = 0, alts = 0;
    data.sections.forEach(function (x) { (x.slides || []).forEach(function (sl) { imgs++; if (sl.alt) alts++; }); });
    return [
      [t.length >= 30 && t.length <= 62, 'Başlık 30–60 karakter arasında (' + t.length + ')'],
      [d.length >= 110 && d.length <= 165, 'Açıklama 110–160 karakter arasında (' + d.length + ')'],
      [!!city && t.toLocaleLowerCase('tr-TR').indexOf(city) > -1, 'Başlıkta şehir adı geçiyor'],
      [/^https?:\/\/[^.]+\./.test(s.siteUrl || ''), 'Site adresi girilmiş'],
      [!!s.ogImage, 'Paylaşım görseli seçilmiş'],
      [!!st.areas, 'Hizmet bölgeleri yazılmış'],
      [hasType('services'), 'Hizmetler bölümü yayında'],
      [hasType('faq'), 'SSS bölümü yayında (Google\'da soru-cevap olarak çıkabilir)'],
      [imgs === 0 || alts === imgs, 'Giriş görsellerinin açıklaması (alt) dolu']
    ];
  }
  function serp() {
    var s = data.seo, host = String(s.siteUrl || 'www.siteniz.com').replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return '<div class="tp-serp" data-serp><small>' + esc(host) + '</small><strong>' + esc(s.title) + '</strong><p>' + esc(s.description) + '</p></div>';
  }
  function drawSeo() {
    var checks = seoChecks(), ok = checks.filter(function (c) { return c[0]; }).length;
    return '<div class="tp-card"><h4>Google önizlemesi</h4>' + serp() + '</div>' +
      '<div class="tp-card"><h4>Arama motoru ayarları</h4>' + SEO.map(function (f) { return field(f, 'seo.'); }).join('') + '</div>' +
      '<div class="tp-card"><h4>SEO kontrol listesi <span class="tp-score">' + ok + ' / ' + checks.length + '</span></h4><ul class="tp-checks">' +
      checks.map(function (c) { return '<li class="' + (c[0] ? 'is-ok' : '') + '">' + esc(c[1]) + '</li>'; }).join('') + '</ul>' +
      '<p class="tp-hint">Sitede otomatik olarak: işletme bilgileri (LocalBusiness), hizmet listesi ve SSS için Google yapısal verisi, sitemap.xml, robots.txt ve paylaşım etiketleri üretilir. Ayrıca ücretsiz Google İşletme Profili açıp bu siteyi eklemeniz yerel aramalarda en büyük etkiyi yapar.</p></div>';
  }

  function pubState() {
    return isDirty()
      ? '<p class="tp-badge tp-badge--warn" data-pub-state>Yayınlanmamış değişiklikler var</p>'
      : '<p class="tp-badge tp-badge--ok" data-pub-state>Her şey yayında</p>';
  }
  function drawPublish() {
    var h = '<div class="tp-card"><h4>Siteyi yayınla</h4>' + pubState() +
      '<p class="tp-hint">Panelde yaptığınız değişiklikler önce bu tarayıcıda taslak olarak saklanır. Ziyaretçilerin görmesi için sayfayı kaydetmeniz gerekir.</p>';
    if (FS) {
      h += '<button type="button" class="tp-btn tp-btn--primary tp-btn--block" data-act="publish">' + ti('folder') + 'Klasöre kaydet</button>' +
        '<p class="tp-small">Bağlı klasör: <b>' + (dirHandle ? esc(dirHandle.name) : 'henüz seçilmedi') + '</b> · <button type="button" class="tp-link" data-act="connect">' + (dirHandle ? 'Değiştir' : 'Bağla') + '</button></p>';
    }
    h += '<button type="button" class="tp-btn tp-btn--block' + (FS ? ' tp-btn--ghost' : ' tp-btn--primary') + '" data-act="download">index.html olarak indir</button>' +
      '<ol class="tp-steps"><li>' + (FS ? '"Klasöre kaydet" ile masaüstündeki <b>tamirci</b> klasörüne kaydedin.' : 'İnen index.html dosyasını <b>tamirci</b> klasöründeki eski dosyanın yerine koyun.') + '</li>' +
      '<li>Site bir hostingdeyse güncel <b>index.html</b> dosyasını (ve <b>assets/img/yuklenen</b> klasörünü) hosting panelinden ya da FTP ile yükleyin.</li></ol></div>';
    h += '<div class="tp-card"><h4>Yedek</h4><p class="tp-hint">Tüm içerik tek bir dosyada saklanır; başka bilgisayara taşımak için de kullanabilirsiniz.</p>' +
      '<div class="tp-row"><button type="button" class="tp-btn" data-act="backup">Yedek indir</button>' +
      '<label class="tp-btn">Yedek yükle<input type="file" accept=".json,application/json" data-restore hidden></label></div></div>';
    h += '<div class="tp-card"><h4>Geri al</h4><div class="tp-row"><button type="button" class="tp-btn tp-btn--ghost" data-act="discard">Taslağı sil</button>' +
      '<button type="button" class="tp-btn tp-btn--ghost" data-act="reset">Örnek içeriğe dön</button></div>' +
      '<p class="tp-hint">Taslağı sil: yayındaki hâline döner. Örnek içerik: sitenin ilk hâline döner (şifreniz korunur).</p></div>';
    h += '<div class="tp-card"><button type="button" class="tp-btn tp-btn--ghost tp-btn--block" data-act="logout">Çıkış yap</button></div>';
    return h;
  }

  /* ---------- olaylar ---------- */
  function scrollToSec(i) {
    var s = data.sections[i], el = s && s.visible !== false && doc.getElementById(s.id);
    if (el && win.innerWidth >= 1100) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }
  function newSection(type) {
    var tpl = null;
    DEF.sections.forEach(function (s) { if (!tpl && s.type === type) tpl = s; });
    var s = clone(tpl || TYPES[type].blank || {});
    s.type = type;
    s.visible = true;
    s.nav = '';
    s.id = uniqueId(s.id || TYPES[type].name);
    return s;
  }

  function onClick(e) {
    var b = e.target.closest('[data-act]');
    if (!b || !ui.contains(b) || b.disabled) return;
    var act = b.getAttribute('data-act'), i = +b.getAttribute('data-i'), j = +b.getAttribute('data-j');
    var secs = data.sections, s = secs[i], L = s && TYPES[s.type] && TYPES[s.type].list;
    switch (act) {
      case 'tab': tab = b.getAttribute('data-tab'); picker = false; draw(); body.scrollTop = 0; break;
      case 'toggle-sec': openSec = openSec === i ? -1 : i; draw(); if (openSec === i) scrollToSec(i); break;
      case 'up': case 'down':
        var d = act === 'up' ? -1 : 1;
        if (move(secs, i, d)) {
          if (openSec === i) openSec = i + d; else if (openSec === i + d) openSec = i;
          draw(); changed(true);
        }
        break;
      case 'vis': s.visible = s.visible === false; draw(); changed(true); break;
      case 'dup':
        var c = clone(s); c.id = uniqueId(s.id); c.nav = '';
        secs.splice(i + 1, 0, c); openSec = i + 1; draw(); changed(true); toast('Bölüm çoğaltıldı.');
        break;
      case 'del':
        if (!win.confirm('"' + plain(s.title || s.nav || TYPES[s.type].name) + '" bölümü silinsin mi?\n\nYanlışlıkla silerseniz "Taslağı sil" ile geri alabilirsiniz.')) return;
        secs.splice(i, 1); openSec = -1; draw(); changed(true); toast('Bölüm silindi.');
        break;
      case 'add-open': picker = true; draw(); body.scrollTop = 0; break;
      case 'add-cancel': picker = false; draw(); break;
      case 'add-type':
        var type = b.getAttribute('data-type'), ns = newSection(type), at = secs.length;
        for (var k = 0; k < secs.length; k++) if (secs[k].type === 'contact') { at = k; break; }
        if (type === 'hero') at = 0;
        secs.splice(at, 0, ns); picker = false; openSec = at; draw(); changed(true);
        toast('"' + TYPES[type].name + '" eklendi. Örnek içeriği değiştirebilirsiniz.');
        scrollToSec(at);
        setTimeout(function () { var el = $('.tp-sec.is-open', ui); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
        break;
      case 'toggle-item': openItem[i] = openItem[i] === j ? -1 : j; draw(); break;
      case 'item-up': case 'item-down':
        var dd = act === 'item-up' ? -1 : 1;
        if (move(s[L.key], j, dd)) { if (openItem[i] === j) openItem[i] = j + dd; draw(); changed(true); }
        break;
      case 'item-dup': s[L.key].splice(j + 1, 0, clone(s[L.key][j])); openItem[i] = j + 1; draw(); changed(true); break;
      case 'item-del':
        if (!win.confirm('Bu öğe silinsin mi?')) return;
        s[L.key].splice(j, 1); openItem[i] = -1; draw(); changed(true);
        break;
      case 'item-add':
        s[L.key] = s[L.key] || [];
        s[L.key].push(clone(L.blank)); openItem[i] = s[L.key].length - 1; draw(); changed(true);
        break;
      case 'img-clear': setPath(b.getAttribute('data-p'), ''); draw(); changed(true); break;
      case 'color': setPath('settings.accent', b.getAttribute('data-v')); draw(); changed(true); break;
      case 'pw': changePassword(); break;
      case 'connect': pickDir().then(function () { draw(); }); break;
      case 'publish': publish(false); break;
      case 'publish-quick': publish(!FS); break;
      case 'download': publish(true); break;
      case 'backup': download('tamirci-yedek-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(data, null, 2), 'application/json'); break;
      case 'discard':
        if (!win.confirm('Yayınlanmamış tüm değişiklikler silinsin mi?')) return;
        data = migrate(clone(published)); ls(DRAFT, null); openSec = -1; draw(); preview(); markDirty(); toast('Yayındaki hâline dönüldü.');
        break;
      case 'reset':
        if (!win.confirm('Tüm içerik örnek içerikle değiştirilsin mi? (Yayınlayana kadar yalnızca taslak değişir.)')) return;
        var h = data.settings.adminHash; data = migrate(clone(DEF)); data.settings.adminHash = h; openSec = -1; draw(); changed(true);
        break;
      case 'logout': ss(AUTH, null); close(); break;
      case 'min': showUi(false); break;
      case 'close': close(); break;
    }
  }

  function onInput(e) {
    var t = e.target, path = t.getAttribute && t.getAttribute('data-path');
    if (!path) return;
    var v = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? '' : Number(t.value)) : t.value;
    if (t.hasAttribute('data-slug')) v = R.slug(v);
    setPath(path, v);

    var m = /^sections\.(\d+)\.(title|nav)$/.exec(path);
    if (m) {
      var s = data.sections[+m[1]], el = $('[data-sec-title="' + m[1] + '"]', ui);
      if (el) el.textContent = plain(s.title || s.nav || TYPES[s.type].name);
    }
    m = /^sections\.(\d+)\.(\w+)\.(\d+)\.(\w+)$/.exec(path);
    if (m) {
      var L = TYPES[data.sections[+m[1]].type].list, it = $('[data-item-title="' + m[1] + '-' + m[3] + '"]', ui);
      if (L && L.title === m[4] && it) it.textContent = plain(v) || L.item;
    }
    var cnt = $('[data-count-for="' + path + '"]', ui);
    if (cnt) cnt.textContent = String(v).length + ' / ' + cnt.textContent.split('/ ')[1];
    if (/^seo\./.test(path)) { var sp = $('[data-serp]', ui); if (sp) sp.outerHTML = serp(); }
    if (t.hasAttribute('data-img')) {
      var pv = t.closest('.tp-img').querySelector('.tp-img__prev');
      pv.style.backgroundImage = v ? 'url("' + R.src(v, 480) + '")' : '';
      pv.innerHTML = v ? '' : '<span>Görsel yok</span>';
    }
    if (path === 'settings.accent') {
      Array.prototype.forEach.call(ui.querySelectorAll('.tp-sw'), function (b) { b.classList.toggle('is-on', b.getAttribute('data-v') === v); });
    }
    changed();
  }

  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute('data-slug')) {
      var i = +t.getAttribute('data-path').split('.')[1], s = data.sections[i];
      s.id = uniqueId(t.value || TYPES[s.type].name, s);
      t.value = s.id;
      changed(true);
    }
    if (t.hasAttribute('data-upload') && t.files && t.files[0]) { upload(t.files[0], t.getAttribute('data-upload')); t.value = ''; }
    if (t.hasAttribute('data-restore') && t.files && t.files[0]) { restore(t.files[0]); t.value = ''; }
  }

  function onKey(e) {
    if (!ui || ui.classList.contains('is-min')) return;
    if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); publish(!FS); }
  }

  function close() {
    clearTimeout(saveT);
    if (data && isDirty()) saveDraft();
    doc.removeEventListener('keydown', onKey);
    root.classList.remove('tp-open', 'tp-min');
    if (ui) ui.remove();
    if (fab) fab.remove();
    ui = fab = null;
    if (win.TamirciApp) setTimeout(win.TamirciApp.layout, 60);
  }

  function changePassword() {
    var g = function (k) { return $('[data-pw="' + k + '"]', ui).value; };
    if (sha256(SALT + g('cur')) !== data.settings.adminHash) { toast('Mevcut şifre hatalı.', true); return; }
    if (g('new').length < 6) { toast('Yeni şifre en az 6 karakter olmalı.', true); return; }
    if (g('new') !== g('new2')) { toast('Yeni şifreler aynı değil.', true); return; }
    data.settings.adminHash = sha256(SALT + g('new'));
    draw(); changed(true);
    toast('Şifre değişti. Geçerli olması için Yayınla\'ya basın.');
  }

  /* ---------- dosyalar ---------- */
  function download(name, text, type) {
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
    a.download = name;
    doc.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  function idb(mode, fn) {
    return new Promise(function (res, rej) {
      var r = win.indexedDB.open('tamirci-panel', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onerror = function () { rej(r.error); };
      r.onsuccess = function () {
        var tx = r.result.transaction('kv', mode), q = fn(tx.objectStore('kv'));
        tx.oncomplete = function () { res(q && q.result); };
        tx.onerror = function () { rej(tx.error); };
      };
    });
  }
  function loadDir() {
    if (!FS || dirHandle) return;
    idb('readonly', function (st) { return st.get('dir'); }).then(function (h) {
      if (h) { dirHandle = h; draw(); }
    }).catch(function () {});
  }
  function perm(h, ask) {
    var o = { mode: 'readwrite' };
    return h.queryPermission(o).then(function (p) {
      if (p === 'granted') return true;
      return ask ? h.requestPermission(o).then(function (q) { return q === 'granted'; }) : false;
    });
  }
  function pickDir() {
    return win.showDirectoryPicker({ id: 'tamirci-site', mode: 'readwrite' }).then(function (h) {
      return h.getFileHandle('index.html').then(function () { return true; }, function () { return false; }).then(function (ok) {
        if (!ok && !win.confirm('Seçtiğiniz "' + h.name + '" klasöründe index.html bulunamadı. Doğru klasör, sitenin bulunduğu "tamirci" klasörüdür.\n\nYine de bu klasör kullanılsın mı?')) return null;
        dirHandle = h;
        idb('readwrite', function (st) { return st.put(h, 'dir'); }).catch(function () {});
        toast('"' + h.name + '" klasörü bağlandı.');
        return h;
      });
    }).catch(function (err) {
      if (err && err.name !== 'AbortError') toast('Klasör seçilemedi: ' + err.message, true);
      return null;
    });
  }
  // ask=true: izin yoksa sorar, klasör yoksa seçtirir
  function ensureDir(ask) {
    if (!FS) return Promise.resolve(null);
    if (dirHandle) {
      return perm(dirHandle, ask).then(function (ok) { return ok ? dirHandle : (ask ? pickDir() : null); }, function () { return ask ? pickDir() : null; });
    }
    return ask ? pickDir() : Promise.resolve(null);
  }
  function writeFile(dir, path, content) {
    var parts = path.split('/'), name = parts.pop();
    return parts.reduce(function (pr, part) {
      return pr.then(function (d) { return d.getDirectoryHandle(part, { create: true }); });
    }, Promise.resolve(dir)).then(function (d) {
      return d.getFileHandle(name, { create: true });
    }).then(function (fh) {
      return fh.createWritable().then(function (w) { return w.write(content).then(function () { return w.close(); }); });
    });
  }
  function readFile(dir, name) {
    return dir.getFileHandle(name).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); });
  }

  function compress(file, max, q) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        var c = doc.createElement('canvas');
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        var cx = c.getContext('2d');
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
        cx.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { if (b) res(b); else rej(new Error('Görsel işlenemedi')); }, 'image/jpeg', q);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Bu görsel biçimi okunamadı (JPG veya PNG deneyin).')); };
      im.src = url;
    });
  }
  function blobToData(b) {
    return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsDataURL(b); });
  }
  function imgName(base) { return 'assets/img/yuklenen/' + R.slug(base).slice(0, 40) + '-' + Date.now().toString(36) + '.jpg'; }

  function upload(file, path) {
    status('Görsel hazırlanıyor…');
    ensureDir(false).then(function (dir) {
      return compress(file, dir ? 2000 : 1600, dir ? .84 : .78).then(function (blob) {
        if (dir) {
          var name = imgName(file.name.replace(/\.[^.]+$/, ''));
          return writeFile(dir, name, blob).then(function () { toast('Görsel klasöre kaydedildi.'); return name; });
        }
        return blobToData(blob).then(function (d) {
          toast(FS ? 'Görsel sayfaya gömüldü. Klasörü bağlarsanız yayınlarken ayrı dosyaya taşınır.' : 'Görsel sayfaya gömüldü.');
          return d;
        });
      });
    }).then(function (val) {
      setPath(path, val); draw(); changed(true);
    }).catch(function (err) { toast(err.message || 'Görsel yüklenemedi.', true); status('Hazır'); });
  }

  // sayfaya gömülü görselleri yayınlarken klasördeki dosyalara taşır
  function externalize(dir) {
    var jobs = [];
    (function walk(o) {
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (typeof v === 'string' && /^data:image\//.test(v)) {
          jobs.push(function () {
            return win.fetch(v).then(function (r) { return r.blob(); }).then(function (b) {
              var name = imgName(o.title || o.label || k);
              return writeFile(dir, name, b).then(function () { o[k] = name; });
            });
          });
        } else if (v && typeof v === 'object') walk(v);
      });
    })(data);
    return jobs.reduce(function (p, job) { return p.then(job); }, Promise.resolve()).then(function () { return jobs.length; });
  }

  function restore(file) {
    file.text().then(function (t) {
      var d = JSON.parse(t);
      if (!d || !Array.isArray(d.sections) || !d.settings) throw new Error('bad');
      if (!win.confirm('Yedek yüklensin mi? Şu anki taslağın yerine geçer.')) return;
      var h = data.settings.adminHash;
      data = migrate(d);
      if (!data.settings.adminHash) data.settings.adminHash = h;
      openSec = -1; draw(); changed(true); toast('Yedek yüklendi. Kalıcı olması için yayınlayın.');
    }).catch(function () { toast('Bu dosya geçerli bir site yedeği değil.', true); });
  }

  function markPublished() {
    published = clone(data);
    var el = doc.getElementById('site-data');
    if (el) el.textContent = JSON.stringify(data);
    ls(DRAFT, null);
    markDirty();
    if (tab === 'publish') draw();
  }

  function publish(asDownload) {
    if (asDownload) {
      var html = R.page(data);
      download('index.html', html, 'text/html');
      toast('index.html indirildi. Site klasöründeki eski index.html dosyasının yerine koyun.');
      return;
    }
    status('Kaydediliyor…');
    ensureDir(true).then(function (dir) {
      if (!dir) { status('Hazır'); return; }
      return externalize(dir).then(function (moved) {
        if (moved) preview();
        var html = R.page(data);
        return readFile(dir, 'index.html').then(function (old) {
          return writeFile(dir, '_yedek/index-onceki.html', old);
        }, function () {}).then(function () {
          return writeFile(dir, 'index.html', html);
        }).then(function () {
          // site adresi girilmeden geçerli bir sitemap üretilemez
          if (String(data.seo.siteUrl || '').trim()) return writeFile(dir, 'sitemap.xml', R.sitemap(data));
        }).then(function () {
          return writeFile(dir, 'robots.txt', R.robots(data));
        }).then(function () {
          markPublished();
          status('Yayınlandı · ' + time());
          toast('Yayınlandı! index.html "' + dir.name + '" klasörüne kaydedildi.' + (moved ? ' ' + moved + ' görsel ayrı dosyaya taşındı.' : ''));
        });
      });
    }).catch(function (err) {
      status('Kaydedilemedi', true);
      toast('Kaydedilemedi: ' + (err && err.message ? err.message : err), true);
    });
  }

  /* ---------- dışa açık ---------- */
  window.TamirciPanel = {
    open: function () {
      if (ui) { showUi(true); return; }
      published = migrate(readPublished());
      if (ss(AUTH) && ss(AUTH) === published.settings.adminHash) start();
      else login();
    },
    sha256: sha256
  };
})();
