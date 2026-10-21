// Enable scroll animations only when JS is active (content stays visible without JS)
document.documentElement.classList.add('js');

// SEO metadata per language
var seoData = {
  en: {
    title: 'Luca Facchinetti — Firmware Engineer & Embedded Systems Developer | Bare Metal Programming',
    description: 'Bare-metal firmware engineer with 25+ years in STM32, PIC/dsPIC microcontrollers, PCB design and hardware consulting. Available for freelance.',
    ogTitle: 'Luca Facchinetti — Firmware Engineer & Embedded Systems Developer | Bare Metal Programming',
    ogDesc: '25+ years of bare-metal firmware, embedded hardware design and technical consulting. Specialized in STM32, PIC, dsPIC, Modbus.'
  },
  it: {
    title: 'Luca Facchinetti — Ingegnere Firmware & Sistemi Embedded',
    description: 'Ingegnere Firmware con oltre 25 anni di esperienza in firmware bare-metal STM32, PIC/dsPIC, progettazione PCB e consulenza embedded. Freelance.',
    ogTitle: 'Luca Facchinetti — Ingegnere Firmware & Sistemi Embedded',
    ogDesc: 'Oltre 25 anni di esperienza in firmware bare-metal, progettazione hardware embedded e consulenza tecnica. Specializzato in STM32, PIC, dsPIC, Modbus.'
  },
  es: {
    title: 'Luca Facchinetti — Ingeniero de Firmware y Sistemas Embebidos',
    description: 'Ingeniero de Firmware con más de 25 años en firmware bare-metal STM32, PIC/dsPIC, diseño PCB y consultoría hardware. Disponible para freelance.',
    ogTitle: 'Luca Facchinetti — Ingeniero de Firmware y Sistemas Embebidos',
    ogDesc: 'Más de 25 años de experiencia en firmware bare-metal, diseño de hardware embebido y consultoría técnica. Especializado en STM32, PIC, dsPIC, Modbus.'
  }
};

var LANGS = ['en', 'it', 'es'];

function setLang(lang) {
  if (LANGS.indexOf(lang) === -1) return;
  document.body.className = 'lang-' + lang;
  document.documentElement.lang = lang;

  // Update SEO meta tags dynamically
  var data = seoData[lang];
  if (data) {
    document.getElementById('page-title').textContent = data.title;
    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', data.description);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', data.ogTitle);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', data.ogDesc);
  }

  // Update language button states
  LANGS.forEach(function (l) {
    var btn = document.getElementById('btn-' + l);
    if (!btn) return;
    btn.classList.toggle('active', l === lang);
    btn.setAttribute('aria-pressed', l === lang ? 'true' : 'false');
  });

  localStorage.setItem('lang', lang);
}

// Language buttons
LANGS.forEach(function (l) {
  var btn = document.getElementById('btn-' + l);
  if (btn) btn.addEventListener('click', function () { setLang(l); });
});

// Resolve language: ?lang= URL param (hreflang targets) > saved preference > browser language
(function () {
  var urlLang = new URLSearchParams(window.location.search).get('lang');
  var saved = localStorage.getItem('lang');
  var browser = (navigator.language || 'it').slice(0, 2);
  var lang = null;
  if (LANGS.indexOf(urlLang) !== -1) lang = urlLang;
  else if (LANGS.indexOf(saved) !== -1) lang = saved;
  else if (LANGS.indexOf(browser) !== -1) lang = browser;
  if (lang && lang !== 'it') setLang(lang);
})();

// Lazy loading for images
(function () {
  var lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    var imageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    lazyImages.forEach(function (img) { imageObserver.observe(img); });
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(function (img) { img.classList.add('loaded'); });
  }
})();

// Scroll animations — fade elements in as they enter the viewport
(function () {
  var fadeElements = document.querySelectorAll('.fade-up');
  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach(function (el) { el.classList.add('animate'); });
    return;
  }
  var sectionObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      // Stagger only within the currently entering group, capped at 0.4s
      var group = Array.prototype.filter.call(fadeElements, function (el) {
        return el.closest('section') === entry.target.closest('section');
      });
      var idx = group.indexOf(entry.target);
      entry.target.style.animationDelay = Math.min(idx, 4) * 0.1 + 's';
      entry.target.classList.add('animate');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  fadeElements.forEach(function (el) { sectionObserver.observe(el); });
})();

// Visitor counter — Surge serves static files only, so the count lives in a
// hosted counter API (countapi.mileshilliard.com, no signup, CORS-enabled).
// One increment per browser session: reloads re-read the value instead of inflating it.
(function () {
  var box = document.getElementById('visitor-count');
  var num = document.getElementById('visitor-count-num');
  if (!box || !num || !window.fetch) return;

  var KEY = 'firmware-developer-surge-sh-visits';
  var BASE = 'https://countapi.mileshilliard.com/api/v1';
  var alreadyCounted = false;
  try { alreadyCounted = sessionStorage.getItem('visitCounted') === '1'; } catch (e) {}

  fetch(BASE + (alreadyCounted ? '/get/' : '/hit/') + KEY, { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('counter HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var value = Number(data.value);
      if (!isFinite(value)) throw new Error('bad counter value');
      num.textContent = value.toLocaleString(document.documentElement.lang || 'it');
      box.hidden = false;
      if (!alreadyCounted) {
        try { sessionStorage.setItem('visitCounted', '1'); } catch (e) {}
      }
    })
    .catch(function () {
      // Counter unreachable: keep the line hidden rather than show a wrong number.
    });
})();
