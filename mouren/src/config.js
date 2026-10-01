/*
  Настройки сайта mouren — цены, оффер, контакты, приём заказов.
  Пустая строка '' = «не показывать».
*/
export const CONFIG = {
  // Тарифы. price — за весь период, days — на сколько дней хватает.
  plans: [
    {
      id: 'course',
      title: 'Курс «Снова собой» · 12 недель',
      badge: 'Рекомендуем · полный цикл',
      price: 18000,
      days: 90,
      tubes: 3,
      unit: 'за 3 месяца',
      guaranteeDays: 90,
      lines: ['3 тубы одной отправкой', 'Разбор ваших анализов с нутрициологом', 'Гарантия 90 дней'],
      billing: 'Следующее списание — через 3 месяца, напомним за 3 дня.',
    },
    {
      id: 'month',
      title: 'Подписка 30 дней',
      badge: '',
      price: 6675,
      days: 30,
      tubes: 1,
      unit: 'в месяц',
      guaranteeDays: 30,
      lines: ['Туба каждый месяц', 'Пауза и отмена в одно касание', 'Гарантия 30 дней'],
      billing: 'Следующее списание — через 30 дней, напомним за 3 дня.',
    },
    {
      id: 'once',
      title: 'Разовая туба',
      badge: '',
      price: 9000,
      days: 30,
      tubes: 1,
      unit: 'за 30 стиков',
      guaranteeDays: 30,
      lines: ['Без подписки и списаний', 'Гарантия 30 дней'],
      billing: 'Разовое списание. Никаких продлений.',
    },
  ],
  defaultPlan: 'course',

  // Якорь: те же формы и дозы по отдельности (расчёт по маркетплейсам)
  stackPrice: 15450,
  stackCount: 22,

  // Первая партия
  batchSize: 2000,
  batchLeft: null, // число оставшихся туб — ставьте, только если оно связано с реальными остатками

  // Бонусы стека ценности. value — честная рыночная стоимость в ₽ (0 — не показывать сумму).
  // firstBatch: true — только для первой партии.
  bonuses: [
    { title: 'Разбор ваших анализов с нутрициологом', note: 'на курсе 12 недель', value: 4500, plans: ['course'] },
    { title: 'Карта анализов «до и после»: ферритин, D, B12', note: 'что сдать и когда', value: 990, plans: ['course', 'month', 'once'] },
    { title: 'Дневник 12 недель в Telegram', note: '1 минута в неделю — видно, что меняется', value: 1490, plans: ['course', 'month'] },
    { title: 'Протокол мягкого старта', note: 'для чувствительного живота', value: 0, plans: ['course', 'month', 'once'] },
    { title: 'Паспорт партии: тяжёлые металлы и микробиология', note: 'лабораторный протокол', value: 0, plans: ['course', 'month', 'once'] },
    { title: 'Фиксированная цена навсегда', note: 'для подписчиц первой партии', value: 0, plans: ['course', 'month'], firstBatch: true },
    { title: 'Доставка по России', note: 'в любой город', value: 0, plans: ['course', 'month', 'once'] },
  ],

  // Приём заказов: адрес, принимающий POST с JSON заявки (Formspree, вебхук CRM, свой сервер)
  orderEndpoint: '',

  // Контакты: telegram — имя без @
  contacts: { email: '', phone: '', telegram: '' },

  // Подпись письма основателей
  founderSignature: 'Команда mouren',

  // Юридическое
  legal: { sgr: '', seller: '', offerUrl: '', privacyUrl: '' },
}

export const num = (n) => new Intl.NumberFormat('ru-RU').format(n).replace(/\s/g, '\u00a0')
export const rub = (n) => new Intl.NumberFormat('ru-RU').format(n).replace(/\s/g, ' ') + ' ₽'
export const perDay = (p) => Math.floor(p.price / p.days)
