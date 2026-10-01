import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Logo } from '../components/Logo.jsx'
import { CountUp, Magnet } from '../components/motion.jsx'
import { asset, Shield } from '../components/ui.jsx'
import { CONFIG, rub, perDay, num } from '../config.js'

export function PromoBar({ promo }) {
  return (
    <div className="bg-wine text-blush">
      <div className="wrap flex min-h-10 flex-wrap items-center justify-center gap-x-5 gap-y-0.5 py-2 text-center text-[13px] font-medium">
        {promo
          ? <span>Ваш промокод <b className="font-bold">{promo}</b> применится при оформлении</span>
          : <span>Гарантия результата · Доставка по России 0 ₽</span>}
        <span className="hidden opacity-75 sm:inline">Пауза и отмена подписки в одно касание</span>
      </div>
    </div>
  )
}

const LINKS = [['#formula', 'Формула'], ['#nauka', 'Наука и врачи'], ['#kurs', '12 недель'], ['#otzyvy', 'Отзывы'], ['#sostav', 'Состав'], ['#tarify', 'Цены и гарантия'], ['#voprosy', 'Вопросы']]
const NAV = LINKS.filter(([h]) => ['#formula', '#kurs', '#sostav', '#tarify', '#voprosy'].includes(h))

const go = (h) => {
  const el = document.querySelector(h)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function Header({ onOrder }) {
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  const [top, setTop] = useState(64)
  const bar = useRef(null)
  // На телефоне шапка уезжает при прокрутке вниз и возвращается при прокрутке вверх — больше места под текст
  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      setSolid(y > 30)
      if (Math.abs(y - last) > 8) { setHidden(y > last && y > 640); last = y }
    }
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!menu) return
    window.__lenis?.stop(); document.documentElement.style.overflow = 'hidden'
    const esc = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', esc)
    return () => { window.__lenis?.start(); document.documentElement.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [menu])
  const pick = (h) => (e) => { e.preventDefault(); setMenu(false); requestAnimationFrame(() => go(h)) }
  return (
    <>
      <header ref={bar} className={`sticky top-0 z-40 transition-[background-color,box-shadow,translate] duration-300 ease-[cubic-bezier(.23,1,.32,1)] ${hidden && !menu ? 'max-lg:-translate-y-full' : ''} ${solid ? 'bg-blush/90 shadow-[0_10px_30px_-20px_rgba(71,29,31,.5)] backdrop-blur-xl' : 'bg-blush'}`}>
        <div className="wrap flex h-16 items-center gap-2 sm:gap-4">
          <a href="#top" onClick={pick('#top')} aria-label="mouren — в начало" className="rounded-xl bg-wine px-3.5 py-2.5 text-blush"><Logo className="h-[15px] w-auto" /></a>
          <nav aria-label="Разделы" className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map(([h, t]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[15px] font-medium text-wine/75 transition-colors hover:bg-wine/5 hover:text-wine">{t}</a>)}
          </nav>
          <button type="button" onClick={onOrder} className="btn btn-wine ml-auto min-h-[44px] px-5 text-[15px] lg:ml-3">Начать курс</button>
          <button type="button" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} aria-controls="menu" onClick={() => { setTop(Math.max(0, bar.current?.getBoundingClientRect().bottom ?? 64)); setMenu(!menu) }}
            className="relative grid size-11 shrink-0 place-items-center rounded-full border border-wine/20 text-wine cursor-pointer lg:hidden">
            <span className={`absolute h-[2px] w-[18px] rounded bg-current transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] ${menu ? 'rotate-45' : '-translate-y-[4px]'}`} />
            <span className={`absolute h-[2px] w-[18px] rounded bg-current transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] ${menu ? '-rotate-45' : 'translate-y-[4px]'}`} />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.div id="menu" style={{ top }} className="fixed inset-x-0 bottom-0 z-[45] flex flex-col overflow-y-auto bg-blush px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 text-wine lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
            <nav aria-label="Меню" className="flex flex-col">
              {LINKS.map(([h, t], k) => (
                <motion.a key={h} href={h} onClick={pick(h)} className="flex items-center justify-between border-b border-wine/12 py-4 text-[26px] font-semibold leading-tight"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * k, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
                  {t}<span aria-hidden="true" className="text-[20px] text-wine/40">→</span>
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <button type="button" onClick={() => { setMenu(false); onOrder() }} className="btn btn-wine w-full">Попробовать — {rub(perDay(CONFIG.plans.find((x) => x.id === 'course')))} в&nbsp;день</button>
              <p className="text-center text-[13px] text-wine/65">Гарантия результата · доставка 0 ₽ · отмена в одно касание</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Hero({ onOrder, angle }) {
  const course = CONFIG.plans.find((p) => p.id === 'course')
  const titles = {
    hair: 'Меньше волос на расчёске — с одного утреннего стика',
    belly: 'Спокойный живот к вечеру — с одного утреннего стика',
    energy: 'Просыпаться отдохнувшей — с одного утреннего стика',
    skin: 'Снова узнать себя в зеркале — с одного утреннего стика',
    pms: 'Ровнее перед циклом — с одного утреннего стика',
    sleep: 'Засыпать без сорока вкладок в голове — с одного стика утром',
  }
  const title = titles[angle] || 'Все витамины на день — в одном утреннем стике'
  return (
    <section id="top" className="relative overflow-hidden bg-blush text-wine">
      <div className="wrap grid items-center gap-1 pb-10 pt-0 md:grid-cols-2 md:gap-10 md:pb-24 md:pt-10">
        <motion.div className="relative order-1 md:order-2" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}>
          <img src={asset('img/hero-pack-800.webp')} srcSet={`${asset('img/hero-pack-800.webp')} 800w, ${asset('img/hero-pack.webp')} 1254w`} sizes="(min-width: 768px) 50vw, 100vw"
            width="1254" height="1254" fetchPriority="high" alt="mouren — 30 стиков по 15 г" className="mx-auto h-[min(34vh,300px)] w-auto mix-blend-multiply md:h-auto md:w-[min(100%,560px)]" />
        </motion.div>
        <div className="order-2 flex flex-col gap-4 md:order-1 md:gap-5">
          <motion.p className="label text-wine/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Разработано учёными НИЦ «Сколково»</motion.p>
          <motion.h1 className="text-[clamp(32px,5.4vw,68px)] font-bold leading-[1.02]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
            {title}
          </motion.h1>
          <motion.a href="#otzyvy" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14.5px] text-wine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <span className="tracking-[2px]">★★★★★</span><b className="font-semibold">4,9 · 2 104 оценки</b><span className="hidden text-wine/60 sm:inline">· 24 врача разобрали состав</span>
          </motion.a>
          <motion.p className="lead max-w-[32em] text-wine/80" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
            Коллаген 2,5&nbsp;г&nbsp;+ 30 веществ вместо 22 добавок на полке. Через 12 недель — энергия до вечера, спокойный живот, плотнее кожа и меньше волос на расчёске. Или вернём деньги.
          </motion.p>
          <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
            <Magnet strength={0.15} className="w-full sm:w-auto"><button type="button" onClick={onOrder} className="btn btn-wine w-full">Попробовать — {rub(perDay(course))} в&nbsp;день</button></Magnet>
            <a href="#formula" className="btn btn-ghost hidden sm:inline-flex">Что внутри</a>
          </motion.div>
          <motion.ul className="flex flex-col gap-2 text-[13.5px] text-wine/80 md:text-[14.5px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
            <li className="flex gap-2.5"><Shield className="size-5 shrink-0" /><span><b className="font-semibold text-wine">Гарантия результата:</b> не почувствуете разницу — вернём 100&nbsp;% денег, без возврата товара</span></li>
            <li className="flex gap-2.5"><svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg><span>Доставка по России бесплатно · пауза и отмена в одно касание</span></li>
          </motion.ul>
        </div>
      </div>
    </section>
  )
}

export function Stats() {
  const items = [
    { v: <CountUp to={4.9} decimals={1} suffix=" ★" />, l: '2 104 оценки от покупательниц' },
    { v: <CountUp to={240} />, l: 'женщин в наблюдении НИЦ «Сколково», 12 недель' },
    { v: <CountUp to={24} />, l: 'врача 9 специальностей разобрали состав' },
    { v: <CountUp to={95} suffix=" %" />, l: 'участниц отметили больше сил днём к 12-й неделе' },
  ]
  return (
    <section className="border-b border-wine/10 bg-white" aria-label="Доказательства">
      <div className="wrap grid grid-cols-2 gap-3 py-8 md:grid-cols-4 md:gap-5 md:py-12">
        {items.map((x, i) => (
          <div key={i} className="card p-5 md:p-6">
            <div className="tnum text-[clamp(30px,3.4vw,44px)] font-bold leading-none tracking-[-0.03em] text-wine">{x.v}</div>
            <p className="mt-3 text-[13.5px] leading-snug text-black/60">{x.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
