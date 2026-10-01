// mouren → Figma
// Плагин строит макеты сайта mouren редактируемыми слоями: тексты, плашки, иконки, фото,
// цвета — переменными, типографику — стилями текста, повторяющиеся элементы — компонентами.

const DATA = /*__DATA__*/null
const IMAGES = /*__IMAGES__*/null

const TOKENS = [
  ['wine', '#471D1F', 'Бордо — основной цвет бренда, кнопки и тёмные секции'],
  ['wine-deep', '#351416', 'Глубокий бордо — подвал, наведение на кнопки'],
  ['blush', '#F4D1CB', 'Пудра — первый экран, светлые кнопки'],
  ['blush-soft', '#F9E6E2', 'Светлая пудра — фоны секций и плашек'],
  ['ink', '#1A0C0D', 'Текст'],
  ['white', '#FFFFFF', 'Белый'],
]
const PAGE_TITLES = { mobile: '📱 Мобайл', desktop: '🖥 Десктоп', ds: '🎨 Дизайн-система' }
const BLEND = { multiply: 'MULTIPLY', screen: 'SCREEN', overlay: 'OVERLAY', darken: 'DARKEN', lighten: 'LIGHTEN' }
const WEIGHT_NAMES = { 100: 'thin', 200: 'extralight', 300: 'light', 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black' }

const errors = []
const fail = (where, e) => { if (errors.length < 40) errors.push(where + ': ' + (e && e.message ? e.message : e)) }

/* ---------- цвета ---------- */
const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return { r: (n >> 16 & 255) / 255, g: (n >> 8 & 255) / 255, b: (n & 255) / 255 } }
const vars = []
function tokenFor(c) {
  for (const t of vars) {
    if (Math.abs(t.rgb.r - c[0]) < 0.009 && Math.abs(t.rgb.g - c[1]) < 0.009 && Math.abs(t.rgb.b - c[2]) < 0.009) return t
  }
  return null
}
function paint(c) {
  const t = tokenFor(c)
  const color = t ? { r: t.rgb.r, g: t.rgb.g, b: t.rgb.b } : { r: clamp(c[0]), g: clamp(c[1]), b: clamp(c[2]) }
  const p = { type: 'SOLID', color, opacity: clamp(c[3] == null ? 1 : c[3]) }
  if (t && t.v) {
    try { return figma.variables.setBoundVariableForPaint(p, 'color', t.v) } catch (e) { fail('переменная цвета', e) }
  }
  return p
}
function clamp(v) { return Math.min(1, Math.max(0, Number(v) || 0)) }

/* ---------- шрифты ---------- */
let FAMILY = 'Golos Text'
let STYLES = []
const fontCache = {}
const norm = (s) => s.toLowerCase().replace(/[\s_-]/g, '')
function fontFor(w) {
  const k = Math.min(900, Math.max(100, Math.round((w || 400) / 100) * 100))
  if (fontCache[k]) return fontCache[k]
  for (const ww of [k, k + 100, k - 100, k + 200, k - 200, 400]) {
    const st = STYLES.find((s) => norm(s) === WEIGHT_NAMES[ww])
    if (st) return (fontCache[k] = { family: FAMILY, style: st })
  }
  return (fontCache[k] = { family: FAMILY, style: STYLES[0] })
}

/* ---------- картинки ---------- */
const hashCache = {}
function imageHash(key, b64) {
  if (hashCache[key]) return hashCache[key]
  if (!b64) return null
  const img = figma.createImage(figma.base64Decode(b64))
  return (hashCache[key] = img.hash)
}

/* ---------- стили текста ---------- */
const textStyles = {}
const textStyleList = []
const roleUse = {}
const mainRun = (rec) => rec.runs.reduce((a, b) => (b.s.length > a.s.length ? b : a))
const prefixOf = (page) => (page === 'desktop' ? 'Десктоп' : 'Мобайл')
function textStyleFor(prefix, rec, run) {
  const name = `${prefix}/${rec.st} · ${run.z}`
  // стиль заводим только для повторяющихся ролей, чтобы не плодить одноразовые
  if (rec.st !== 'H1' && (roleUse[name] || 0) < 2) return null
  const sig = [run.f, run.z, run.ls, run.up ? 1 : 0, run.dec || '', rec.lhAuto ? 'a' : rec.lh].join('|')
  const key = name + '#' + sig
  if (textStyles[key] !== undefined) return textStyles[key]
  try {
    const st = figma.createTextStyle()
    const same = textStyleList.filter((x) => x.style.name === name || x.style.name.startsWith(name + ' (')).length
    st.name = same ? `${name} (${same + 1})` : name
    st.fontName = fontFor(run.f)
    st.fontSize = run.z
    st.lineHeight = rec.lhAuto ? { unit: 'AUTO' } : { unit: 'PIXELS', value: rec.lh }
    st.letterSpacing = { unit: 'PIXELS', value: run.ls || 0 }
    if (run.up) st.textCase = 'UPPER'
    if (run.dec) st.textDecoration = run.dec === 's' ? 'STRIKETHROUGH' : 'UNDERLINE'
    const entry = { style: st, sig, sample: run.s, color: run.c }
    textStyleList.push(entry)
    return (textStyles[key] = entry)
  } catch (e) {
    fail('стиль текста', e)
    return (textStyles[key] = null)
  }
}

