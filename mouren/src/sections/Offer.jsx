import { useEffect, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { Fade, Shield, Check } from '../components/ui.jsx'
import { CONFIG, rub, perDay, num } from '../config.js'
import { Logo } from '../components/Logo.jsx'

const plan = (id) => CONFIG.plans.find((p) => p.id === id)

function stackFor(p) {
  const items = [{ title: `${p.tubes === 3 ? '3 тубы mouren, 90 стиков' : 'Туба mouren, 30 стиков'}`, note: `если собирать 22 добавки по отдельности`, value: CONFIG.stackPrice * p.tubes }]
  CONFIG.bonuses.filter((b) => b.plans.includes(p.id)).forEach((b) => items.push(b))
  return items
}

export function Plans({ planId, setPlanId, onOrder }) {
  const order = ['month', 'course', 'once'].map(plan).filter(Boolean)
  const p = plan(planId)
  const stack = stackFor(p)
  const totalValue = stack.reduce((s, x) => s + (x.value || 0), 0)
  return (
    <section id="tarify" className="bg-white py-20 md:py-28" aria-labelledby="plans-title">
      <div className="wrap">
        <Fade><p className="label text-wine/70">Тариф и гарантия</p></Fade>
        <Fade><h2 id="plans-title" className="h2 mt-3 max-w-[16em]">12 недель, чтобы снова узнать себя в&nbsp;зеркале</h2></Fade>
        <Fade><p className="lead mt-4 max-w-[38em] text-black/60">
          <s className="text-black/40">{rub(CONFIG.stackPrice)} в месяц за 22 добавки</s> → {rub(plan('month').price)} → <b className="text-wine">{rub(perDay(plan('course')))} в день на курсе</b>. Дешевле капучино по дороге на работу.
        </p></Fade>

        <LayoutGroup>
          <div className="mt-9 grid gap-3 pt-3 md:grid-cols-3 md:items-stretch md:gap-4" role="radiogroup" aria-label="Выберите тариф">
            {order.map((x) => {
              const on = x.id === planId
              return (
                <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => setPlanId(x.id)}
                  className={`relative flex flex-col gap-3 rounded-[24px] p-6 text-left transition-colors duration-300 cursor-pointer md:p-7 ${on ? 'bg-wine text-white' : 'border border-wine/12 bg-white text-ink hover:border-wine/35'} ${x.id === 'course' ? 'order-first md:order-none md:-my-3 md:py-10' : ''}`}>
                  {x.badge && <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[12px] font-semibold ${on ? 'bg-blush text-wine' : 'bg-wine text-blush'}`}>{x.badge}</span>}
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-[20px] font-semibold leading-tight">{x.title}</span>
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-blush' : 'border-black/25'}`}>{on && <motion.span layoutId="plan-dot" className="size-2.5 rounded-full bg-blush" />}</span>
                  </span>
                  <span className="flex items-baseline gap-2"><b className={`tnum text-[44px] font-bold leading-none tracking-[-0.03em] ${on ? 'text-blush' : ''}`}>{rub(perDay(x))}</b><span className={on ? 'text-white/70' : 'text-black/55'}>в день</span></span>
                  <span className="tnum text-[16px] font-semibold">{rub(x.price)} {x.unit}{x.id === 'course' && <s className={`ml-2 font-normal ${on ? 'text-white/45' : 'text-black/35'}`}>{rub(plan('month').price * 3)}</s>}</span>
                  <ul className={`mt-1 flex flex-col gap-1.5 text-[14px] ${on ? 'text-white/80' : 'text-black/65'}`}>
                    {x.lines.map((l) => <li key={l} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />{l}</li>)}
                    {x.id === 'course' && <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />Экономия {rub(plan('month').price * 3 - x.price)}</li>}
                  </ul>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <Fade className="card p-6 md:p-8">
            <p className="label text-wine/70">Что вы получаете</p>
            <AnimatePresence mode="wait">
              <motion.ul key={planId} className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {stack.map((s) => (
                  <li key={s.title} className="flex items-start justify-between gap-4 border-t border-wine/8 py-3.5 first:border-t-0">
                    <span><span className="block text-[15.5px] font-semibold">{s.title}{s.firstBatch && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 align-middle text-[11px] font-semibold text-wine">первая партия</span>}</span>{s.note && <span className="text-[13px] text-black/50">{s.note}</span>}</span>
                    <span className="tnum shrink-0 text-[15px] font-semibold text-black/70">{s.value ? rub(s.value) : 'в подарок'}</span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t-2 border-wine/15 pt-4">
              <span className="text-black/60">Общая ценность</span><s className="tnum text-[22px] font-bold text-black/40">{rub(totalValue)}</s>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-semibold">Вы платите</span><b className="tnum text-[34px] font-bold text-wine">{rub(p.price)}</b>
            </div>
          </Fade>

          <Fade className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-[24px] bg-blush p-7 text-wine">
              <div className="flex items-center gap-3"><Shield className="size-7" /><p className="label">Гарантия пустой тубы</p></div>
              <p className="mt-4 text-[clamp(22px,2.4vw,28px)] font-bold leading-tight">Допейте до последнего стика. Не почувствовали разницу — вернём 100&nbsp;%.</p>
              <p className="mt-3 text-[15px] leading-relaxed text-wine/80">Тубу возвращать не нужно — даже пустую. Карта анализов и дневник остаются у вас. {p.guaranteeDays} дней на этом тарифе. Мы забираем весь риск себе — потому что уверены в составе.</p>
            </div>
            <div className="rounded-[24px] bg-wine p-7 text-white">
              <p className="label text-blush/60">Подписка без ловушек</p>
              <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-white/85">
                <li className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-blush" />Напомним за 3 дня до каждого списания</li>
                <li className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-blush" />Пауза и отмена — одна кнопка, без звонков и уговоров</li>
                <li className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-blush" />Гарантия на любой заказ, а не только на первый</li>
              </ul>
              <button type="button" onClick={onOrder} className="btn btn-blush mt-6 w-full">Оформить — {rub(p.price)}</button>
              <p className="mt-3 text-center text-[13px] text-white/55">{p.billing} Доставка 0 ₽.</p>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  )
}

const CHECKS = [
  ['Беременна или кормлю грудью', 'Дозировки рассчитаны на небеременных взрослых — согласуйте приём с врачом.'],
  ['Принимаю варфарин или другие антикоагулянты', 'В составе витамин K2 — только после согласования с врачом.'],
  ['Есть заболевания щитовидной железы, принимаю L-тироксин', 'Йод 150 мкг — обсудите с эндокринологом; L-тироксин и стик — с интервалом 4 часа.'],
  ['Аллергия на рыбу', 'Коллаген в составе — рыбный.'],
  ['Мне меньше 18 лет', 'mouren создан для взрослых.'],
]

export function FitCheck({ onOrder }) {
  const [checked, setChecked] = useState({})
  const any = Object.values(checked).some(Boolean)
  return (
    <section className="bg-blush-soft py-20 md:py-28" aria-labelledby="fit-title">
      <div className="wrap grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <Fade><h2 id="fit-title" className="h2">Подходит ли мне?</h2></Fade>
          <Fade><p className="lead mt-4 text-black/60">Минута честности до покупки. Отметьте, что про вас, — и получите прямой ответ. Нам важнее, чтобы mouren вам подошёл, чем чтобы вы его купили.</p></Fade>
        </div>
        <div>
          <ul className="flex flex-col gap-2">
            {CHECKS.map(([t, d], k) => (
              <li key={t}>
                <label className={`flex cursor-pointer gap-3 rounded-[18px] border p-4 transition-colors ${checked[k] ? 'border-wine bg-white' : 'border-wine/10 bg-white/70 hover:border-wine/30'}`}>
                  <input type="checkbox" className="mt-0.5 size-5 accent-[#471D1F]" checked={!!checked[k]} onChange={(e) => setChecked({ ...checked, [k]: e.target.checked })} />
                  <span><span className="block text-[15.5px] font-medium">{t}</span>{checked[k] && <span className="mt-1 block text-[14px] text-wine">{d}</span>}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-[20px] bg-wine p-5 text-white" aria-live="polite">
            {any
              ? <p className="text-[15.5px] leading-relaxed">Покажите состав врачу перед стартом — <a href="#sostav" className="underline underline-offset-4">вот он целиком</a>. Если врач одобрит, гарантия действует как обычно.</p>
              : <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-[15.5px]">Ничего из списка? mouren вам подходит.</p><button type="button" onClick={onOrder} className="btn btn-blush min-h-[48px] text-[15.5px]">Выбрать курс</button></div>}
          </div>
        </div>
      </div>
    </section>
  )
}

const FAQ = [
  ['Когда я почувствую разницу?', 'Живот обычно отвечает первым — на 1–2 неделе. Энергия к вечеру — на 3–4, сон и цикл — на 5–6, ногти — на 7–8, кожа — на 9–10, волосы — к 12-й. Поэтому мы рекомендуем курс 12 недель, а не одну тубу.'],
  ['Почему порошок, а не капсулы?', '12,8 г активных веществ в день — это 25 капсул. В стик всё помещается за один раз, а пробиотики и клетчатка в порошке стабильнее.'],
  ['Какой вкус?', 'Клубника и малина, без сахара: стевия и эритрит. Цвет — от чёрной моркови и свёклы. Разводите в 200–250 мл холодной воды. Если сладко — в 300 мл.'],
  ['Можно пить постоянно?', 'Да, дозировки рассчитаны на ежедневный приём без перерывов. Раз в полгода имеет смысл сдавать ферритин, D и B12 — чтобы видеть эффект в цифрах.'],
  ['Совместим с другими добавками?', 'Если пьёте отдельно магний, железо или D3 — их можно убрать: они уже здесь. Омегу-3 оставьте, её в составе нет.'],
  ['А если у меня чувствительный живот?', 'Начните по протоколу мягкого старта: первые 5 дней — половина стика. Клетчатке нужно время подружиться с вами. Протокол приходит с заказом.'],
  ['Как работает гарантия?', 'Не почувствовали разницу — напишите номер заказа, вернём 100 % туда, откуда вы платили. Тубу присылать не нужно. 30 дней на подписке и разовой покупке, 90 дней — на курсе 12 недель.'],
  ['Как отменить подписку?', 'Одной кнопкой в личном кабинете. Без звонков и писем «а может, останетесь?». Напомним за 3 дня до каждого списания.'],
  ['Почему столько стоит?', `Те же вещества по отдельности — 22 добавки и от ${num(CONFIG.stackPrice)} ₽ в месяц. Здесь — 6 675 ₽, или 200 ₽ в день на курсе. Дешевле капучино.`],
  ['Чем лучше аптечных витаминов?', 'Формами и дозами. Бисглицинаты вместо оксидов, P5P, метилфолат, метил-B12, K2 MK-7 — плюс коллаген, пробиотики, инозитол и теанин, которых в аптечных мультивитаминах нет.'],
  ['Можно вместе с КОК?', 'Противопоказаний к совместному приёму в составе нет. КОК могут снижать уровень B6, B12, фолата и магния — все они здесь есть. Приём лучше обсудить с гинекологом.'],
  ['Почему нет отзывов?', 'Потому что мы только запускаемся и не покупаем отзывы. Первые настоящие истории появятся после 30 дней у первых покупательниц — с плюсами и минусами.'],
]

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="voprosy" className="bg-white py-20 md:py-28" aria-labelledby="faq-title">
      <div className="wrap grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <Fade><h2 id="faq-title" className="h2">Перед тем как оформить</h2></Fade>
        <ul className="flex flex-col gap-2">
          {FAQ.map(([q, a], k) => (
            <li key={q} className="card overflow-hidden">
              <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? -1 : k)} className="flex w-full items-center justify-between gap-4 p-5 text-left text-[16.5px] font-semibold cursor-pointer">
                {q}<span className={`text-[22px] font-normal text-wine transition-transform duration-300 ${open === k ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
              </button>
              <AnimatePresence initial={false}>
                {open === k && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-[15.5px] leading-relaxed text-black/65">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FinalCta({ onOrder }) {
  const c = plan('course')
  return (
    <section className="bg-wine py-20 text-white md:py-28" aria-labelledby="final-title">
      <div className="wrap text-center">
        <Fade><h2 id="final-title" className="mx-auto max-w-[14em] text-[clamp(34px,5vw,64px)] font-bold leading-[1.04] text-blush">Через 12 недель вы снова узнаете себя в&nbsp;зеркале</h2></Fade>
        <Fade><p className="lead mx-auto mt-5 max-w-[34em] text-white/75">Один стик утром. 20 секунд. {rub(perDay(c))} в день. А если не почувствуете разницу — вернём деньги, тубу оставьте себе.</p></Fade>
        <Fade className="mt-8 flex flex-col items-center gap-3">
          <button type="button" onClick={onOrder} className="btn btn-blush w-full max-w-[420px]">Забрать тубу из первой партии</button>
          <p className="text-[13.5px] text-white/55">Первая партия — {num(CONFIG.batchSize)} туб · доставка 0 ₽ · отмена в одно касание</p>
        </Fade>
      </div>
    </section>
  )
}

export function Footer() {
  const L = CONFIG.legal, C = CONFIG.contacts
  return (
    <footer className="bg-wine-deep pb-28 pt-16 text-white/60 md:pb-16">
      <div className="wrap flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="max-w-[24em]"><Logo className="h-6 w-auto text-blush" /><p className="mt-4 text-[14px] leading-relaxed">Your daily ultimate essentials + collagen. 31 активное вещество, 30 стиков по 15 г.</p></div>
          <nav aria-label="Разделы сайта" className="flex flex-wrap gap-x-6 gap-y-2 text-[14.5px]">
            {[['#sostav', 'Состав'], ['#kurs', 'Курс 12 недель'], ['#tarify', 'Цены и гарантия'], ['#voprosy', 'Вопросы']].map(([h, t]) => <a key={h} href={h} className="hover:text-blush">{t}</a>)}
            {L.offerUrl && <a href={L.offerUrl} className="hover:text-blush">Публичная оферта</a>}
            {L.privacyUrl && <a href={L.privacyUrl} className="hover:text-blush">Политика конфиденциальности</a>}
          </nav>
        </div>
        {(C.email || C.phone || C.telegram) && (
          <p className="flex flex-wrap gap-x-5 text-[14.5px] text-white/75">
            {C.telegram && <a href={`https://t.me/${C.telegram.replace('@', '')}`}>Telegram</a>}{C.email && <a href={`mailto:${C.email}`}>{C.email}</a>}{C.phone && <a href={`tel:${C.phone.replace(/[^\d+]/g, '')}`}>{C.phone}</a>}
          </p>
        )}
        <div className="border-t border-white/10 pt-6 text-[12.5px] leading-relaxed">
          {L.sgr && <p>Свидетельство о государственной регистрации {L.sgr}</p>}
          {L.seller && <p>Продавец: {L.seller}</p>}
          <p>БАД. Не является лекарственным средством. Не превышайте рекомендуемую дозировку. Перед применением проконсультируйтесь со специалистом.</p>
          <p className="mt-2">© {new Date().getFullYear()} mouren</p>
        </div>
      </div>
    </footer>
  )
}

export function StickyBar({ planId, onOrder }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => {
      const t = document.getElementById('tarify')
      const r = t ? t.getBoundingClientRect() : null
      const inTarify = r ? r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4 : false
      setShow(window.scrollY > window.innerHeight * 0.8 && !inTarify)
    }
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  const p = plan(planId)
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(12px,env(safe-area-inset-bottom))]" initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 400, damping: 36 }}>
          <div className="mx-auto flex max-w-[620px] items-center justify-between gap-3 rounded-full bg-wine py-2 pl-6 pr-2 text-white shadow-[0_20px_50px_-15px_rgba(71,29,31,.7)]">
            <p className="min-w-0 leading-tight"><b className="tnum block text-[16px]">{rub(perDay(p))} в день</b><span className="block truncate text-[12.5px] text-white/65">{p.title.replace(/\s·.*/, '')} · гарантия {p.guaranteeDays} дней</span></p>
            <button type="button" onClick={onOrder} className="btn btn-blush min-h-[48px] shrink-0 px-6 text-[15.5px]">Оформить</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
