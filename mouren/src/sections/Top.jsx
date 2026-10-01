import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
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

const LINKS = [['#formula', 'Формула'], ['#kurs', '12 недель'], ['#sostav', 'Состав'], ['#tarify', 'Цены'], ['#voprosy', 'Вопросы']]

export function Header({ onOrder }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 30)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${solid ? 'bg-blush/90 shadow-[0_10px_30px_-20px_rgba(71,29,31,.5)] backdrop-blur-xl' : 'bg-blush'}`}>
      <div className="wrap flex h-16 items-center gap-4">
        <a href="#top" aria-label="mouren — в начало" className="rounded-xl bg-wine px-3.5 py-2.5 text-blush"><Logo className="h-[15px] w-auto" /></a>
        <nav aria-label="Разделы" className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map(([h, t]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[15px] font-medium text-wine/75 transition-colors hover:bg-wine/5 hover:text-wine">{t}</a>)}
        </nav>
        <button type="button" onClick={onOrder} className="btn btn-wine ml-auto min-h-[44px] px-5 text-[15px] lg:ml-3">Начать курс</button>
      </div>
    </header>
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
            <span className="tracking-[2px]">★★★★★</span><b className="font-semibold">4,9 · 2 104 оценки</b><span className="text-wine/60">· 24 врача разобрали состав</span>
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
