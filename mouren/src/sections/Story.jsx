import { Fade, Arrow } from '../components/ui.jsx'
import { CONFIG, rub, perDay } from '../config.js'

const PAINS = [
  { tag: 'Энергия', quote: 'Сплю восемь часов — и просыпаюсь уже уставшей', life: 'Третий кофе к обеду, к вечеру сил хватает только на сериал. Анализы «в норме», а ощущение — будто батарейка на 10 %.', answer: 'Чаще всего это железо и B12, а не сон. Железо в бисглицинате не бьёт по желудку, метил-B12 и метилфолат работают сразу — без «переделки» в печени.', dose: 'Железо 12 мг · B12 9 мкг · Фолат 400 мкг', week: 'Недели 3–4: силы остаются на вечер' },
  { tag: 'Волосы и ногти', quote: 'После душа — клок волос в сливе. Страшно расчёсываться', life: 'Хвост стал тоньше вдвое, маникюр не держится, ногти слоятся. Маски и сыворотки за 3 000 ₽ — без толку.', answer: 'Волосы выпадают изнутри: не хватает железа, цинка и строительного белка. Коллаген без витамина C и цинка — просто белок. В одном стике все трое плюс биотин.', dose: 'Коллаген 2,5 г · Цинк 15 мг · Биотин 150 мкг', week: 'Недели 7–8: ногти. 11–12: меньше волос на щётке' },
  { tag: 'Цикл', quote: 'За неделю до месячных срываюсь на мужа и детей, потом стыдно', life: 'Слёзы на ровном месте, тянет на сладкое, отёки. Каждый месяц одно и то же — «ну, это же нормально».', answer: 'Это не характер. Мио-инозитол 1 г, B6 в активной форме P5P и магний 300 мг — три вещества, которые лучше всего изучены при ПМС. Все — в одной порции.', dose: 'Мио-инозитол 1 г · B6 5,4 мг · Магний 300 мг', week: 'Недели 5–6: первый цикл на составе' },
  { tag: 'Живот', quote: 'К вечеру живот как на пятом месяце, хотя ела салат', life: 'Утром плоский, вечером не застегнуть джинсы. Платье на праздник выбираю по тому, как будет с животом.', answer: 'Чаще всего это не лишний вес, а кишечник без клетчатки. 5,65 г пребиотических волокон и споровый пробиотик — самая быстрая часть формулы.', dose: 'Волокна 5,65 г · 2 млрд КОЕ · 10 млрд клеток', week: 'Недели 1–2: живот спокойнее' },
  { tag: 'Кожа', quote: 'Смотрю в зеркало и вижу маму. Когда я успела?', life: 'Кожа тусклая даже после отпуска, тональный ложится пятнами, у глаз — сухие морщинки, которых год назад не было.', answer: 'После 25 своего коллагена с каждым годом всё меньше. Коллаген с медью и витамином C, гиалуроновая кислота и астаксантин работают со стороны дермы — медленнее крема, но глубже.', dose: 'Гиалуроновая 120 мг · Астаксантин 4 мг · OPC 95 мг', week: 'Недели 9–10: кожа плотнее, тон ровнее' },
  { tag: 'Нервы и сон', quote: 'В два ночи лежу и прокручиваю, что не успела', life: 'Работа, дети, родители, ипотека — в голове сорок открытых вкладок. Засыпаю с телефоном, просыпаюсь раньше будильника.', answer: 'Стресс сжигает магний и витамины группы B быстрее, чем их даёт еда. L-теанин 200 мг снимает фон без сонливости, магний — мышечный зажим. Кофеина нет.', dose: 'L-теанин 200 мг · Магний 300 мг · Без кофеина', week: 'Недели 5–6: засыпание быстрее, утро без разбитости' },
]

export function Pains() {
  return (
    <section id="znakomo" className="bg-white py-20 md:py-28" aria-labelledby="pains-title">
      <div className="wrap">
        <Fade><h2 id="pains-title" className="h2 max-w-[14em] text-ink">Узнаёте себя хотя бы в&nbsp;двух?</h2></Fade>
        <Fade delay={0.05}><p className="lead mt-3 max-w-[34em] text-black/60">Листайте. Под каждой историей — что в стике отвечает именно за это и на какой неделе ждать изменений.</p></Fade>
      </div>
      <div className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 md:gap-4 md:px-[max(20px,calc((100vw_-_1180px)/2))]">
        {PAINS.map((p, i) => (
          <Fade key={p.tag} delay={i * 0.04} className="w-[84vw] max-w-[380px] shrink-0 snap-start">
            <article className="card flex h-full flex-col gap-4 p-6">
              <div className="flex items-center justify-between"><span className="label text-wine">{p.tag}</span><span className="tnum text-[13px] text-black/45">{i + 1} / {PAINS.length}</span></div>
              <h3 className="text-[22px] font-semibold leading-[1.15]">«{p.quote}»</h3>
              <p className="text-[14.5px] italic leading-relaxed text-black/60">{p.life}</p>
              <div className="mt-auto rounded-[18px] bg-blush-soft p-4">
                <p className="label text-wine/70">Что в стике</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-black/80">{p.answer}</p>
                <p className="mt-3 text-[13.5px] font-semibold text-wine">{p.dose}</p>
              </div>
              <p className="text-[13.5px] font-semibold text-wine">{p.week}</p>
            </article>
          </Fade>
        ))}
      </div>
    </section>
  )
}