/* ---------- построение узлов ---------- */
function applyBox(f, rec) {
  f.name = rec.n || 'Блок'
  f.resize(Math.max(0.01, rec.w), Math.max(0.01, rec.h))
  f.fills = rec.fill ? [paint(rec.fill)] : []
  f.clipsContent = !!rec.clip
  radii(f, rec.rad)
  if (rec.stroke) {
    f.strokes = [paint(rec.stroke.c)]
    f.strokeAlign = 'INSIDE'
    const [t, r, b, l] = rec.stroke.w
    if (t === r && r === b && b === l) f.strokeWeight = t
    else { f.strokeTopWeight = t; f.strokeRightWeight = r; f.strokeBottomWeight = b; f.strokeLeftWeight = l }
    if (rec.stroke.dash) f.dashPattern = [6, 4]
  }
  effects(f, rec)
  if (rec.op !== undefined) f.opacity = clamp(rec.op)
  if (rec.blend && BLEND[rec.blend]) f.blendMode = BLEND[rec.blend]
}
function radii(n, rad) {
  if (!rad) return
  const [a, b, c, d] = rad
  if (a === b && b === c && c === d) n.cornerRadius = a
  else { n.topLeftRadius = a; n.topRightRadius = b; n.bottomRightRadius = c; n.bottomLeftRadius = d }
}
function effects(n, rec) {
  const fx = []
  for (const s of rec.sh || []) {
    fx.push({
      type: s.inset ? 'INNER_SHADOW' : 'DROP_SHADOW', color: { r: clamp(s.c[0]), g: clamp(s.c[1]), b: clamp(s.c[2]), a: clamp(s.c[3]) },
      offset: { x: s.x, y: s.y }, radius: Math.max(0, s.b), spread: s.s || 0, visible: true, blendMode: 'NORMAL',
    })
  }
  if (!fx.length && !rec.bblur) return
  const blur = rec.bblur ? [{ type: 'BACKGROUND_BLUR', radius: rec.bblur, visible: true }] : []
  try { n.effects = fx.concat(blur.map((b) => Object.assign({ blurType: 'NORMAL' }, b))) } catch (e) {
    try { n.effects = fx.concat(blur) } catch (e2) { try { n.effects = fx } catch (e3) { fail('тени', e3) } }
  }
}

async function makeText(rec, ctx) {
  const t = figma.createText()
  const text = rec.runs.map((r) => r.s).join('')
  t.fontName = fontFor(rec.runs[0].f)
  t.characters = text
  let i = 0
  const styled = []
  for (const r of rec.runs) {
    const s = i, e = i + r.s.length
    i = e
    if (e <= s) continue
    t.setRangeFontName(s, e, fontFor(r.f))
    t.setRangeFontSize(s, e, Math.max(1, r.z))
    t.setRangeFills(s, e, [paint(r.c)])
    if (r.ls) t.setRangeLetterSpacing(s, e, { unit: 'PIXELS', value: r.ls })
    if (r.dec) t.setRangeTextDecoration(s, e, r.dec === 's' ? 'STRIKETHROUGH' : 'UNDERLINE')
    if (r.up) t.setRangeTextCase(s, e, 'UPPER')
    styled.push([s, e, r])
  }
  t.lineHeight = rec.lhAuto ? { unit: 'AUTO' } : { unit: 'PIXELS', value: rec.lh }
  t.textAlignHorizontal = rec.align || 'LEFT'
  // стиль текста — на куски, совпадающие с ролью (заголовок, лид, кнопка…)
  if (rec.st) {
    const entry = textStyleFor(ctx.prefix, rec, mainRun(rec))
    if (entry) {
      for (const [s, e, r] of styled) {
        const sig = [r.f, r.z, r.ls, r.up ? 1 : 0, r.dec || '', rec.lhAuto ? 'a' : rec.lh].join('|')
        if (sig !== entry.sig) continue
        try {
          if (typeof t.setRangeTextStyleIdAsync === 'function') await t.setRangeTextStyleIdAsync(s, e, entry.style.id)
          else t.setRangeTextStyleId(s, e, entry.style.id)
        } catch (err) { fail('применение стиля текста', err) }
      }
    }
  }
  if (rec.trunc) {
    t.resize(Math.max(1, rec.w), Math.max(1, rec.lh))
    t.textAutoResize = 'HEIGHT'
    try { t.textTruncation = 'ENDING'; t.maxLines = 1 } catch (e) { /* старые версии Figma */ }
  } else if (rec.lines === 1) {
    t.textAutoResize = 'WIDTH_AND_HEIGHT'
  } else {
    t.resize(Math.max(1, rec.w + 3), Math.max(1, rec.h))
    t.textAutoResize = 'HEIGHT'
  }
  return t
}
function placeText(t, rec) {
  let x = rec.x
  if (!rec.trunc) {
    if (rec.lines === 1) {
      if (rec.align === 'CENTER') x = rec.x + (rec.w - t.width) / 2
      else if (rec.align === 'RIGHT') x = rec.x + rec.w - t.width
    } else if (rec.align === 'CENTER') x = rec.x - 1.5
    else if (rec.align === 'RIGHT') x = rec.x - 3
  }
  t.x = x
  t.y = rec.y
}

