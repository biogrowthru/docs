import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, motion, AnimatePresence } from 'motion/react'
import { CONFIG, rub, perDay } from './config.js'
import { COMPOSITION } from './productData.js'
import { asset, Shield, Check } from './components/ui.jsx'
import { Logo } from './components/Logo.jsx'
import { PromoBar } from './sections/Top.jsx'
import { Science, Reviews } from './sections/Science.jsx'
import { Faq, Footer } from './sections/Offer.jsx'
import { OrderSheet } from './sections/Order.jsx'

const plan = (id) => CONFIG.plans.find((p) => p.id === id)
const ONCE = plan('once')

/* ---------- Галерея ---------- */
const SLIDES = [
  { id: 'pack', alt: 'mouren — 30 стиков по 15 г', render: () => <img src={asset('img/hero-pack.webp')} alt="" className="size-full object-cover mix-blend-multiply" />, bg: 'bg-blush' },
  { id: 'set', alt: 'mouren на бордовом фоне', render: () => <img src={asset('img/mouren-set-720.webp')} alt="" className="mx-auto h-[86%] w-auto self-end object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,.45)]" />, bg: 'bg-wine' },
  {
    id: 'facts', alt: 'Ключевые цифры состава', bg: 'bg-blush-soft', render: () => (
      <div className="flex size-full flex-col justify-center gap-4 p-8 text-wine md:p-12">
        <p className="label">В одном стике 15 г</p>
        {[['2 500 мг', 'коллагеновых пептидов'], ['13', 'витаминов в активных формах'], ['6', 'минералов, 3 — бисглицинаты'], ['5,65 г', 'пребиотических волокон'], ['12 млрд', 'пробиотических клеток']].map(([v, l]) => (
          <div key={l} className="flex items-baseline gap-3 border-b border-wine/10 pb-3"><b className="tnum text-[clamp(26px,3.4vw,40px)] font-bold leading-none tracking-[-0.03em]">{v}</b><span className="text-[15px] text-wine/70">{l}</span></div>
        ))}
      </div>
    ),
  },
  {
    id: 'ritual', alt: 'Как принимать', bg: 'bg-wine', render: () => (
      <div className="flex size-full flex-col justify-center gap-5 p-8 text-white md:p-12">
        <p className="label text-blush/60">Ритуал на 20 секунд</p>
        {['Стакан холодной воды, 200–250 мл', 'Высыпать стик, 20 секунд размешать', 'Выпить с завтраком'].map((t, i) => (
          <div key={t} className="flex items-center gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-[17px] font-bold text-wine">{i + 1}</span><span className="text-[clamp(18px,2vw,24px)] font-semibold leading-tight">{t}</span></div>
        ))}
        <p className="text-[15px] text-white/65">Клубника и малина. Без сахара и кофеина.</p>
      </div>
    ),
  },
]