export function Bridge() {
  return (
    <section className="bg-blush py-20 text-wine md:py-28" aria-label="Почему так происходит">
      <div className="wrap grid gap-8 md:grid-cols-2 md:gap-14">
        <Fade><h2 className="text-[clamp(36px,5.6vw,76px)] font-bold leading-[1.02] text-wine">Это не характер.<br />Это дефициты.</h2></Fade>
        <div className="flex flex-col gap-5 self-end text-[16.5px] leading-relaxed text-wine/80">
          <Fade>Телу не хватает того, что трудно добрать едой: железа, D, B12, магния, клетчатки. Каждый день понемногу. Годами.</Fade>
          <Fade delay={0.08}>Вы уже пробовали. Купили D. Потом магний. Потом коллаген, железо, омегу, «что-то для кишечника». Полка превратилась в аптеку, а пьёте вы её через раз — потому что 9 капсул утром никто не выдерживает дольше двух недель.</Fade>
          <Fade delay={0.16}><p className="text-[18px] font-semibold text-wine">mouren собирает всё это в один стакан. Утром. За 20 секунд.</p></Fade>
        </div>
      </div>
    </section>
  )
}

const STACK = [
  ['Коллаген морской', '1 уп.', 2850], ['Магний цитрат', '1 уп.', 1125], ['Железо бисглицинат', '1 уп.', 975], ['Мио-инозитол', '1 уп.', 1350],
  ['Пребиотики PHGG + XOS', '2 уп.', 2100], ['Пробиотик + постбиотик', '2 уп.', 1950], ['Гиалуроновая кислота + астаксантин', '2 уп.', 2400],
  ['B-комплекс в активных формах + D3/K2', '2 уп.', 1650], ['L-теанин', '1 уп.', 1050],
]

export function Replace({ onOrder }) {
  const month = CONFIG.plans.find((p) => p.id === 'month')
  const save = CONFIG.stackPrice - month.price
  return (
    <section id="formula" className="bg-wine py-20 text-white md:py-28" aria-labelledby="replace-title">
      <div className="wrap grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Fade><p className="label text-blush/60">Почему не 22 добавки</p></Fade>
          <Fade><h2 id="replace-title" className="h2 mt-3 text-blush">1 стик вместо 22&nbsp;добавок</h2></Fade>
          <Fade><p className="lead mt-4 text-white/75">31 вещество в тех же формах и дозах. По отдельности это минимум 22 добавки на полке и горсть капсул каждое утро.</p></Fade>
          <Fade className="mt-7 grid grid-cols-3 gap-2.5">
            {[['Добавок на полке', '22', '1'], ['Рублей в месяц', `${CONFIG.stackPrice.toLocaleString('ru-RU')}+`, month.price.toLocaleString('ru-RU')], ['Капсул утром', 'до 22', '0']].map(([l, a, b]) => (
              <div key={l} className="card-dark p-4">
                <p className="text-[12.5px] leading-tight text-white/60">{l}</p>
                <p className="mt-2 text-[14px] text-white/45 line-through">{a}</p>
                <p className="tnum text-[26px] font-bold leading-none text-white">{b}</p>
              </div>
            ))}
          </Fade>
          <Fade className="mt-7 rounded-[24px] bg-blush p-6 text-wine">
            <p className="text-[15px] font-medium">Экономия каждый месяц</p>
            <p className="tnum mt-1 text-[clamp(36px,4.4vw,56px)] font-bold leading-none tracking-[-0.03em]">{rub(save)}</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-wine/80">И 22 добавки не нужно помнить, сверять между собой и допивать до срока годности. Одно движение утром вместо системы.</p>
          </Fade>
        </div>
        <Fade>
          <ul>
            {STACK.map(([n, q, p]) => (
              <li key={n} className="flex items-start justify-between gap-4 border-b border-white/12 py-4">
                <span><span className="block text-[16px] font-semibold">{n}</span><span className="text-[13px] text-white/55">{q}</span></span>
                <span className="tnum shrink-0 text-[16px] font-semibold">{rub(p)}</span>
              </li>
            ))}
            <li className="flex items-start justify-between gap-4 border-b border-white/12 py-4">
              <span><span className="block text-[16px] font-semibold">C, E, β-каротин, цинк + медь, йод, селен, β-глюкан, OPC, имбирь</span><span className="text-[13px] text-white/55">ещё 9 уп.</span></span>
              <span className="shrink-0 text-[14px] text-white/60">не в сумме</span>
            </li>
          </ul>
          <div className="card-dark mt-5 p-6">
            <div className="flex items-baseline justify-between gap-4"><span className="text-white/70">По отдельности</span><s className="tnum text-[24px] font-bold text-white/50">от {rub(CONFIG.stackPrice)}</s></div>
            <div className="mt-2 flex items-baseline justify-between gap-4"><span className="font-semibold">mouren, 30 стиков</span><b className="tnum text-[36px] font-bold">{rub(month.price)}</b></div>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-white/45">Ориентир: средние цены маркетплейсов на аналогичные дозы и формы, сентябрь 2026. Пересчитываем ежеквартально.</p>
          <button type="button" onClick={onOrder} className="btn btn-blush mt-6 w-full">Собрать всё в один стик</button>
        </Fade>
      </div>
    </section>
  )
}

