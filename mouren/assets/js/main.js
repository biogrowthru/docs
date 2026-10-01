/* mouren — поведение страницы. Без сборки и зависимостей. Все настройки — в config.js. */
(function () {
  'use strict';

  var CFG = window.MOUREN_CONFIG || {};
  var NBSP = ' ';
  var doc = document;
  var root = doc.documentElement;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* хранилище недоступно — работаем без него */ }
    return null;
  }

  /* ---------- Числа и даты ---------- */
  var numFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  function fmtNum(n) { return numFmt.format(n).replace(/\s/g, NBSP); }
  function fmtRub(n) { return fmtNum(n) + NBSP + '₽'; }
  var plural = new Intl.PluralRules('ru-RU');
  function pl(n, forms) { // forms: { one, few, many }
    return forms[plural.select(n)] || forms.many;
  }
  var DAYS = { one: 'день', few: 'дня', many: 'дней', other: 'дня' };

  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function toISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fromISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d) ? null : d;
  }
  var fmtLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  var fmtDayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
  var fmtMonthShort = new Intl.DateTimeFormat('ru-RU', { month: 'short' });

  /* ---------- Тарифы из настроек ---------- */
  var PLANS = CFG.plans || {};
  var planIds = Object.keys(PLANS);
  function planView(id) {
    var p = PLANS[id];
    if (!p) return null;
    var economy = PLANS.sub30 && id !== 'sub30' ? Math.max(0, Math.round(PLANS.sub30.price * p.days / PLANS.sub30.days) - p.price) : 0;
    var perDay = Math.floor(p.price / p.days);
    return {
      id: id,
      title: p.title,
      short: p.title,
      sub: p.sub,
      note: (p.note || '').replace('{economy}', fmtRub(economy)),
      label: p.label,
      billing: p.billing,
      perDay: fmtRub(perDay),
      price: fmtRub(p.price),
      priceNum: fmtNum(p.price),
      total: fmtRub(p.price) + NBSP + p.unit.replace(/ /g, NBSP),
      meta: fmtRub(perDay) + ' в' + NBSP + 'день · возврат ' + p.refundDays + NBSP + pl(p.refundDays, DAYS),
      cta: 'Оформить — ' + fmtRub(p.price)
    };
  }

  // Подставляем цены и тексты тарифов во все [data-bind="план.поле"]
  $$('[data-bind]').forEach(function (el) {
    var parts = el.getAttribute('data-bind').split('.');
    var v = planView(parts[0]);
    if (v && v[parts[1]] != null) el.textContent = v[parts[1]];
  });

  var orderSelect = $('#order-plan');
  if (orderSelect) {
    $$('option', orderSelect).forEach(function (opt) {
      var v = planView(opt.value);
      if (v) opt.textContent = v.title + ' — ' + v.total.replace(/ /g, ' ');
      else opt.remove();
    });
  }

  var currentPlan = PLANS[CFG.defaultPlan] ? CFG.defaultPlan : (planIds[0] || 'sub30');

  function applyPlan(id) {
    var v = planView(id);
    if (!v) return;
    currentPlan = id;
    $$('[data-summary]').forEach(function (el) {
      var key = el.getAttribute('data-summary');
      if (v[key] != null) el.textContent = v[key];
    });
    $$('#plans input[name="plan"]').forEach(function (input) { input.checked = input.value === id; });
    if (orderSelect) orderSelect.value = id;
  }
  $$('#plans input[name="plan"]').forEach(function (input) {
    input.addEventListener('change', function () { if (input.checked) applyPlan(input.value); });
  });
  if (orderSelect) orderSelect.addEventListener('change', function () { applyPlan(orderSelect.value); });
  applyPlan(currentPlan);

  /* ---------- Тема ---------- */
  var themeBtn = $('#theme-toggle');
  var darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return darkMQ && darkMQ.matches ? 'dark' : 'light';
  }
  function syncThemeLabel() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('mouren-theme', next);
      syncThemeLabel();
    });
    if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener('change', syncThemeLabel);
    syncThemeLabel();
  }

  /* ---------- Направления: вкладки ---------- */
  var tabs = $$('.dir__tab');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = doc.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    if (tab.scrollIntoView && tab.parentElement.scrollWidth > tab.parentElement.clientWidth) {
      var bar = tab.parentElement;
      bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' });
    }
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- Состав: раскрыть всё ---------- */
  var sostavBtn = $('#sostav-toggle');
  var groups = $$('.sostav__group');
  function syncSostavBtn() {
    if (!sostavBtn) return;
    var allOpen = groups.every(function (g) { return g.open; });
    sostavBtn.textContent = allOpen ? 'Свернуть состав' : 'Раскрыть все 31' + NBSP + 'позицию';
    sostavBtn.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
  }
  if (sostavBtn) {
    sostavBtn.addEventListener('click', function () {
      var allOpen = groups.every(function (g) { return g.open; });
      groups.forEach(function (g) { g.open = !allOpen; });
      syncSostavBtn();
    });
    groups.forEach(function (g) { g.addEventListener('toggle', syncSostavBtn); });
    syncSostavBtn();
  }

  /* ---------- Курс: 30 стиков по календарю ---------- */
  var COURSE = 30;
  var REMIND_DAY = 28;   // за 3 дня до следующей тубы
  var LABS_DAY = 85;     // через 12 недель после первого стика
  var startInput = $('#kurs-start');
  var timeInput = $('#kurs-time');
  var sticksList = $('#planner-sticks');
  var dayOut = $('#planner-day');
  var selectedDay = 1;

  function dayNote(n) {
    if (n === 1) return 'первый стик';
    if (n === REMIND_DAY) return 'напомним о продлении';
    if (n === COURSE) return 'последний стик в тубе';
    return '';
  }
  function describeDay(n, start) {
    var d = addDays(start, n - 1);
    var note = dayNote(n);
    var t = today();
    var rel = sameDay(d, t) ? ' · сегодня' : '';
    return 'День ' + n + ' из ' + COURSE + ' — ' + fmtLong.format(d) + rel + (note ? ' · ' + note : '');
  }
  function getStart() {
    return fromISO(startInput && startInput.value) || addDays(today(), 1);
  }

  function renderPlanner() {
    if (!sticksList) return;
    var start = getStart();
    var t = today();
    var frag = doc.createDocumentFragment();
    var prevMonth = -1;
    for (var i = 0; i < COURSE; i++) {
      var n = i + 1;
      var d = addDays(start, i);
      var li = doc.createElement('li');
      if (i === 0) {
        var wd = (d.getDay() + 6) % 7; // понедельник = 0
        li.style.gridColumnStart = String(wd + 1);
      }
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'stick-btn';
      if (n === 1) b.classList.add('is-first');
      if (n === COURSE) b.classList.add('is-last');
      if (n === REMIND_DAY) b.classList.add('is-remind');
      if (d < t) b.classList.add('is-past');
      if (sameDay(d, t)) b.classList.add('is-today');
      b.setAttribute('aria-pressed', n === selectedDay ? 'true' : 'false');
      b.setAttribute('aria-label', describeDay(n, start));
      b.dataset.day = String(n);
      var month = '';
      if (d.getMonth() !== prevMonth) { month = fmtMonthShort.format(d).replace('.', ''); prevMonth = d.getMonth(); }
      b.innerHTML = '<svg aria-hidden="true" focusable="false"><use href="#stick"/></svg>' +
        '<span class="stick-btn__date"><span class="stick-btn__month">' + month + '</span>' + d.getDate() + '</span>';
      li.appendChild(b);
      frag.appendChild(li);
    }
    sticksList.textContent = '';
    sticksList.appendChild(frag);
    if (dayOut) dayOut.textContent = describeDay(selectedDay, start);

    var map = {
      start: fmtLong.format(start),
      end: fmtLong.format(addDays(start, COURSE - 1)),
      remind: fmtLong.format(addDays(start, REMIND_DAY - 1)),
      labs: fmtDayMonth.format(addDays(start, LABS_DAY - 1)) + ' ' + addDays(start, LABS_DAY - 1).getFullYear()
    };
    $$('[data-kurs]').forEach(function (el) { el.textContent = map[el.getAttribute('data-kurs')] || '—'; });

    // Сколько утр осталось, если курс уже идёт
    var done = Math.floor((t - start) / 864e5);
    if (done >= 0 && done < COURSE && dayOut && selectedDay === 1) {
      var left = COURSE - done;
      dayOut.textContent = 'Сегодня день ' + (done + 1) + ' из ' + COURSE + ' — осталось ' + left + NBSP + pl(left, { one: 'утро', few: 'утра', many: 'утр' }) + '.';
    }
  }

  if (sticksList) {
    sticksList.addEventListener('click', function (e) {
      var b = e.target.closest('.stick-btn');
      if (!b) return;
      selectedDay = +b.dataset.day;
      $$('.stick-btn', sticksList).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (dayOut) dayOut.textContent = describeDay(selectedDay, getStart());
    });
  }
  if (startInput) {
    var saved = fromISO(store('mouren-start'));
    startInput.value = toISO(saved || addDays(today(), 1));
    startInput.addEventListener('change', function () {
      if (!fromISO(startInput.value)) return;
      store('mouren-start', startInput.value);
      selectedDay = 1;
      renderPlanner();
    });
  }
  if (timeInput) {
    var savedTime = store('mouren-time');
    if (/^\d{2}:\d{2}$/.test(savedTime || '')) timeInput.value = savedTime;
    timeInput.addEventListener('change', function () { store('mouren-time', timeInput.value); });
  }
  renderPlanner();

  // Файл календаря: ежедневное напоминание на 30 утр + день продления + анализы
  function icsFold(line) {
    var out = [];
    var cur = '';
    var bytes = 0;
    for (var ch of line) {
      var b = new TextEncoder().encode(ch).length;
      if (bytes + b > 73) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join('\r\n');
  }
  function icsDate(d, hh, mm) {
    return toISO(d).replace(/-/g, '') + 'T' + String(hh).padStart(2, '0') + String(mm).padStart(2, '0') + '00';
  }
  function icsEvent(uid, start, hh, mm, minutes, summary, desc, rrule) {
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), hh, mm + minutes);
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var lines = [
      'BEGIN:VEVENT',
      'UID:' + uid + '@mouren',
      'DTSTAMP:' + stamp,
      'DTSTART:' + icsDate(start, hh, mm),
      'DTEND:' + icsDate(end, end.getHours(), end.getMinutes()),
      'SUMMARY:' + summary,
      'DESCRIPTION:' + desc
    ];
    if (rrule) lines.push('RRULE:' + rrule);
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + summary, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
    return lines;
  }
  var icsBtn = $('#kurs-ics');
  if (icsBtn) {
    icsBtn.addEventListener('click', function () {
      var start = getStart();
      var tm = /^(\d{2}):(\d{2})$/.exec(timeInput && timeInput.value) || [0, '08', '00'];
      var hh = +tm[1], mm = +tm[2];
      var seed = toISO(start).replace(/-/g, '') + '-' + Date.now().toString(36);
      var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//mouren//kurs//RU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
        .concat(icsEvent('daily-' + seed, start, hh, mm, 10, 'mouren: утренний стик', 'Стакан холодной воды\\, стик\\, 20 секунд размешать.', 'FREQ=DAILY;COUNT=' + COURSE))
        .concat(icsEvent('renew-' + seed, addDays(start, REMIND_DAY - 1), hh, mm, 10, 'mouren: продлить или поставить паузу', 'Через 3 дня закончится туба на 30 стиков.'))
        .concat(icsEvent('labs-' + seed, addDays(start, LABS_DAY - 1), hh, mm, 10, 'mouren: анализы «после»', 'Ферритин\\, витамин D и B12 — сравнить с анализами до первого стика.'))
        .concat(['END:VCALENDAR']);
      var text = lines.map(icsFold).join('\r\n') + '\r\n';
      var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = doc.createElement('a');
      a.href = url;
      a.download = 'mouren-30-utr.ics';
      doc.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    });
  }

  /* ---------- Нижняя плашка ---------- */
  var bar = $('#sticky-bar');
  var hero = $('#top');
  var tarify = $('#tarify');
  if (bar && hero && 'IntersectionObserver' in window) {
    var heroVisible = true, tarifyVisible = false;
    var syncBar = function () { bar.classList.toggle('is-hidden', heroVisible || tarifyVisible); };
    bar.hidden = false;
    bar.classList.add('is-hidden');
    doc.body.classList.add('has-bar');
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; syncBar(); }, { threshold: 0.05 }).observe(hero);
    if (tarify) new IntersectionObserver(function (es) { tarifyVisible = es[0].isIntersecting; syncBar(); }, { threshold: 0.12 }).observe(tarify);
  }

  /* ---------- Предупреждение «Не является лекарственным средством»: не меньше 10 % площади блока ---------- */
  var SHARE = 0.12; // с запасом: 0,12 / 1,12 ≈ 10,7 % высоты блока
  function sizeWarn(band) {
    var block = band.parentElement;
    if (!block) return;
    var rest = block.offsetHeight - band.offsetHeight;
    var target = Math.max(96, Math.ceil(rest * SHARE));
    if (Math.abs(band.offsetHeight - target) > 2) band.style.minHeight = target + 'px';
  }
  var warns = $$('[data-warn]');
  warns.forEach(sizeWarn);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { warns.forEach(sizeWarn); });
    warns.forEach(function (b) { if (b.parentElement) ro.observe(b.parentElement); });
  } else {
    window.addEventListener('resize', function () { warns.forEach(sizeWarn); });
  }

  /* ---------- Контакты и юридические данные ---------- */
  var C = CFG.contacts || {};
  var L = CFG.legal || {};
  function link(href, text) {
    var a = doc.createElement('a');
    a.href = href; a.textContent = text;
    if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  function contactLinks() {
    var out = [];
    if (C.telegram) out.push(link('https://t.me/' + String(C.telegram).replace(/^@/, ''), 'Telegram'));
    if (C.email) out.push(link('mailto:' + C.email, C.email));
    if (C.phone) out.push(link('tel:' + String(C.phone).replace(/[^\d+]/g, ''), C.phone));
    return out;
  }
  $$('[data-contacts]').forEach(function (wrap) {
    var list = $('[data-contacts-list]', wrap);
    var links = contactLinks();
    if (!links.length || !list) return;
    links.forEach(function (a, i) { if (i) list.appendChild(doc.createTextNode(' · ')); list.appendChild(a); });
    wrap.hidden = false;
  });
  var legalText = {
    sgr: L.sgr ? 'Свидетельство о государственной регистрации ' + L.sgr : '',
    maker: L.maker ? 'Изготовитель: ' + L.maker : '',
    seller: L.seller ? 'Продавец: ' + L.seller : ''
  };
  $$('[data-legal]').forEach(function (el) {
    var t = legalText[el.getAttribute('data-legal')];
    if (t) { el.textContent = t; el.hidden = false; }
  });
  var legalNav = $('[data-legal-links]');
  if (legalNav) {
    [['offerUrl', 'Публичная оферта'], ['subscriptionUrl', 'Условия подписки'], ['privacyUrl', 'Политика обработки персональных данных']].forEach(function (x) {
      if (L[x[0]]) legalNav.appendChild(link(L[x[0]], x[1]));
    });
    if (legalNav.children.length) legalNav.hidden = false;
  }
  var privacySlot = $('[data-privacy-link]');
  if (privacySlot && L.privacyUrl) {
    privacySlot.appendChild(doc.createTextNode(' — '));
    privacySlot.appendChild(link(L.privacyUrl, 'политика'));
  }
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Оформление заказа ---------- */
  var dialog = $('#order');
  var form = $('#order-form');
  var lastOpener = null;
  function showStep(name) {
    $$('.order__step', form).forEach(function (s) { s.hidden = s.getAttribute('data-step') !== name; });
  }
  function openOrder(opener) {
    if (!dialog) return;
    lastOpener = opener || null;
    showStep('form');
    if (orderSelect) orderSelect.value = currentPlan;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    root.classList.add('has-dialog');
    var first = $('#order-name');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function closeOrder() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close(); else dialog.removeAttribute('open');
  }
  if (dialog) {
    dialog.addEventListener('close', function () {
      root.classList.remove('has-dialog');
      if (lastOpener && lastOpener.focus) lastOpener.focus();
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeOrder(); });
  }
  $$('[data-order-open]').forEach(function (b) { b.addEventListener('click', function () { openOrder(b); }); });
  $$('[data-order-close]').forEach(function (b) { b.addEventListener('click', closeOrder); });

  var rules = {
    name: function (v) { return v.trim() ? '' : 'Укажите имя'; },
    phone: function (v) { var d = v.replace(/\D/g, ''); return d.length >= 10 && d.length <= 12 ? '' : 'Укажите телефон: 10–11 цифр'; },
    email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Проверьте адрес почты'; },
    address: function (v) { return v.trim().length >= 5 ? '' : 'Укажите город и адрес'; }
  };
  function setError(input, msg) {
    var err = doc.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) {
      err.textContent = msg;
      if (msg) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
    }
  }
  function validate() {
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      var msg = rules[name](input.value);
      setError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    var consent = form.elements.consent;
    var cErr = $('#order-consent-error');
    if (consent && !consent.checked) {
      if (cErr) cErr.textContent = 'Нужно согласие на обработку данных';
      consent.setAttribute('aria-invalid', 'true');
      if (!firstBad) firstBad = consent;
    } else if (consent) {
      if (cErr) cErr.textContent = '';
      consent.removeAttribute('aria-invalid');
    }
    return firstBad;
  }
  function orderText(data) {
    var v = planView(data.plan);
    return [
      'Заявка на mouren',
      'Тариф: ' + v.label,
      'Сумма: ' + v.total,
      'Имя: ' + data.name,
      'Телефон: ' + data.phone,
      data.email ? 'Email: ' + data.email : '',
      'Адрес: ' + data.address
    ].filter(Boolean).join('\n').replace(/ /g, ' ');
  }
  function showManual(data, failed) {
    var text = orderText(data);
    var area = $('#order-copy');
    if (area) area.value = text;
    var msg = $('[data-manual-text]');
    var links = contactLinks();
    if (msg) {
      if (failed) msg.textContent = 'Не получилось отправить заявку. Скопируйте текст и отправьте его нам — подтвердим заказ и оплату.';
      else if (links.length) msg.textContent = 'Скопируйте текст заявки и отправьте его нам удобным способом — подтвердим заказ и оплату.';
      else msg.textContent = 'Заявка собрана. Приём заказов через сайт ещё не подключён — сохраните текст заявки.';
    }
    var slot = $('[data-manual-channels]');
    if (slot) {
      slot.textContent = '';
      links.forEach(function (a, i) {
        if (C.email && a.href.indexOf('mailto:') === 0) {
          a.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Заказ mouren') + '&body=' + encodeURIComponent(text);
          a.textContent = 'Отправить письмо';
        }
        if (i) slot.appendChild(doc.createTextNode(' · '));
        slot.appendChild(a);
      });
    }
    showStep('manual');
  }
  if (form) {
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (t.getAttribute('aria-invalid') === 'true' && rules[t.name]) setError(t, rules[t.name](t.value));
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) { bad.focus(); return; }
      var data = {
        plan: form.elements.plan.value,
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        address: form.elements.address.value.trim()
      };
      var v = planView(data.plan);
      var endpoint = CFG.order && CFG.order.endpoint;
      if (!endpoint) { showManual(data, false); return; }
      var submit = $('.order__submit', form);
      if (submit) { submit.disabled = true; submit.textContent = 'Отправляем…'; }
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          plan: data.plan, planLabel: v.label, price: PLANS[data.plan].price, currency: 'RUB',
          name: data.name, phone: data.phone, email: data.email, address: data.address,
          consent: true, page: location.href, createdAt: new Date().toISOString()
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        showStep('sent');
      }).catch(function () {
        showManual(data, true);
      }).then(function () {
        if (submit) { submit.disabled = false; submit.textContent = planView(currentPlan).cta; }
      });
    });
  }
  var copyBtn = $('#order-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var area = $('#order-copy');
      var out = $('#order-copied');
      var done = function (ok) { if (out) out.textContent = ok ? 'Скопировано' : 'Текст выделен — скопируйте его вручную'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(function () { done(true); }, function () { area.select(); done(false); });
      } else {
        area.select();
        var ok = false;
        try { ok = doc.execCommand('copy'); } catch (err) { ok = false; }
        done(ok);
      }
    });
  }

  /* ---------- Яндекс Метрика (если указан номер счётчика) ---------- */
  var ymId = CFG.analytics && String(CFG.analytics.yandexMetrikaId || '').trim();
  if (ymId && /^\d+$/.test(ymId)) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    var s = doc.createElement('script');
    s.async = true;
    s.src = 'https://mc.yandex.ru/metrika/tag.js';
    doc.head.appendChild(s);
    window.ym(+ymId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  }
})();
