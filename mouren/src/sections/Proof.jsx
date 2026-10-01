import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Fade, Check, Cross } from '../components/ui.jsx'
import { COMPOSITION, DIRECTIONS } from '../productData.js'
import { CONFIG } from '../config.js'

export function Directions() {
  const [i, setI] = useState(0)
  const d = DIRECTIONS[i]
  return (
    <section className="bg-white py-14 md:py-28" aria-labelledby="dir-title">
      <div className="wrap">
        <Fade><h2 id="dir-title" className="h2">Десять направлений в&nbsp;одной дозе</h2></Fade>
        <Fade><p className="lead mt-3 text-black/60">Выберите, что важно вам, — покажем вещества и дозы.</p></Fade>
      </div>
      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto px-5 md:flex-wrap md:px-[max(20px,calc((100vw_-_1180px)/2))]" role="tablist" aria-label="Направления">
        {DIRECTIONS.map((x, k) => (
          <button key={x.id} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)}
            className={`chip border ${k === i ? 'border-wine bg-wine text-blush' : 'border-wine/15 bg-white text-wine hover:border-wine/40'}`}>{x.title}</button>
        ))}
      </div>
      <div className="wrap mt-5">
        <AnimatePresence mode="wait">
          <motion.div key={d.id} role="tabpanel" className="grid gap-6 rounded-[28px] bg-wine p-6 text-white md:grid-cols-2 md:gap-10 md:p-10"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
            <div className="flex flex-col gap-4">
              <p className="label text-blush/60">Система {i + 1} из {DIRECTIONS.length}</p>
              <h3 className="text-[clamp(26px,3vw,36px)] font-bold leading-tight text-white">{d.title}</h3>
              <p className="text-[15.5px] leading-relaxed text-white/75">{d.body}</p>
              <p className="rounded-[16px] bg-white/8 p-4 text-[14px] leading-relaxed text-white/70">Почему вместе: {d.why}</p>
            </div>
            <ul className="self-start">
              {d.items.map((it) => (
                <li key={it.name} className="flex justify-between gap-4 border-t border-white/12 py-3.5 text-[15px] first:border-t-0 md:first:border-t">
                  <span className="text-white/85">{it.name}</span><b className="tnum shrink-0 font-semibold">{it.dose}</b>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
        <a href="#sostav" className="btn btn-ghost mt-4 w-full md:w-auto">Смотреть весь состав</a>
      </div>
    </section>
  )
}

const WEEKS = [
  { d: 'Недели 1–2', m: 'Месяц 1', t: 'Отвечает живот', b: 'Самая быстрая часть состава — пребиотики и споровый пробиотик. Стул регулярнее, вздутие реже. Первые дни возможна адаптация к волокнам — для чувствительного живота есть протокол мягкого старта. Энергии пока может не быть — это нормально.', tags: ['Пищеварение', 'Меньше вздутия'], why: 'PHGG, XOS, Bacillus GBI-30' },
  { d: 'Недели 3–4', m: 'Месяц 1', t: 'Лёгкость и силы на вечер', b: 'Живот заметно площе к вечеру, перекусывать тянет реже. После работы остаются силы на себя. Первый месяц позади — и это видно не только вам.', tags: ['Лёгкость', 'Сытость', 'Энергия'], why: 'Волокна 5,65 г, железо в хелате, B12, P5P' },
  { d: 'Недели 5–6', m: 'Месяц 2', t: 'Сон и фон', b: 'Засыпание быстрее, утро без разбитости. Первый цикл на составе — ПМС мягче, настроение ровнее.', tags: ['Сон', 'Цикл', 'Стресс'], why: 'L-теанин 200 мг, магний, мио-инозитол' },
  { d: 'Недели 7–8', m: 'Месяц 2', t: 'Голова и ногти', b: 'Концентрация держится весь день, без дневного провала. Ногти первыми отвечают на коллаген — перестают слоиться и ломаться.', tags: ['Фокус', 'Ногти'], why: 'Коллаген 2,5 г, цинк, биотин, B-группа' },
  { d: 'Недели 9–10', m: 'Месяц 3', t: 'Кожа', b: 'Кожа обновилась дважды на полном составе: плотнее, ровнее тон, меньше сухости. Заметно без тонального.', tags: ['Плотность', 'Тон', 'Увлажнение'], why: 'Коллаген, гиалуроновая кислота, астаксантин, C' },
  { d: 'Недели 11–12', m: 'Месяц 3', t: 'Волосы и анализы', b: 'Волос меньше на щётке, новые растут с полным набором кофакторов. Сдайте ферритин, D и B12 по карте анализов и сравните с днём ноль — цифры скажут сами.', tags: ['Волосы', 'Ферритин', 'Витамин D'], why: 'Железо, D3 + K2, цинк, селен, биотин' },
]

export function Timeline({ onOrder }) {
  const [s, setS] = useState(0)
  const w = WEEKS[s]
  return (
    <section id="kurs" className="bg-blush-soft py-14 md:py-28" aria-labelledby="kurs-title">
      <div className="wrap grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
        <div>
          <Fade><p className="label text-wine/70">12 недель · 6 этапов</p></Fade>
          <Fade><h2 id="kurs-title" className="h2 mt-3 text-ink">Что меняется каждые 2&nbsp;недели</h2></Fade>
          <Fade><p className="lead mt-4 text-black/60">Тело обновляется не за неделю. Поэтому mouren — это курс, а не таблетка «на сегодня». Отмечайте изменения в дневнике — через 12 недель вы увидите их на бумаге.</p></Fade>
          <Fade className="mt-7 rounded-[24px] bg-wine p-6 text-white">
            <p className="label text-blush/60">Чего не будет и за 12 недель</p>
            <ul className="mt-4 flex flex-col gap-3 text-[14.5px] leading-relaxed text-white/80">
              <li><b className="text-white">Лечения анемии.</b> 12 мг — поддерживающая доза. Подтверждённый дефицит лечит врач.</li>
              <li><b className="text-white">Замены косметологу.</b> Коллаген внутрь — плотность и тонус, а не разглаживание глубоких морщин.</li>
              <li><b className="text-white">Похудения как эффекта.</b> Минус вздутие и лучшая сытость — да. Сжигания жира — нет.</li>
            </ul>
          </Fade>
        </div>
        <div>
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: 12 }, (_, k) => (
              <motion.span key={k} className="h-1.5 flex-1 rounded-full" animate={{ backgroundColor: k < (s + 1) * 2 ? '#471D1F' : 'rgba(71,29,31,0.12)' }} transition={{ duration: 0.3, delay: k * 0.015 }} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-6 gap-1.5" role="tablist" aria-label="Недели курса">
            {WEEKS.map((x, k) => (
              <button key={x.d} type="button" role="tab" aria-selected={k === s} onClick={() => setS(k)}
                className={`rounded-[14px] border py-2.5 text-center transition-colors cursor-pointer ${k === s ? 'border-wine bg-wine text-blush' : 'border-wine/15 bg-white text-wine hover:border-wine/40'}`}>
                <span className="block text-[18px] font-bold leading-none">{(k + 1) * 2}</span><span className="text-[11px] opacity-75">нед.</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article key={s} role="tabpanel" className="card mt-3 flex flex-col gap-4 p-6 md:p-8"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
              <div className="flex justify-between"><span className="label text-wine">{w.d}</span><span className="text-[13px] text-black/45">{w.m}</span></div>
              <h3 className="text-[26px] font-bold leading-tight">{w.t}</h3>
              <p className="text-[15.5px] leading-relaxed text-black/70">{w.b}</p>
              <div className="flex flex-wrap gap-2">{w.tags.map((t) => <span key={t} className="rounded-full border border-wine/15 px-3 py-1.5 text-[13px] font-medium text-wine">{t}</span>)}</div>
              <p className="border-t border-wine/10 pt-4 text-[14px]"><span className="label mr-3 text-black/45">Работает</span>{w.why}</p>
              <div className="flex gap-2">
                <button type="button" aria-label="Предыдущий этап" onClick={() => setS((s + WEEKS.length - 1) % WEEKS.length)} className="btn btn-ghost min-h-[50px] px-5">←</button>
                <button type="button" onClick={() => setS((s + 1) % WEEKS.length)} className="btn btn-wine min-h-[50px] flex-1 text-[15.5px]">{s === WEEKS.length - 1 ? 'Сначала: недели 1–2' : `Дальше: ${WEEKS[s + 1].d.toLowerCase()}`}</button>
              </div>
            </motion.article>
          </AnimatePresence>
          <p className="mt-3 text-[13px] text-black/50">Индивидуально — поэтому и гарантия.</p>
          <button type="button" onClick={onOrder} className="btn btn-wine mt-5 w-full">Начать курс 12 недель</button>
        </div>
      </div>
    </section>
  )
}

function norm(n) {
  if (!n.includes('·')) return [n, '']
  const [a, b] = n.split('·').map((x) => x.trim())
  return [a, b]
}

export function Label() {
  const [open, setOpen] = useState({ 0: true, 1: true })
  const all = COMPOSITION.every((_, k) => open[k])
  const toggleAll = () => setOpen(all ? {} : Object.fromEntries(COMPOSITION.map((_, k) => [k, true])))
  return (
    <section id="sostav" className="bg-blush-soft py-14 md:py-28" aria-labelledby="label-title">
      <div className="wrap">
        <Fade><h2 id="label-title" className="h2 max-w-[16em]">31 вещество: доза, форма и&nbsp;зачем</h2></Fade>
        <Fade><p className="lead mt-4 max-w-[40em] text-black/60">Открытая этикетка. Никаких «запатентованных комплексов», за которыми прячут 20&nbsp;мг. Каждая доза рабочая и ни одна не выше верхнего допустимого уровня. Мы платим за форму, а не за строку в составе: P5P вместо пиридоксина, бисглицинаты вместо оксидов.</p></Fade>
        <div className="mt-8 grid gap-3 lg:grid-cols-2 lg:items-start">
          {COMPOSITION.map((g, k) => (
            <div key={g.group} className="card overflow-hidden">
              <button type="button" aria-expanded={!!open[k]} onClick={() => setOpen({ ...open, [k]: !open[k] })} className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer md:p-6">
                <span><span className="block text-[19px] font-semibold">{g.group}</span><span className="text-[13.5px] text-black/50">{g.note}</span></span>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full bg-wine text-[20px] leading-none text-blush transition-transform duration-300 ${open[k] ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
              </button>
              <AnimatePresence initial={false}>
                {open[k] && (
                  <motion.ul className="px-5 md:px-6" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
                    {g.items.map((it) => {
                      const [pct, lim] = norm(it.norm)
                      return (
                        <li key={it.name} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-wine/8 py-3.5 last:pb-5">
                          <span className="text-[15.5px] font-semibold">{it.name}</span>
                          <span className="tnum text-right text-[15.5px] font-semibold text-wine">{it.dose}</span>
                          <span className="text-[13px] text-black/50">{it.form}</span>
                          <span className="tnum text-right text-[12.5px] text-black/50">{pct}{lim ? ` · ${lim}` : ''}</span>
                          {it.why && <span className="col-span-2 text-[13.5px] text-black/70">{it.why}</span>}
                        </li>
                      )
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <button type="button" onClick={toggleAll} className="btn mt-4 w-full border border-wine/20 bg-blush text-wine hover:bg-white md:w-auto">{all ? 'Свернуть состав' : 'Раскрыть все 31 позицию с % нормы'}</button>
        <p className="mt-4 max-w-[52em] text-[13px] leading-relaxed text-black/50">% — от адекватного уровня потребления, ВДУ — верхний допустимый уровень. Вспомогательные вещества (2,2 г): стевия, эритрит, пищевые кислоты, натуральные красители из чёрной моркови и свёклы.</p>
      </div>
    </section>
  )
}

export function Compare() {
  const rows = [
    ['Коллаген', 'нет', 'отдельная добавка', '2 500 мг'],
    ['Железо в мягкой форме', 'редко', 'отдельная добавка', 'бисглицинат 12 мг'],
    ['Витамины B в активных формах', 'обычно нет', 'отдельная добавка', 'P5P, метилфолат, метил-B12'],
    ['Пре-, про- и постбиотики', 'нет', '2–3 добавки', '5,65 г + 2 штамма'],
    ['Инозитол и теанин для цикла и сна', 'нет', '2 добавки', '1 000 мг + 200 мг'],
    ['Все дозы на этикетке', 'да', 'да', 'да, все 31'],
    ['Действий утром', '1–2 таблетки', 'до 22 капсул', '1 стакан, 20 секунд'],
    ['В месяц', 'от 500 ₽, но без половины состава', `от ${CONFIG.stackPrice.toLocaleString('ru-RU')} ₽`, '6 675 ₽ · 222 ₽ в день'],
  ]
  return (
    <section className="bg-white py-14 md:py-28" aria-labelledby="cmp-title">
      <div className="wrap">
        <Fade><h2 id="cmp-title" className="h2 max-w-[16em]">mouren, аптечный мультивитамин или собрать самой?</h2></Fade>
        <Fade className="mt-8 overflow-x-auto rounded-[24px] border border-wine/10">
          <table className="w-full min-w-[680px] border-collapse text-left text-[14.5px]">
            <thead>
              <tr className="bg-blush-soft">
                <th scope="col" className="sticky left-0 z-10 w-[26%] bg-blush-soft p-4 font-semibold"><span className="sr-only">Что сравниваем</span></th>
                <th scope="col" className="bg-wine p-4 font-bold text-blush">mouren</th>
                <th scope="col" className="p-4 font-semibold text-black/60">Аптечный мультивитамин</th>
                <th scope="col" className="p-4 font-semibold text-black/60">Собрать по отдельности</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([r, a, b, c]) => (
                <tr key={r} className="border-t border-wine/8">
                  <th scope="row" className="sticky left-0 z-10 bg-white p-4 font-semibold">{r}</th>
                  <td className="bg-wine/[0.04] p-4 font-semibold text-wine"><span className="inline-flex items-center gap-2"><Check className="size-4 shrink-0" />{c}</span></td>
                  <td className="p-4 text-black/55"><span className="inline-flex items-center gap-2">{/нет|редко/.test(a) && <Cross className="size-3.5 shrink-0 text-black/35" />}{a}</span></td>
                  <td className="p-4 text-black/55">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Fade>
      </div>
    </section>
  )
}