function bindSvgColors(node) {
  const all = 'findAll' in node ? node.findAll(() => true) : []
  for (const n of all) {
    for (const prop of ['fills', 'strokes']) {
      if (!(prop in n) || !Array.isArray(n[prop]) || !n[prop].length) continue
      const ps = n[prop].map((p) => {
        if (p.type !== 'SOLID') return p
        const t = tokenFor([p.color.r, p.color.g, p.color.b])
        if (!t || !t.v) return p
        try { return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: p.color, opacity: p.opacity == null ? 1 : p.opacity }, 'color', t.v) } catch (e) { return p }
      })
      try { n[prop] = ps } catch (e) { /* не страшно */ }
    }
  }
}

async function build(rec, parent, ctx) {
  ctx.count++
  try {
    if (rec.k === 'f') {
      const f = figma.createFrame()
      applyBox(f, rec)
      parent.appendChild(f)
      f.x = rec.x; f.y = rec.y
      const kids = (rec.ch || []).slice().sort((a, b) => (a.z || 0) - (b.z || 0))
      for (const c of kids) await build(c, f, ctx)
      if (rec.comp) ctx.comps.push([rec.comp, f])
      return f
    }
    if (rec.k === 't') {
      const t = await makeText(rec, ctx)
      parent.appendChild(t)
      placeText(t, rec)
      return t
    }
    if (rec.k === 'i' || rec.k === 'r') {
      const hash = rec.k === 'i' ? imageHash('img:' + rec.src, IMAGES[rec.src]) : imageHash(ctx.id + ':' + rec.id, DATA.rasters[ctx.id + ':' + rec.id])
      const r = figma.createRectangle()
      r.name = rec.k === 'i' ? (rec.n || 'Фото') : (rec.n === 'span' ? 'Значок' : 'Фрагмент')
      r.resize(Math.max(0.01, rec.w), Math.max(0.01, rec.h))
      r.fills = hash ? [{ type: 'IMAGE', imageHash: hash, scaleMode: rec.fit === 'contain' ? 'FIT' : 'FILL' }] : [{ type: 'SOLID', color: { r: 0.9, g: 0.85, b: 0.84 } }]
      radii(r, rec.rad)
      if (rec.op !== undefined) r.opacity = clamp(rec.op)
      if (rec.blend && BLEND[rec.blend]) r.blendMode = BLEND[rec.blend]
      parent.appendChild(r)
      r.x = rec.x; r.y = rec.y
      return r
    }
    if (rec.k === 's') {
      const n = figma.createNodeFromSvg(rec.svg)
      n.name = rec.n || 'Иконка'
      parent.appendChild(n)
      n.x = rec.x; n.y = rec.y
      if (Math.abs(n.width - rec.w) > 0.5 || Math.abs(n.height - rec.h) > 0.5) n.resize(Math.max(0.01, rec.w), Math.max(0.01, rec.h))
      bindSvgColors(n)
      return n
    }
  } catch (e) {
    fail(`${ctx.name} → ${rec.k}${rec.n ? ' «' + rec.n + '»' : ''}`, e)
  }
  return null
}