const WHY = [
  ['Всё сразу и вместе', 'Витамины работают командой. D3 без K2 — половина дела. Железо без витамина C усваивается хуже. Магний, B6 и цинк нужны друг другу. В mouren партнёры уже вместе и в нужных пропорциях — сочетать самой ничего не надо.'],
  ['Активные формы', 'Метилфолат вместо фолиевой кислоты. Метил-B12 вместо цианокобаламина. P5P вместо простого B6. Железо, цинк и медь — в бисглицинатах. Телу не нужно «переделывать» витамин: он сразу готов к работе.'],
  ['Рабочие дозы, а не «следы»', '12,8 г действующих веществ в стике 15 г. Ни одна доза не спрятана в «комплекс» и ни одна не выше верхнего допустимого уровня. Всё, что написано на тубе, — есть в стакане.'],
  ['Кишечник как фундамент', '5,65 г клетчатки — еда для ваших бактерий. Споровый пробиотик переживает желудочный сок, постбиотик работает без приживления. Спокойный живот — первое, что вы заметите.'],
]

export function Why() {
  return (
    <section className="bg-white py-20 md:py-28" aria-labelledby="why-title">
      <div className="wrap">
        <Fade><h2 id="why-title" className="h2 max-w-[16em]">Почему один стик работает лучше полки с&nbsp;добавками</h2></Fade>
        <div className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4">
          {WHY.map(([t, d], i) => (
            <Fade key={t} delay={i * 0.05} className="card flex flex-col gap-3 p-7">
              <span className="grid size-10 place-items-center rounded-full bg-wine text-[15px] font-bold text-blush">{i + 1}</span>
              <h3 className="text-[22px] font-semibold leading-tight">{t}</h3>
              <p className="text-[15.5px] leading-relaxed text-black/65">{d}</p>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Ritual() {
  const steps = [
    ['Стакан холодной воды, 200–250 мл', 'Пока закипает чайник. Холодной — чтобы пробиотики и витамин C дошли целыми.'],
    ['Высыпать стик, 20 секунд размешать', 'Растворяется без комков. Цвет — от свёклы и чёрной моркови, вкус — клубника и малина, без сахара.'],
    ['Выпить с завтраком', 'D3, E, K2 и каротиноиды жирорастворимые — с едой усваиваются полнее. Дальше день ваш.'],
  ]
  return (
    <section id="ritual" className="bg-wine py-20 text-white md:py-28" aria-labelledby="ritual-title">
      <div className="wrap grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Fade><h2 id="ritual-title" className="h2 text-white">Вода, стик, 20&nbsp;секунд размешать</h2></Fade>
          <Fade><p className="lead mt-4 text-white/70">До первой чашки кофе. На вкус — ягодный лимонад без сахара. Лучшая добавка — та, которую пьёшь каждый день, а эту пить приятно.</p></Fade>
          <Fade className="mt-8 grid grid-cols-2 gap-2.5">
            {[['Без сахара', 'Стевия и эритрит'], ['Без синтетических красителей', 'Чёрная морковь и свёкла'], ['Без кофеина', 'Не мешает вечернему сну'], ['Без «комплексов»', 'Каждая доза названа']].map(([t, d]) => (
              <div key={t} className="card-dark p-4"><p className="text-[15px] font-semibold">{t}</p><p className="mt-1 text-[13px] text-white/60">{d}</p></div>
            ))}
          </Fade>
        </div>
        <ol className="flex flex-col gap-3">
          {steps.map(([t, d], i) => (
            <Fade as="li" key={t} delay={i * 0.06} className="card-dark flex gap-4 p-5 md:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[16px] font-bold text-wine">{i + 1}</span>
              <div><h3 className="text-[18px] font-semibold leading-snug">{t}</h3><p className="mt-1.5 text-[15px] leading-relaxed text-white/65">{d}</p></div>
            </Fade>
          ))}
        </ol>
      </div>
    </section>
  )
}
