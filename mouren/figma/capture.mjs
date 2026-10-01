// Снимает экраны сайта mouren в JSON-дерево слоёв для плагина Figma
// Запуск: npm run build (в mouren/), затем node figma/capture.mjs [id экрана] и python3 figma/build.py
import { createRequire } from 'module'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { routeFonts } from './fontroute.mjs'

const { chromium } = await import('playwright').catch(() => createRequire('/opt/node22/lib/node_modules/')('playwright'))
const DIR = new URL('.', import.meta.url).pathname
const DIST = path.join(DIR, '../dist')
const SER = fs.readFileSync(DIR + 'serialize.js', 'utf8')
const only = process.argv[2] // необязательный фильтр по id экрана

// собранный сайт раздаём сами — внешняя сеть не нужна, шрифт Golos Text лежит в figma/fonts
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' }
const server = http.createServer((req, res) => {
  const f = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}/`

const MOB = { width: 390, height: 844, isMobile: true, hasTouch: true }
const DESK = { width: 1440, height: 900 }
const MARKS_MOB = {
  'header': 'Шапка / мобайл',
  '#top .btn-wine': 'Кнопка / основная',
  '#final .btn-blush': 'Кнопка / светлая',
  '#voprosy .card': 'Вопрос (аккордеон)',
  '#otzyvy article, #otzyvy .card': 'Карточка отзыва',
  '#nauka .chip': 'Чип / фильтр',
}
const MARKS_DESK = { 'header': 'Шапка / десктоп', '.btn-ghost': 'Кнопка / контурная' }

const SCREENS = [
  { id: 'm-landing', page: 'mobile', name: 'Лендинг · 390', url: 'index.html', vp: MOB, mode: 'page', marks: MARKS_MOB },
  { id: 'm-product', page: 'mobile', name: 'Карточка товара · 390', url: 'product.html?plan=course', vp: MOB, mode: 'page', marks: { 'main [role=radiogroup]': 'Переключатель подписки' } },
  { id: 'm-menu', page: 'mobile', name: 'Меню открыто · 390', url: 'index.html', vp: MOB, mode: 'viewport', act: async (p) => { await p.click('button[aria-controls=menu]'); await p.waitForTimeout(900) } },
  { id: 'm-scroll', page: 'mobile', name: 'Лендинг при прокрутке · 390', url: 'index.html', vp: MOB, mode: 'viewport', act: async (p) => { await scrollTo(p, '#otzyvy', -40) } },
  { id: 'm-pscroll', page: 'mobile', name: 'Карточка товара при прокрутке · 390', url: 'product.html?plan=course', vp: MOB, mode: 'viewport', act: async (p) => { await scrollTo(p, '#feel-title', -120) } },
  { id: 'm-order', page: 'mobile', name: 'Оформление заказа · 390', url: 'product.html?plan=course', vp: MOB, mode: 'viewport', act: async (p) => { await p.locator('main button.btn-wine').first().click(); await p.waitForTimeout(900); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.waitForTimeout(200) } },
  { id: 'm-bar', page: 'parts', name: 'Нижняя панель лендинга', url: 'index.html', vp: MOB, mode: 'viewport', only: 'div.fixed.bottom-0 > div', comp: 'Нижняя панель / лендинг', act: async (p) => { await scrollTo(p, '#otzyvy', -40) } },
  { id: 'm-pbar', page: 'parts', name: 'Нижняя панель карточки', url: 'product.html?plan=course', vp: MOB, mode: 'viewport', only: 'div.fixed.bottom-0', comp: 'Нижняя панель / карточка товара', act: async (p) => { await scrollTo(p, '#feel-title', -120) } },
  { id: 'd-landing', page: 'desktop', name: 'Лендинг · 1440', url: 'index.html', vp: DESK, mode: 'page', marks: MARKS_DESK },
  { id: 'd-product', page: 'desktop', name: 'Карточка товара · 1440', url: 'product.html?plan=course', vp: DESK, mode: 'page' },
]

async function scrollTo(p, sel, off) {
  await p.evaluate(([s, o]) => { const y = document.querySelector(s).getBoundingClientRect().top + scrollY + o; window.scrollTo({ top: y, behavior: 'instant' }) }, [sel, off])
  await p.waitForTimeout(900)
}

const b = await chromium.launch()
const out = fs.existsSync(DIR + 'data.json') ? JSON.parse(fs.readFileSync(DIR + 'data.json', 'utf8')) : { screens: [], rasters: {} }
for (const s of SCREENS) {
  if (only && s.id !== only) continue
  const ctx = await b.newContext({ viewport: { width: s.vp.width, height: s.vp.height }, isMobile: !!s.vp.isMobile, hasTouch: !!s.vp.hasTouch, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  await routeFonts(ctx)
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(BASE + s.url, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  const golos = await p.evaluate(async () => { await document.fonts.load('600 16px "Golos Text"'); return [...document.fonts].filter((f) => f.family.includes('Golos') && f.status === 'loaded').length })
  if (!golos) throw new Error('Golos Text не загрузился')
  // прогон страницы, чтобы сработали все «появления в кадре»
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += 600) { await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await p.waitForTimeout(60) }
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await p.waitForTimeout(700)
  if (s.act) await s.act(p)
  await p.addScriptTag({ content: SER })
  const res = await p.evaluate((o) => window.__ser(o), { mode: s.mode, only: s.only, name: s.name, marks: s.marks || {} })
  if (s.comp) res.root.comp = s.comp
  // растровые фрагменты: повёрнутые значки, уменьшенные превью, системные чекбоксы
  for (const id of res.rasters) {
    const loc = p.locator(`[data-capid="${id}"]`)
    if (s.mode === 'page') {
      // убираем всё, что может перекрыть фрагмент, и снимаем прозрачность предков (её даст рамка в Figma)
      await p.evaluate((i) => {
        const el = document.querySelector(`[data-capid="${i}"]`)
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
        document.querySelectorAll('header, .fixed, .sticky').forEach((h) => { if (!h.contains(el)) { h.dataset.capvis = h.style.visibility; h.style.visibility = 'hidden' } })
        for (let a = el.parentElement; a; a = a.parentElement) if (parseFloat(getComputedStyle(a).opacity) < 1) { a.dataset.capop = a.style.opacity; a.style.opacity = '1' }
      }, id)
      await p.waitForTimeout(120)
    }
    const buf = await loc.screenshot({ type: 'png', animations: 'disabled' })
    out.rasters[s.id + ':' + id] = buf.toString('base64')
    if (s.mode === 'page') await p.evaluate(() => { document.querySelectorAll('[data-capvis]').forEach((h) => { h.style.visibility = h.dataset.capvis; delete h.dataset.capvis }); document.querySelectorAll('[data-capop]').forEach((h) => { h.style.opacity = h.dataset.capop; delete h.dataset.capop }) })
  }
  const count = (r) => 1 + (r.ch || []).reduce((t, c) => t + count(c), 0)
  console.log(s.id, 'nodes', count(res.root), 'rasters', res.rasters.length, 'h', res.root.h, errs.length ? errs : '')
  out.screens = out.screens.filter((x) => x.id !== s.id)
  out.screens.push({ id: s.id, page: s.page, name: s.name, root: res.root })
  await ctx.close()
}
out.screens.sort((a, c) => SCREENS.findIndex((x) => x.id === a.id) - SCREENS.findIndex((x) => x.id === c.id))
fs.writeFileSync(DIR + 'data.json', JSON.stringify(out))
console.log('saved', (fs.statSync(DIR + 'data.json').size / 1e6).toFixed(2), 'MB')
await b.close()
server.close()