/* ---------- страница «Дизайн-система» ---------- */
function label(text, size, weight, color, w) {
  const t = figma.createText()
  t.fontName = fontFor(weight)
  t.characters = text
  t.fontSize = size
  t.fills = [paint(color || [0.1, 0.047, 0.051, 1])]
  if (w) { t.resize(w, t.height); t.textAutoResize = 'HEIGHT' }
  return t
}
function stack(name, dir, gap) {
  const f = figma.createFrame()
  f.name = name
  f.layoutMode = dir
  f.primaryAxisSizingMode = 'AUTO'
  f.counterAxisSizingMode = 'AUTO'
  f.itemSpacing = gap
  f.fills = []
  f.clipsContent = false
  return f
}
const col = (name, gap) => stack(name, 'VERTICAL', gap)
const row = (name, gap) => stack(name, 'HORIZONTAL', gap)

async function main() {
  const note = figma.notify('mouren: строю макет — это займёт около минуты…', { timeout: 120000 })

  // шрифты
  const avail = await figma.listAvailableFontsAsync()
  STYLES = avail.filter((f) => f.fontName.family === 'Golos Text').map((f) => f.fontName.style)
  let noGolos = false
  if (!STYLES.length) {
    noGolos = true
    FAMILY = 'Inter'
    STYLES = avail.filter((f) => f.fontName.family === 'Inter').map((f) => f.fontName.style)
  }
  const weights = new Set([400, 500, 600, 700])
  const scan = (r) => { if (r.runs) r.runs.forEach((u) => weights.add(Math.round(u.f / 100) * 100)); (r.ch || []).forEach(scan) }
  DATA.screens.forEach((s) => scan(s.root))
  const count = (r, pre) => { if (r.k === 't' && r.st) { const k = `${pre}/${r.st} · ${mainRun(r).z}`; roleUse[k] = (roleUse[k] || 0) + 1 } (r.ch || []).forEach((c) => count(c, pre)) }
  DATA.screens.forEach((s) => count(s.root, prefixOf(s.page)))
  const fonts = [...new Set([...weights].map((w) => JSON.stringify(fontFor(w))))].map((s) => JSON.parse(s))
  for (const f of fonts) await figma.loadFontAsync(f)

  // переменные цвета
  try {
    const coll = figma.variables.createVariableCollection('mouren · цвета')
    const mode = coll.modes[0].modeId
    try { coll.renameMode(mode, 'Светлая') } catch (e) { /* не страшно */ }
    for (const [name, hex, desc] of TOKENS) {
      const v = figma.variables.createVariable(name, coll, 'COLOR')
      v.setValueForMode(mode, Object.assign(hexToRgb(hex), { a: 1 }))
      try { v.scopes = ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'] } catch (e) { /* не страшно */ }
      try { v.description = desc } catch (e) { /* не страшно */ }
      vars.push({ name, hex, desc, rgb: hexToRgb(hex), v })
    }
  } catch (e) {
    fail('переменные', e)
    for (const [name, hex, desc] of TOKENS) if (!vars.find((x) => x.name === name)) vars.push({ name, hex, desc, rgb: hexToRgb(hex), v: null })
  }

  // страницы
  const first = figma.root.children[0]
  const pages = {}
  if (first.children.length === 0) { first.name = PAGE_TITLES.mobile; pages.mobile = first } else { pages.mobile = figma.createPage(); pages.mobile.name = PAGE_TITLES.mobile }
  pages.desktop = figma.createPage(); pages.desktop.name = PAGE_TITLES.desktop
  pages.ds = figma.createPage(); pages.ds.name = PAGE_TITLES.ds

  // каркас дизайн-системы
  const ds = col('Дизайн-система mouren', 64)
  pages.ds.appendChild(ds)
  ds.x = 0; ds.y = 0
  ds.paddingLeft = ds.paddingRight = ds.paddingTop = ds.paddingBottom = 80
  ds.fills = [paint([1, 1, 1, 1])]
  ds.cornerRadius = 32
  ds.appendChild(label('mouren — дизайн-система', 56, 700, [0.278, 0.114, 0.122, 1]))
  ds.appendChild(label('Цвета — переменные «mouren · цвета». Типографика — стили текста. Ниже — компоненты, которые используются в макетах.', 18, 400, [0, 0, 0, 0.6], 900))

  const colors = col('Цвета', 20)
  colors.appendChild(label('Цвета', 32, 700))
  const swRow = row('Палитра', 20)
  for (const t of vars) {
    const card = col(t.name, 10)
    const sw = figma.createFrame()
    sw.name = t.name
    sw.resize(180, 120)
    sw.cornerRadius = 20
    sw.fills = [paint([t.rgb.r, t.rgb.g, t.rgb.b, 1])]
    sw.strokes = [paint([0.278, 0.114, 0.122, 0.12])]
    sw.strokeWeight = 1
    card.appendChild(sw)
    card.appendChild(label(t.name, 16, 600))
    card.appendChild(label(t.hex, 14, 400, [0, 0, 0, 0.55]))
    card.appendChild(label(t.desc, 13, 400, [0, 0, 0, 0.55], 180))
    swRow.appendChild(card)
  }
  colors.appendChild(swRow)
  ds.appendChild(colors)

  const typo = col('Типографика', 24)
  typo.appendChild(label('Типографика', 32, 700))
  ds.appendChild(typo)

  const compsSec = col('Компоненты', 24)
  compsSec.appendChild(label('Компоненты', 32, 700))
  const compsGrid = figma.createFrame()
  compsGrid.name = 'Компоненты'
  compsGrid.fills = []
  compsGrid.clipsContent = false
  compsGrid.resize(1600, 100)
  compsSec.appendChild(compsGrid)
  ds.appendChild(compsSec)
  let cx = 0, cy = 0, rowH = 0
  const madeComps = {}
  function addComponent(name, node, replace) {
    if (madeComps[name]) return
    try {
      const clone = node.clone()
      compsGrid.appendChild(clone)
      const comp = figma.createComponentFromNode(clone)
      comp.name = name
      if (cx > 0 && cx + comp.width > 1600) { cx = 0; cy += rowH + 48; rowH = 0 }
      comp.x = cx; comp.y = cy
      cx += comp.width + 48
      rowH = Math.max(rowH, comp.height)
      compsGrid.resize(1600, Math.max(100, cy + rowH))
      madeComps[name] = comp
      if (replace && node.parent) {
        const parent = node.parent
        const idx = parent.children.indexOf(node)
        const inst = comp.createInstance()
        parent.insertChild(idx, inst)
        inst.x = node.x; inst.y = node.y
        node.remove()
      }
    } catch (e) { fail('компонент «' + name + '»', e) }
  }

  // экраны
  const slots = { mobile: 0, desktop: 0 }
  let firstFrame = null
  for (const s of DATA.screens) {
    const ctx = { id: s.id, name: s.name, prefix: prefixOf(s.page), comps: [], count: 0 }
    const target = s.page === 'parts' ? null : pages[s.page]
    const holder = target || pages.ds
    const root = await build(Object.assign({}, s.root, { x: 0, y: 0 }), holder, ctx)
    if (!root) continue
    root.name = s.name
    if (target) {
      root.x = slots[s.page]; root.y = 0
      slots[s.page] += root.width + (s.page === 'desktop' ? 200 : 120)
      if (!firstFrame && s.page === 'mobile') firstFrame = root
      for (const [name, node] of ctx.comps) addComponent(name, node, true)
    } else {
      // фрагменты (нижние панели) сразу становятся компонентами
      addComponent(s.root.comp || s.name, root, false)
      root.remove()
    }
  }

  // образцы стилей текста
  for (const entry of textStyleList) {
    try {
      const r = row(entry.style.name, 32)
      r.counterAxisAlignItems = 'CENTER'
      r.appendChild(label(entry.style.name, 13, 500, [0, 0, 0, 0.55], 220))
      const t = figma.createText()
      t.fontName = entry.style.fontName
      t.characters = (entry.sample || 'Все витамины на день').slice(0, 60)
      if (typeof t.setTextStyleIdAsync === 'function') await t.setTextStyleIdAsync(entry.style.id)
      else t.textStyleId = entry.style.id
      t.fills = [paint(entry.color || [0.1, 0.05, 0.05, 1])]
      r.appendChild(t)
      typo.appendChild(r)
    } catch (e) { fail('образец стиля', e) }
  }

  note.cancel()
  await figma.setCurrentPageAsync(pages.mobile)
  if (firstFrame) figma.viewport.scrollAndZoomIntoView([firstFrame])
  const msg = `mouren: готово — ${DATA.screens.length} экранов, ${textStyleList.length} стилей текста, ${Object.keys(madeComps).length} компонентов` +
    (noGolos ? '. Шрифт Golos Text не найден — временно Inter, установите Golos Text и замените шрифт' : '') +
    (errors.length ? `. Пропущено элементов: ${errors.length}` : '')
  if (errors.length) console.log('mouren: пропущенные элементы\n' + errors.join('\n'))
  figma.closePlugin(msg)
}

main().catch((e) => {
  console.log(e)
  figma.closePlugin('mouren: ошибка — ' + (e && e.message ? e.message : e))
})