function Gallery() {
  const [i, setI] = useState(0)
  return (
    <div className="md:sticky md:top-24">
      <div className="relative aspect-[1/0.86] overflow-hidden rounded-[24px] md:aspect-square md:rounded-[28px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={SLIDES[i].id} className={`absolute inset-0 flex ${SLIDES[i].bg}`} role="img" aria-label={SLIDES[i].alt}
            initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x < -50) setI((i + 1) % SLIDES.length); if (info.offset.x > 50) setI((i + SLIDES.length - 1) % SLIDES.length) }}>
            {SLIDES[i].render()}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
          {SLIDES.map((s, k) => <span key={s.id} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-wine' : 'w-1.5 bg-wine/30'}`} />)}
        </div>
      </div>
      <div className="mt-3 hidden grid-cols-4 gap-2 md:grid">
        {SLIDES.map((s, k) => (
          <button key={s.id} type="button" aria-label={s.alt} aria-pressed={k === i} onClick={() => setI(k)}
            className={`relative aspect-square overflow-hidden rounded-[16px] cursor-pointer ${s.bg} ${k === i ? 'ring-2 ring-wine ring-offset-2' : 'opacity-75 hover:opacity-100'}`}>
            <div className="pointer-events-none absolute inset-0 flex origin-top-left scale-[0.25] [width:400%] [height:400%]">{s.render()}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Блок покупки ---------- */
function BuyBox({ planId, setPlanId, onBuy }) {
  const p = plan(planId)
  const isSub = planId !== 'once'
  const lastSub = useRef(planId === 'once' ? 'course' : planId)
  useEffect(() => { if (planId !== 'once') lastSub.current = planId }, [planId])
  const compare = ONCE.price * (p.days / ONCE.days)
  const save = compare - p.price
  const gifts = CONFIG.bonuses.filter((b) => b.plans.includes(planId))
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label text-wine/70">Разработано учёными НИЦ «Сколково»</p>
        <h1 className="mt-2 text-[clamp(27px,3.6vw,44px)] font-bold leading-[1.05]">mouren Daily Ultimate Essentials + Collagen</h1>
        <a href="#otzyvy" className="mt-2 inline-flex items-center gap-2 text-[14px] text-black/60 hover:text-wine"><span className="tracking-[2px] text-wine">★★★★★</span>Отзывы и мнения врачей</a>
        <p className="mt-3 text-[15px] leading-relaxed text-black/70 md:text-[16px]">Все витамины на день — в одном утреннем стике. 31 актив в рабочих дозах вместо 22 добавок: коллаген 2,5 г, 13 витаминов в активных формах, 6 минералов, пре-, про- и постбиотики, инозитол и теанин.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-medium text-wine">
          {['30 стиков по 15 г', 'Клубника–малина', 'Без сахара', 'Без кофеина'].map((c) => <span key={c} className="rounded-full bg-blush-soft px-3 py-1.5">{c}</span>)}
        </div>
      </div>

      {/* Подписка или разово — как в Shopify */}
      <div className="grid grid-cols-2 gap-1 rounded-full bg-blush-soft p-1" role="radiogroup" aria-label="Тип покупки">
        {[['sub', 'Подписка', 'выгоднее до 33 %'], ['once', 'Разово', 'без продления']].map(([k, t, s]) => {
          const on = (k === 'sub') === isSub
          return (
            <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setPlanId(k === 'sub' ? lastSub.current : 'once')}
              className="relative rounded-full px-3 py-2.5 text-center cursor-pointer">
              {on && <motion.span layoutId="buytype" className="absolute inset-0 rounded-full bg-wine" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className={`relative block text-[15px] font-semibold ${on ? 'text-blush' : 'text-wine'}`}>{t}</span>
              <span className={`relative block text-[11.5px] ${on ? 'text-blush/75' : 'text-wine/60'}`}>{s}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {isSub ? (
          <motion.div key="sub" className="flex flex-col gap-2" role="radiogroup" aria-label="Срок подписки" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {['course', 'month'].map(plan).map((x) => {
              const on = x.id === planId
              const cmp = ONCE.price * (x.days / ONCE.days)
              return (
                <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => setPlanId(x.id)}
                  className={`relative flex items-center gap-4 rounded-[20px] border-2 p-4 text-left transition-colors cursor-pointer ${on ? 'border-wine bg-white' : 'border-wine/10 bg-white hover:border-wine/30'}`}>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-wine' : 'border-black/25'}`}>{on && <span className="size-2.5 rounded-full bg-wine" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2"><span className="text-[16px] font-semibold">{x.id === 'course' ? 'Курс 12 недель' : 'Каждые 30 дней'}</span>{x.id === 'course' && <span className="rounded-full bg-wine px-2 py-0.5 text-[11px] font-semibold text-blush">Выгоднее всего</span>}</span>
                    <span className="block text-[13px] text-black/55">{x.id === 'course' ? '90 порций · гарантия 90 дней' : '30 порций · гарантия 30 дней'}</span>
                  </span>
                  <span className="text-right"><b className="tnum block text-[18px]">{rub(perDay(x))}<span className="text-[13px] font-normal text-black/55">/день</span></b><s className="tnum text-[12.5px] text-black/40">{rub(Math.floor(cmp / x.days))}</s></span>
                </button>
              )
            })}
          </motion.div>
        ) : (
          <motion.p key="once" className="rounded-[20px] border-2 border-wine bg-white p-4 text-[15px]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <b>30 порций</b> — {rub(ONCE.price)}, {rub(perDay(ONCE))} в день. Без подписки и подарков. <button type="button" onClick={() => setPlanId('course')} className="font-semibold text-wine underline underline-offset-4 cursor-pointer">С подпиской — {rub(perDay(plan('course')))} в день</button>
          </motion.p>
        )}
      </AnimatePresence>


      <div>
        {isSub && <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-[13px] font-semibold text-wine">+ подарки на {rub(gifts.reduce((t, g) => t + (g.value || 0), 0))} к подписке</p>}
        <div className="flex items-baseline gap-3">
          <b className="tnum text-[38px] font-bold leading-none tracking-[-0.03em]">{rub(p.price)}</b>
          {save > 0 && <s className="tnum text-[18px] text-black/40">{rub(compare)}</s>}
          {save > 0 && <span className="rounded-full bg-wine px-2.5 py-1 text-[12.5px] font-semibold text-blush">−{rub(save)}</span>}
        </div>
        <p className="mt-1.5 text-[13.5px] text-black/55">{p.billing}</p>
      </div>

      <button type="button" onClick={onBuy} className="btn btn-wine w-full text-[18px]">{isSub ? 'Оформить подписку' : 'Купить'} — {rub(p.price)}</button>

      <ul className="grid grid-cols-3 gap-2 text-center text-[12.5px] leading-tight text-black/65">
        <li className="flex flex-col items-center gap-1.5 rounded-[16px] bg-blush-soft p-3"><Shield className="size-5 text-wine" />Гарантия результата · {p.guaranteeDays} дней</li>
        <li className="flex flex-col items-center gap-1.5 rounded-[16px] bg-blush-soft p-3"><svg viewBox="0 0 24 24" className="size-5 text-wine" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg>Доставка по России 0 ₽</li>
        <li className="flex flex-col items-center gap-1.5 rounded-[16px] bg-blush-soft p-3"><svg viewBox="0 0 24 24" className="size-5 text-wine" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>Пауза и отмена в 1 касание</li>
      </ul>

      {isSub && (
        <div className="rounded-[20px] bg-blush p-5 text-wine">
          <p className="flex items-center gap-2 text-[15px] font-bold"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1s3.5 1 5 1Zm0 0c1.5-3 5-3.5 5-1s-3.5 1-5 1Z" /></svg>В подарок к подписке</p>
          <ul className="mt-3 flex flex-col gap-2 text-[14px]">
            {gifts.map((g) => <li key={g.title} className="flex items-start justify-between gap-3"><span className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />{g.title}</span><span className="tnum shrink-0 font-semibold">{g.value ? rub(g.value) : 'бесплатно'}</span></li>)}
          </ul>
        </div>
      )}

      <Details />
    </div>
  )
}

function Details() {
  const [open, setOpen] = useState('desc')
  const items = [
    ['desc', 'Описание', <div key="d" className="flex flex-col gap-3"><p>mouren — ежедневный порошковый комплекс для женщин. Один стик заменяет 22 отдельные добавки: коллаген, витамины в активных формах, минералы в бисглицинатах, клетчатку, пробиотик и постбиотик, мио-инозитол, теанин, гиалуроновую кислоту и антиоксиданты.</p><p>12,8 г действующих веществ в каждом стике 15 г. Каждая доза названа на этикетке, ни одна не выше верхнего допустимого уровня.</p></div>],
    ['sostav', 'Состав — 31 вещество', <ul key="s" className="flex flex-col">{COMPOSITION.flatMap((g) => g.items).map((it) => <li key={it.name} className="flex justify-between gap-3 border-t border-wine/8 py-2 first:border-t-0"><span>{it.name} <span className="text-black/45">· {it.form}</span></span><b className="tnum shrink-0 font-semibold text-wine">{it.dose}</b></li>)}</ul>],
    ['how', 'Как принимать', <p key="h">1 стик в день. Высыпьте в стакан холодной воды 200–250 мл, размешайте 20 секунд и выпейте с завтраком. Чувствительный живот — первые 5 дней по половине стика.</p>],
    ['ship', 'Доставка и оплата', <p key="s2">Бесплатная доставка по России. Отправка после подтверждения заказа, трек-номер придёт на почту. Подписку можно поставить на паузу или отменить в личном кабинете — напомним за 3 дня до списания.</p>],
    ['ret', 'Гарантия и возврат', <p key="r">Не почувствовали разницу — вернём 100 % суммы. Товар возвращать не нужно. 30 дней на подписке и разовой покупке, 90 дней на курсе 12 недель.</p>],
  ]
  return (
    <div className="mt-2 border-t border-wine/10">
      {items.map(([k, t, body]) => (
        <div key={k} className="border-b border-wine/10">
          <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? '' : k)} className="flex w-full items-center justify-between py-4 text-left text-[16px] font-semibold cursor-pointer">
            {t}<span className={`text-[22px] font-normal text-wine transition-transform duration-300 ${open === k ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
          </button>
          <AnimatePresence initial={false}>
            {open === k && <motion.div className="overflow-hidden text-[15px] leading-relaxed text-black/70" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }}><div className="pb-5">{body}</div></motion.div>}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function Feel() {
  const steps = [['1–2 нед.', 'Живот спокойнее'], ['3–4 нед.', 'Силы остаются на вечер'], ['5–6 нед.', 'Сон глубже, ПМС мягче'], ['7–8 нед.', 'Ногти крепче, голова яснее'], ['9–10 нед.', 'Кожа плотнее, тон ровнее'], ['11–12 нед.', 'Меньше волос на щётке']]
  return (
    <section className="bg-wine py-16 text-white md:py-24" aria-labelledby="feel-title">
      <div className="wrap">
        <h2 id="feel-title" className="h2 text-blush">Что вы почувствуете за 12 недель</h2>
        <ol className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([w, t]) => <li key={w} className="card-dark p-5"><p className="label text-blush/60">{w}</p><p className="mt-2 text-[19px] font-semibold">{t}</p></li>)}
        </ol>
        <a href="./#kurs" className="mt-6 inline-block text-[15px] text-blush underline underline-offset-4">Подробно по неделям</a>
      </div>
    </section>
  )
}

export default function ProductApp() {
  const initial = useMemo(() => {
    const q = new URLSearchParams(location.search).get('plan')
    return CONFIG.plans.some((p) => p.id === q) ? q : CONFIG.defaultPlan
  }, [])
  const promo = useMemo(() => (new URLSearchParams(location.search).get('promo') || '').slice(0, 32), [])
  const [planId, setPlanId] = useState(initial)
  const [open, setOpen] = useState(false)
  const buy = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const [bar, setBar] = useState(false)
  useEffect(() => {
    const on = () => setBar(window.scrollY > 900)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const p = plan(planId)
  const home = './' + location.search.replace(/([?&])plan=[^&]*&?/, '$1').replace(/[?&]$/, '')
  return (
    <MotionConfig reducedMotion="user">
      <PromoBar promo={promo} />
      <header className="sticky top-0 z-40 border-b border-wine/10 bg-white/90 backdrop-blur-xl">
        <div className="wrap flex h-16 items-center gap-4">
          <a href={home} aria-label="mouren — на главную" className="rounded-xl bg-wine px-3.5 py-2.5 text-blush"><Logo className="h-[15px] w-auto" /></a>
          <nav aria-label="Разделы" className="ml-auto flex items-center gap-1 text-[14.5px] font-medium text-wine/75">
            <a href={`${home}#formula`} className="hidden rounded-full px-3 py-2 hover:bg-wine/5 sm:inline">Формула</a>
            <a href="#nauka" className="hidden rounded-full px-3 py-2 hover:bg-wine/5 sm:inline">Наука</a>
            <a href="#otzyvy" className="rounded-full px-3 py-2 hover:bg-wine/5">Отзывы</a>
          </nav>
        </div>
      </header>
      <main>
        <section className="bg-white pb-12 pt-4 md:pb-24 md:pt-10">
          <div className="wrap">
            <nav aria-label="Навигация" className="mb-3 text-[13px] text-black/50 md:mb-5"><a href={home} className="hover:text-wine">Главная</a> / <span className="text-black/75">mouren Daily Ultimate Essentials</span></nav>
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.1fr_1fr]">
              <Gallery />
              <BuyBox planId={planId} setPlanId={setPlanId} onBuy={buy} />
            </div>
          </div>
        </section>
        <Feel />
        <Science />
        <Reviews />
        <Faq />
      </main>
      <Footer />
      <AnimatePresence>
        {bar && (
          <motion.div className="fixed inset-x-0 bottom-0 z-40 border-t border-wine/10 bg-white/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 400, damping: 36 }}>
            <div className="wrap flex items-center justify-between gap-3">
              <p className="min-w-0 leading-tight"><b className="tnum block text-[16px]">{rub(p.price)}</b><span className="block truncate text-[12.5px] text-black/55">{rub(perDay(p))} в день · гарантия {p.guaranteeDays} дней</span></p>
              <button type="button" onClick={buy} className="btn btn-wine min-h-[50px] shrink-0 px-6 text-[16px]">{planId === 'once' ? 'Купить' : 'Оформить подписку'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <OrderSheet open={open} onClose={close} planId={planId} setPlanId={setPlanId} promo={promo} />
    </MotionConfig>
  )
}
