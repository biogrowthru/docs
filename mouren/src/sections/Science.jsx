import { useState } from 'react'
import { motion } from 'motion/react'
import { Fade } from '../components/ui.jsx'
import { DOCTORS, REVIEWS, STUDY, SCIENCE } from '../proofData.js'

export function Example({ dark = false }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] ${dark ? 'bg-white/15 text-white/80' : 'bg-blush text-wine'}`}>пример</span>
}

export function Science() {
  const tags = ['Все', ...Array.from(new Set(DOCTORS.map((d) => d.tag)))]
  const [tag, setTag] = useState('Все')
  const docs = DOCTORS.filter((d) => tag === 'Все' || d.tag === tag).slice(0, tag === 'Все' ? 6 : 24)
  return (
    <section id="nauka" className="bg-white py-20 md:py-28" aria-labelledby="sci-title">
      <div className="wrap">
        <Fade><p className="label text-wine/70">Наука и врачи</p></Fade>
        <Fade><h2 id="sci-title" className="h2 mt-3 max-w-[18em]">Разработано в «Сколково». Проверено на 240 женщинах. Разобрано 24 врачами.</h2></Fade>
        <Fade><p className="lead mt-4 max-w-[40em] text-black/60">Критерии отбора: доказательная база у женщин, форма с лучшим усвоением, рабочая доза не выше верхнего допустимого уровня.</p></Fade>
        <div className="mt-8 grid grid-cols-3 gap-2.5 md:max-w-[720px] md:gap-4">
          {SCIENCE.map((f) => (
            <Fade key={f.l} className="card p-4 md:p-6"><p className="tnum text-[clamp(26px,3vw,40px)] font-bold leading-none text-wine">{f.v}</p><p className="mt-2 text-[12.5px] leading-snug text-black/60 md:text-[14px]">{f.l}</p></Fade>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Fade className="rounded-[24px] bg-wine p-6 text-white md:p-8">
            <p className="label text-blush/60">Принцип дозирования</p>
            <h3 className="mt-3 text-[22px] font-semibold leading-snug">31 активное вещество в рабочих дозировках, ни одно не превышает ВДУ</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">B12 — 9 мкг, биотин — 150 мкг, D3 — 600 МЕ: ровно верхняя граница безопасного ежедневного приёма. Ниже — не работает, выше — нельзя без врача. Мы стоим на этой линии.</p>
          </Fade>
          <Fade className="rounded-[24px] bg-wine p-6 text-white md:p-8">
            <div className="flex items-center justify-between gap-3"><p className="label text-blush/60">Наблюдение НИЦ «Сколково»</p>{STUDY.example && <Example dark />}</div>
            <h3 className="mt-3 text-[22px] font-semibold leading-snug">{STUDY.title}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">{STUDY.intro}</p>
            <ul className="mt-5 flex flex-col gap-4">
              {STUDY.results.map((r) => (
                <li key={r.title}>
                  <div className="flex items-baseline justify-between"><span className="text-[15.5px] font-semibold">{r.title}</span><b className="tnum text-[22px] text-blush">{r.value}%</b></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/12"><motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} whileInView={{ width: `${r.value}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} /></div>
                  <p className="mt-1.5 text-[13px] text-white/55">{r.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] text-white/45">{STUDY.note}</p>
          </Fade>
        </div>

        <Fade className="card mt-6 p-6 md:p-8">
          <h3 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-tight">24 врача получили образцы и состав. Вот что они сказали</h3>
          <p className="mt-3 max-w-[48em] text-[15px] leading-relaxed text-black/60">Терапевты, гинекологи, гастроэнтерологи, дерматологи, эндокринологи, неврологи, кардиологи, нутрициологи, трихологи. Образцы — бесплатно, за текст не платим, формулировки не согласовываем.</p>
          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto" role="tablist" aria-label="Специальность">
            {tags.map((t) => <button key={t} type="button" role="tab" aria-selected={t === tag} onClick={() => setTag(t)} className={`chip border ${t === tag ? 'border-wine bg-wine text-blush' : 'border-wine/15 text-wine hover:border-wine/40'}`}>{t}</button>)}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((d) => (
              <article key={d.name} className="flex flex-col gap-2 rounded-[20px] border border-wine/10 p-5">
                <div className="flex items-start justify-between gap-2"><div><p className="text-[15.5px] font-semibold">{d.name}</p><p className="text-[12.5px] text-black/50">{d.role}</p></div>{d.example ? <Example /> : <span className="label text-wine">{d.tag}</span>}</div>
                <p className="mt-1 text-[16px] font-semibold leading-snug">{d.title}</p>
                <p className="text-[14px] leading-relaxed text-black/65">{d.quote}</p>
              </article>
            ))}
          </div>
        </Fade>
      </div>
    </section>
  )
}

export function Reviews() {
  return (
    <section id="otzyvy" className="bg-blush-soft py-20 md:py-28" aria-labelledby="rev-title">
      <div className="wrap">
        <Fade><h2 id="rev-title" className="h2">Что говорят те, кто пьёт больше месяца</h2></Fade>
        <Fade><p className="lead mt-3 max-w-[36em] text-black/60">Отзывы только от оплаченных заказов, минусы тоже публикуем.</p></Fade>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {REVIEWS.map((r) => (
            <Fade key={r.name} className="card flex flex-col gap-2 p-6">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[15.5px] font-semibold">{r.name}</p><p className="text-[12.5px] text-black/50">{r.meta}</p></div>
                <div className="flex items-center gap-2">{r.example && <Example />}<span className="text-[14px] tracking-[2px] text-wine" aria-label={`${r.stars} из 5`}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span></div>
              </div>
              <p className="mt-1 text-[18px] font-semibold leading-snug">{r.title}</p>
              <p className="text-[15px] leading-relaxed text-black/65">{r.text}</p>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  )
}
