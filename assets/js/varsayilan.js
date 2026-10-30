/*
  Tamirci — örnek (varsayılan) site içeriği.
  Panel "Yeni Bölüm Ekle" ve "Örnek içeriğe sıfırla" için bu dosyayı kullanır.
  Sitenin yayındaki içeriği index.html içindeki <script id="site-data"> etiketinde durur.
*/
(function (g) {
  var U = function (id) { return 'https://images.unsplash.com/photo-' + id; };

  g.TamirciVarsayilan = {
    version: 1,
    settings: {
      businessName: 'HMK Teknik',
      logoText: 'HMK',
      logoAccent: 'TEKNİK',
      slogan: 'İnşaat, Tadilat & Dekorasyon',
      phone: '0555 555 55 55',
      whatsapp: '905555555555',
      email: '',
      address: '',
      district: '',
      city: 'Ankara',
      areas: 'Çankaya, Keçiören, Yenimahalle, Etimesgut, Mamak, Sincan, Altındağ, Gölbaşı, Pursaklar',
      hours: 'Pazartesi – Cumartesi · 08:00 – 19:00',
      hoursSchema: 'Mo-Sa 08:00-19:00',
      instagram: '',
      facebook: '',
      youtube: '',
      accent: '#FFC20E',
      footerText: 'Konut ve iş yeri inşaatından anahtar teslim tadilata, iç mekân dekorasyonuna kadar yapınızın her aşaması için tek adres.',
      adminHash: '5111140769146c8dcb8c3bed06c483978a37d9aab20cdf69d167536e01910f66'
    },
    seo: {
      title: 'Ankara İnşaat, Tadilat ve Dekorasyon | HMK Teknik',
      description: 'Ankara\'da inşaat, anahtar teslim tadilat ve dekorasyon: kaba yapıdan ince işçiliğe tek ekip. Ücretsiz keşif, net fiyat, yazılı garanti.',
      keywords: 'ankara inşaat firması, ankara tadilat, ankara dekorasyon, anahtar teslim tadilat, ev tadilatı, iş yeri tadilatı, kaba inşaat, iç dekorasyon, çankaya tadilat, etimesgut tadilat, mutfak dolabı, banyo tadilatı, hmk teknik',
      siteUrl: '',
      ogImage: U('1545324418-cc1a3fa10c00'),
      priceRange: '₺₺',
      foundingYear: '2010'
    },
    sections: [
      {
        id: 'anasayfa', type: 'hero', visible: true, nav: '',
        eyebrow: 'Ankara\'da inşaat · tadilat · dekorasyon',
        title: 'Temelden dekorasyona *tek ekip*.',
        text: 'Konut ve iş yeri inşaatından anahtar teslim tadilata, iç mekân dekorasyonundan küçük onarımlara kadar tüm işi tek elden yürütüyoruz. Çubuğu kaydırın, farkı görün.',
        btn1: 'Ücretsiz Keşif İste',
        btn1Link: '#iletisim',
        btn2: 'WhatsApp\'tan Yaz',
        hint: 'Çubuğu sürükleyin',
        slides: [
          { label: 'İnşaat', after: U('1545324418-cc1a3fa10c00'), before: U('1429497419816-9ca5cfb4571a'), alt: 'Konut inşaatı: kaba yapıdan anahtar teslime' },
          { label: 'Tadilat', after: U('1600489000022-c2086d79f9d4'), before: U('1722888799634-c5093906feae'), alt: 'Mutfak ve daire tadilatı' },
          { label: 'Dekorasyon', after: U('1556228453-efd6c1ff04f6'), before: U('1760516476528-bfa65002547a'), alt: 'Salon dekorasyonu' }
        ]
      },
      {
        id: 'hizmet-seridi', type: 'marquee', visible: true, nav: '', tone: 'accent',
        items: [
          { text: 'İnşaat' },
          { text: 'Kaba Yapı' },
          { text: 'Komple Tadilat' },
          { text: 'Dekorasyon' },
          { text: 'Mutfak & Banyo' },
          { text: 'Boya & Badana' },
          { text: 'Zemin & Parke' },
          { text: 'Alçıpan & Asma Tavan' },
          { text: 'Elektrik & Tesisat' }
        ]
      },
      {
        id: 'rakamlar', type: 'stats', visible: true, nav: '', tone: 'dark',
        items: [
          { value: '15', suffix: '+', label: 'Yıllık tecrübe' },
          { value: '1200', suffix: '+', label: 'Tamamlanan proje' },
          { prefix: '%', value: '98', suffix: '', label: 'Memnun müşteri' },
          { value: '2', suffix: ' yıl', label: 'İşçilik garantisi' }
        ]
      },
      {
        id: 'hizmetler', type: 'services', visible: true, nav: 'Hizmetler', tone: 'light',
        eyebrow: 'Hizmetlerimiz',
        title: 'İnşaattan dekorasyona *her iş*, tek ekipten.',
        text: 'Kaba inşaattan ince işçiliğe, tadilattan dekorasyona; proje, malzeme ve uygulamayı tek elden yönetiyoruz.',
        items: [
          { title: 'İnşaat & Kaba Yapı', text: 'Konut, villa ve iş yeri inşaatı: temel, betonarme, duvar ve çatı işleri. Projeye uygun, planlı ve denetimli uygulama.', image: U('1504307651254-35680f356dfd') },
          { title: 'Komple Tadilat', text: 'Daire, ofis ve dükkânlarda anahtar teslim tadilat. Tek muhatap, net takvim, sürprizsiz fiyat.', image: U('1503387762-592deb58ef4e') },
          { title: 'Dekorasyon', text: 'Renk, malzeme ve aydınlatma seçiminden duvar kaplama ve dekoratif detaylara; mekânınıza yeni bir kimlik.', image: U('1586023492125-27b2c045efd7') },
          { title: 'Mutfak Dolabı', text: 'Ölçüye özel mutfak dolabı, tezgâh ve ankastre montajı. Lake, akrilik ve membran kapak seçenekleri.', image: U('1565538810643-b5bdb714032a') },
          { title: 'Banyo & Duşakabin', text: 'Duşakabin montajı, banyo dolabı, vitrifiye değişimi ve komple banyo yenileme.', image: U('1600566752355-35792bedcfea') },
          { title: 'Boya & Dekoratif Duvar', text: 'İç cephe boya, saten alçı, dekoratif boya ve duvar kâğıdı uygulamaları; eşyalar korunarak, temiz ve hızlı.', image: U('1562259949-e8e7689d7828') },
          { title: 'Zemin & Seramik', text: 'Laminat parke, vinil, seramik ve fayans döşeme; su yalıtımı, süpürgelik ve eşik detaylarıyla.', image: U('1589939705384-5185137a7f0f') },
          { title: 'Alçıpan & Asma Tavan', text: 'Alçıpan bölme duvar, asma tavan ve gizli LED ışık bandı uygulamaları.', image: U('1581858726788-75bc0f6a952d') },
          { title: 'Elektrik & Tesisat', text: 'Elektrik ve su tesisatı yenileme; aydınlatma, sigorta panosu, batarya ve gider değişimi.', image: U('1621905251189-08b45d6a269e') }
        ]
      },
      {
        id: 'donusum', type: 'morph', visible: true, nav: '',
        eyebrow: 'Kaydırdıkça değişsin',
        title: 'Bir binanın *dönüşümü*',
        after: U('1600566753190-17f0baa2a6c3'),
        before: U('1541888946425-d81bb19240f5'),
        alt: 'Ankara\'da müstakil konut inşaatı',
        meter: 'tamamlandı',
        items: [
          { title: 'Kaba inşaat', text: 'Temel, betonarme karkas ve duvarlar projeye uygun olarak yükseldi.' },
          { title: 'İnce işler', text: 'Sıva, elektrik ve su tesisatı, doğrama ve cephe uygulandı.' },
          { title: 'Anahtar teslim', text: 'Boya, zemin ve dekorasyonla bina oturulmaya hazır hâle geldi.' }
        ]
      },
      {
        id: 'oncesi-sonrasi', type: 'gallery', visible: true, nav: 'Öncesi / Sonrası', tone: 'white',
        eyebrow: 'Projelerimiz',
        title: 'Öncesi ve *sonrası* — farkı kendiniz görün.',
        text: 'İnşaattan dekorasyona tamamladığımız işlerin önceki ve sonraki hâllerini, kartlardaki çubuğu sürükleyerek karşılaştırın.',
        items: [
          { title: 'Apartman İnşaatı', location: 'Etimesgut', duration: '14 ay', after: U('1460317442991-0ec209397118'), before: U('1531834685032-c34bf0d84c77') },
          { title: 'Müstakil Villa', location: 'Gölbaşı', duration: '10 ay', after: U('1613490493576-7fde63acd811'), before: U('1504307651254-35680f356dfd') },
          { title: 'Ofis Tadilatı', location: 'Çankaya', duration: '18 gün', after: U('1497366811353-6870744d04b2'), before: '' },
          { title: 'Salon Dekorasyonu', location: 'Yenimahalle', duration: '7 gün', after: U('1600607687939-ce8a6c25118c'), before: U('1763667083561-90f384685999') },
          { title: 'Mutfak Yenileme', location: 'Keçiören', duration: '12 gün', after: U('1484154218962-a197022b5858'), before: U('1717331822162-74e5eaf4d038') },
          { title: 'Banyo Yenileme', location: 'Çankaya', duration: '8 gün', after: U('1631889993959-41b4e9c6e3c5'), before: U('1630840450974-7c7ddad8bdfe') }
        ]
      },
      {
        id: 'surec', type: 'process', visible: true, nav: 'Süreç', tone: 'light',
        eyebrow: 'Nasıl çalışıyoruz?',
        title: 'Dört adımda *sorunsuz* proje.',
        text: 'İlk görüşmeden anahtar teslimine kadar her adımda ne olacağını bilirsiniz.',
        btn: 'Keşif Randevusu Al',
        btnLink: '#iletisim',
        items: [
          { title: 'Ücretsiz keşif', text: 'Adresinize ya da arsanıza gelir, ölçü alır, ihtiyaçlarınızı dinleriz. Keşif için ücret talep etmeyiz.' },
          { title: 'Net teklif & plan', text: 'Malzeme ve işçiliği kalem kalem gösteren, sonradan sürpriz çıkarmayan bir teklif ve iş takvimi sunarız.' },
          { title: 'Titiz uygulama', text: 'Kaba işten ince işçiliğe her aşamada alanı korur, her gün temiz bırakır, takvime sadık kalırız. İlerlemeyi fotoğrafla paylaşırız.' },
          { title: 'Teslim & garanti', text: 'İşi birlikte kontrol eder, işçiliğe 2 yıl yazılı garanti veririz.' }
        ]
      },
      {
        id: 'neden-biz', type: 'features', visible: true, nav: '', tone: 'dark',
        eyebrow: 'Neden biz?',
        title: 'Ustanız değil, *yol arkadaşınız*.',
        text: 'Kaydırmaya devam edin.',
        items: [
          { icon: 'ruler', title: 'Ücretsiz keşif', text: 'Ölçü ve fiyatlandırma için adresinize geliriz; hiçbir ücret ödemezsiniz.' },
          { icon: 'tag', title: 'Sabit fiyat', text: 'Teklifte ne yazıyorsa onu ödersiniz. İş ortasında fiyat değişmez.' },
          { icon: 'clock', title: 'Zamanında teslim', text: 'Takvimi baştan netleştirir, söz verdiğimiz günde teslim ederiz.' },
          { icon: 'spark', title: 'Temiz çalışma', text: 'Toz örtüsü, koruma bandı ve iş sonu temizliği her işte standarttır.' },
          { icon: 'shield', title: 'Yazılı garanti', text: 'Tüm işçiliğimiz 2 yıl yazılı garanti altındadır.' },
          { icon: 'helmet', title: 'Kendi ekibimiz', text: 'Taşeron yok; inşaattan dekorasyona işinizi deneyimli, sigortalı kendi ustalarımız yapar.' }
        ]
      },
      {
        id: 'hakkimizda', type: 'about', visible: true, nav: 'Hakkımızda', tone: 'white',
        eyebrow: 'Hakkımızda',
        title: 'Ustalık, güven ve *temiz iş*.',
        text: 'HMK Teknik olarak 2010\'dan bu yana Ankara\'da konut ve iş yerlerinin inşaatını, tadilatını ve dekorasyonunu yapıyoruz. Temelden son kat boyaya kadar her işe aynı özenle yaklaşıyoruz: önce dinliyor, sonra planlıyor, en son uyguluyoruz.',
        image: U('1581141849291-1125c7b692b5'),
        alt: 'HMK Teknik ekibinden bir usta çalışırken',
        badgeValue: '15+',
        badgeText: 'Yıllık tecrübe',
        btn: 'Bizi Arayın',
        btnLink: 'tel',
        items: [
          { text: 'Faturalı ve sigortalı çalışma' },
          { text: 'İnşaat, tadilat ve dekorasyonda tek muhatap' },
          { text: 'Malzeme seçiminde ücretsiz danışmanlık' },
          { text: 'Eşyalarınız için koruma ve iş sonu temizlik' },
          { text: 'İşçiliğe 2 yıl yazılı garanti' }
        ]
      },
      {
        id: 'yorumlar', type: 'testimonials', visible: true, nav: 'Yorumlar', tone: 'light',
        eyebrow: 'Müşteri yorumları',
        title: 'Komşularınız *ne diyor?*',
        text: '',
        items: [
          { name: 'Ayşe K.', place: 'Çankaya · Mutfak', stars: 5, text: 'Mutfak dolaplarımız tam söyledikleri günde bitti. Ekip çok temiz çalıştı, her akşam ortalığı toparlayıp gittiler.' },
          { name: 'Murat D.', place: 'Keçiören · Duşakabin', stars: 5, text: 'Duşakabin montajı 3 saatte bitti, silikon işçiliği kusursuz. Fiyat da teklifteki gibi kaldı.' },
          { name: 'Elif S.', place: 'Yenimahalle · Boya', stars: 5, text: 'Tüm evi boyattık; eşyaları öyle güzel korudular ki hiçbir yerde damla yok. Kesinlikle tavsiye ederim.' },
          { name: 'Hakan T.', place: 'Etimesgut · Komple tadilat', stars: 5, text: 'Komple tadilatı tek muhatapla yürütmek büyük rahatlık. Her gün fotoğrafla bilgi verdiler.' },
          { name: 'Zeynep A.', place: 'Gölbaşı · Banyo', stars: 5, text: 'Eski banyomuz tanınmaz hâle geldi. Malzeme seçiminde verdikleri tavsiyeler çok işimize yaradı.' },
          { name: 'Serkan Y.', place: 'Mamak · Parke', stars: 5, text: 'Laminat parke ve süpürgelikler çok düzgün oldu. Zamanında geldiler, zamanında bitirdiler.' }
        ]
      },
      {
        id: 'sss', type: 'faq', visible: true, nav: 'SSS', tone: 'white',
        eyebrow: 'Sıkça sorulan sorular',
        title: 'Aklınıza takılanlar',
        text: 'Burada bulamadığınız her soru için bize WhatsApp\'tan yazabilirsiniz.',
        cardTitle: 'Sorunuz mu var?',
        cardText: 'Fotoğraf gönderin, size hemen fikir verelim.',
        items: [
          { q: 'Hangi işleri yapıyorsunuz?', a: 'Konut ve iş yeri inşaatı, anahtar teslim tadilat ve iç mekân dekorasyonu yapıyoruz. Mutfak, banyo, boya, zemin, alçıpan, elektrik ve tesisat gibi tek kalem işleri de üstleniyoruz.' },
          { q: 'Keşif ücretli mi?', a: 'Hayır. Ankara içinde keşif ve ölçü tamamen ücretsizdir; teklifimizi beğenmezseniz hiçbir ücret ödemezsiniz.' },
          { q: 'Mutfak dolabı kaç günde hazır olur?', a: 'Ölçü alındıktan ve model netleştikten sonra üretim ortalama 10–15 iş günü sürer. Montaj genellikle 1–2 günde tamamlanır.' },
          { q: 'İnşaat ve anahtar teslim projeler ne kadar sürer?', a: 'Süre; projenin büyüklüğüne, ruhsat sürecine ve mevsime göre değişir. Keşif ve proje incelemesinin ardından size aşama aşama yazılı bir iş takvimi veririz.' },
          { q: 'Malzemeyi kendim alabilir miyim?', a: 'Elbette. İsterseniz malzemeyi siz alırsınız, biz yalnızca işçilik fiyatı veririz; isterseniz malzemeyi de biz temin ederiz.' },
          { q: 'İşçiliğe garanti veriyor musunuz?', a: 'Evet. Tüm işçiliğimiz 2 yıl yazılı garantilidir. Malzemeler ise üretici garantisi kapsamındadır.' },
          { q: 'Hangi bölgelere hizmet veriyorsunuz?', a: 'Ankara genelinde; Çankaya, Keçiören, Yenimahalle, Etimesgut, Mamak, Sincan, Gölbaşı ve diğer ilçelere hizmet veriyoruz.' }
        ]
      },
      {
        id: 'teklif', type: 'cta', visible: true, nav: '',
        ticker: 'Ücretsiz keşif',
        title: 'Projenizi birlikte *hayata geçirelim*.',
        text: 'Bugün arayın, en geç 24 saat içinde ücretsiz keşif için yanınızda olalım.',
        btn: 'WhatsApp\'tan Yaz'
      },
      {
        id: 'iletisim', type: 'contact', visible: true, nav: 'İletişim', tone: 'light',
        eyebrow: 'İletişim',
        title: 'Ücretsiz keşif *randevusu* alın.',
        text: 'Formu doldurun ya da doğrudan arayın. Size en uygun gün ve saati birlikte planlayalım.',
        formTitle: 'Hızlı teklif formu',
        formNote: 'Gönder\'e bastığınızda bilgileriniz WhatsApp mesajı olarak hazırlanır.',
        showMap: true,
        mapQuery: ''
      }
    ]
  };
})(typeof window !== 'undefined' ? window : this);
