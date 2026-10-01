// Снимает отрисованную страницу в дерево слоёв для Figma: рамки, тексты, картинки, SVG.
// Запускается внутри браузера: window.__ser({ mode: 'page' | 'viewport', only?, marks? })
window.__ser = function (opts) {
  const mode = opts.mode || 'page'
  const vw = innerWidth, vh = innerHeight
  const sx = mode === 'page' ? scrollX : 0, sy = mode === 'page' ? scrollY : 0
  const rasters = []
  let rid = 0
  const markEls = new Map()
  for (const [sel, name] of Object.entries(opts.marks || {})) {
    const el = document.querySelector(sel)
    if (el && !markEls.has(el)) markEls.set(el, name)
  }

  /* ---------- цвета ---------- */
  const clamp01 = (v) => Math.min(1, Math.max(0, v))
  const toSrgb = (c) => { c = Math.max(0, c); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055 }
  function oklab(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b
    const s_ = L - 0.0894841775 * a - 1.291485548 * b
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
    return [
      toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ].map(clamp01)
  }
  const num = (t, pct = 1) => { t = String(t).trim(); if (t === 'none') return 0; return t.endsWith('%') ? parseFloat(t) / 100 * pct : parseFloat(t) }
  function parseColor(s) {
    if (!s) return null
    s = s.trim()
    if (s === 'transparent' || s === 'none') return null
    let m = s.match(/^rgba?\(([^)]+)\)$/)
    if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean); return [num(p[0]) / 255, num(p[1]) / 255, num(p[2]) / 255, p.length > 3 ? num(p[3]) : 1] }
    m = s.match(/^oklab\(([^)]+)\)$/)
    if (m) { const [main, al] = m[1].split('/'); const p = main.trim().split(/\s+/); return [...oklab(num(p[0]), num(p[1], 0.4), num(p[2], 0.4)), al ? num(al) : 1] }
    m = s.match(/^oklch\(([^)]+)\)$/)
    if (m) { const [main, al] = m[1].split('/'); const p = main.trim().split(/\s+/); const C = num(p[1], 0.4), H = (parseFloat(p[2]) || 0) * Math.PI / 180; return [...oklab(num(p[0]), C * Math.cos(H), C * Math.sin(H)), al ? num(al) : 1] }
    m = s.match(/^color\(srgb ([^)]+)\)$/)
    if (m) { const [main, al] = m[1].split('/'); const p = main.trim().split(/\s+/).map((x) => num(x)); return [p[0], p[1], p[2], al ? num(al) : 1] }
    m = s.match(/^#([0-9a-f]{6})$/i)
    if (m) { const n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1] }
    return null
  }
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
  const R = (v) => Math.round(v * 100) / 100
  const rc = (c) => c && c.map((v) => Math.round(v * 10000) / 10000)

  function splitTop(s) {
    const out = []; let d = 0, cur = ''
    for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur); cur = '' } else cur += ch }
    if (cur.trim()) out.push(cur)
    return out
  }
  function parseShadows(s) {
    if (!s || s === 'none') return []
    return splitTop(s).map((part) => {
      part = part.trim()
      const inset = /\binset\b/.test(part)
      part = part.replace(/\binset\b/, '')
      const cm = part.match(/(rgba?\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}|transparent)/i)
      const c = cm ? parseColor(cm[1]) : [0, 0, 0, 1]
      const n = (cm ? part.replace(cm[1], '') : part).trim().split(/\s+/).map(parseFloat)
      return { inset, c: rc(c), x: n[0] || 0, y: n[1] || 0, b: n[2] || 0, s: n[3] || 0 }
    }).filter((x) => x.c && x.c[3] > 0.001)
  }

  /* ---------- коробка элемента ---------- */
  const SIDES = ['Top', 'Right', 'Bottom', 'Left']
  function radii(cs, w, h) {
    const lim = Math.min(w, h) / 2
    return ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map((k) => {
      const v = cs[k]; let n = parseFloat(v) || 0
      if (String(v).includes('%')) n = n / 100 * Math.min(w, h)
      return R(Math.min(n, lim))
    })
  }
  function boxStyle(cs, r) {
    const s = {}
    const bg = parseColor(cs.backgroundColor)
    if (bg && bg[3] > 0.001) s.fill = rc(bg)
    const bw = SIDES.map((k) => parseFloat(cs['border' + k + 'Width']) || 0)
    const bc = SIDES.map((k) => parseColor(cs['border' + k + 'Color']))
    const bst = SIDES.map((k) => cs['border' + k + 'Style'])
    const on = [0, 1, 2, 3].filter((i) => bw[i] > 0 && bc[i] && bc[i][3] > 0.001 && bst[i] !== 'none' && bst[i] !== 'hidden')
    if (on.length) s.stroke = { c: rc(bc[on[0]]), w: [0, 1, 2, 3].map((i) => (on.includes(i) ? bw[i] : 0)), dash: bst[on[0]] === 'dashed' }
    const sh = parseShadows(cs.boxShadow)
    if (sh.length) s.sh = sh
    const bf = cs.backdropFilter && cs.backdropFilter !== 'none' ? cs.backdropFilter.match(/blur\(([\d.]+)px\)/) : null
    if (bf && parseFloat(bf[1]) > 0) s.bblur = parseFloat(bf[1])
    const op = parseFloat(cs.opacity)
    if (op < 0.999) s.op = R(op)
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') s.clip = true
    if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') s.blend = cs.mixBlendMode
    const rr = radii(cs, r.width, r.height)
    if (rr.some((v) => v > 0)) s.rad = rr
    return s
  }
  const isVisual = (s) => !!(s.fill || s.stroke || s.sh || s.bblur || s.op !== undefined || s.blend)

  function transformKind(cs) {
    const bad = (v, id) => v && v !== 'none' && !id.includes(String(v).trim())
    if (bad(cs.rotate, ['0deg', '0']) || bad(cs.scale, ['1', '1 1'])) return 'complex'
    const t = cs.transform
    if (!t || t === 'none') return 'none'
    const m = t.match(/matrix\(([^)]+)\)/)
    if (m) {
      const [a, b, c, d] = m[1].split(',').map(parseFloat)
      if (Math.abs(a - 1) < 0.01 && Math.abs(b) < 0.01 && Math.abs(c) < 0.01 && Math.abs(d - 1) < 0.01) return 'none'
    }
    return 'complex'
  }
  function zOf(cs) {
    if (cs.position === 'static') return 0
    const z = cs.zIndex === 'auto' ? 0 : parseInt(cs.zIndex, 10) || 0
    return z < 0 ? -1000 + z : 1 + z
  }

  const SECTION_NAMES = {
    top: 'Первый экран', znakomo: 'Боли', formula: '1 стик вместо 22 добавок', nauka: 'Наука и врачи', kurs: '12 недель',
    otzyvy: 'Отзывы', sostav: 'Состав', ritual: 'Ритуал', tarify: 'Тарифы и гарантия', voprosy: 'Вопросы', final: 'Финальный экран',
    podval: 'Подвал', menu: 'Меню',
  }
  function nameOf(el) {
    if (markEls.has(el)) return markEls.get(el)
    if (el.id && SECTION_NAMES[el.id]) return SECTION_NAMES[el.id]
    const tag = el.tagName
    if (/^(SECTION|HEADER|FOOTER|NAV|MAIN|ARTICLE|ASIDE)$/.test(tag)) {
      if (tag === 'HEADER') return 'Шапка'
      if (tag === 'FOOTER') return 'Подвал'
      const al = el.getAttribute('aria-label')
      if (al) return al
      const h = el.querySelector('h1,h2,h3')
      if (h) return h.textContent.trim().replace(/\s+/g, ' ').slice(0, 48)
    }
    const cl = el.classList
    if (cl.contains('btn')) return 'Кнопка'
    if (cl.contains('chip')) return 'Чип'
    if (cl.contains('card') || cl.contains('card-dark')) return 'Карточка'
    if (tag === 'BUTTON') return 'Кнопка'
    if (tag === 'A') return 'Ссылка'
    if (tag === 'LI') return 'Пункт'
    if (tag === 'UL' || tag === 'OL') return 'Список'
    const al = el.getAttribute('aria-label')
    if (al) return al
    return tag.toLowerCase()
  }
  function roleOf(el) {
    for (let a = el, i = 0; a && i < 3; a = a.parentElement, i++) {
      if (a.tagName === 'H1') return 'H1'
      if (a.classList.contains('h2') || a.tagName === 'H2') return 'H2'
      if (a.tagName === 'H3') return 'H3'
      if (a.classList.contains('lead')) return 'Лид'
      if (a.classList.contains('label')) return 'Лейбл'
      if (a.classList.contains('btn')) return 'Кнопка'
      if (a.classList.contains('chip')) return 'Чип'
    }
    return ''
  }

  /* ---------- тексты ---------- */
  const NON_INLINE = /^(IMG|SVG|INPUT|TEXTAREA|BUTTON|SELECT|VIDEO|CANVAS|svg)$/
  function inlineOk(el) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none') return true
    if (el.tagName === 'BR') return true
    if (NON_INLINE.test(el.tagName)) return false
    if (cs.display !== 'inline') return false
    if (transformKind(cs) !== 'none') return false
    const bg = parseColor(cs.backgroundColor)
    if (bg && bg[3] > 0.001) return false
    return [...el.children].every(inlineOk)
  }
  function hidden(node, stop) {
    for (let a = node.nodeType === 1 ? node : node.parentElement; a && a !== stop.parentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.display === 'none' || cs.visibility === 'hidden') return true
      if (a === stop) break
    }
    return false
  }
  function runStyle(p, block) {
    const cs = getComputedStyle(p)
    let dec = ''
    for (let a = p; a; a = a.parentElement) {
      const d = getComputedStyle(a).textDecorationLine || ''
      if (d.includes('line-through')) { dec = 's'; break }
      if (d.includes('underline')) { dec = 'u'; break }
      if (a === block) break
    }
    return {
      f: parseInt(cs.fontWeight, 10) || 400, z: parseFloat(cs.fontSize), c: rc(parseColor(cs.color) || [0, 0, 0, 1]),
      ls: cs.letterSpacing === 'normal' ? 0 : R(parseFloat(cs.letterSpacing)), up: cs.textTransform === 'uppercase', it: cs.fontStyle === 'italic', dec,
      ff: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
    }
  }
  const sameStyle = (a, b) => a.f === b.f && a.z === b.z && a.ls === b.ls && a.up === b.up && a.it === b.it && a.dec === b.dec && a.ff === b.ff && a.c.join() === b.c.join()

  // block — элемент, задающий абзац; list — текстовые узлы (или null — все потомки)
  function textRecord(block, list) {
    const bcs = getComputedStyle(block)
    const pre = bcs.whiteSpace.startsWith('pre') || bcs.whiteSpace === 'break-spaces'
    const runs = []
    const rects = []
    let lastSpace = true
    const push = (s, st) => {
      const prev = runs[runs.length - 1]
      if (prev && sameStyle(prev.st, st)) prev.s += s
      else runs.push({ s, st })
    }
    const nodes = []
    if (list) nodes.push(...list)
    else {
      const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
      let n = w.nextNode()
      while (n) { if (n.nodeType === 3 || n.tagName === 'BR') nodes.push(n); n = w.nextNode() }
    }
    for (const n of nodes) {
      if (hidden(n, block)) continue
      if (n.nodeType === 1) { push('\n', runStyle(n.parentElement, block)); lastSpace = true; continue }
      let t = n.data
      if (!pre) t = t.replace(/[\t\n\r ]+/g, ' ')
      if (!pre && lastSpace) t = t.replace(/^ /, '')
      if (!t) continue
      lastSpace = t.endsWith(' ')
      push(t, runStyle(n.parentElement, block))
      const rg = document.createRange()
      rg.selectNodeContents(n)
      for (const q of rg.getClientRects()) if (q.width > 0.5 && q.height > 0.5) rects.push(q)
    }
    // хвостовые пробелы
    while (runs.length) {
      const last = runs[runs.length - 1]
      last.s = last.s.replace(/[ \n]+$/, '')
      if (last.s) break
      runs.pop()
    }
    if (!runs.length || !rects.length) return null
    rects.sort((a, b) => a.top - b.top)
    const lines = []
    for (const q of rects) {
      const g = lines.find((l) => Math.abs((l.top + l.bottom) / 2 - (q.top + q.bottom) / 2) < Math.max(3, (l.bottom - l.top) * 0.45))
      if (g) { g.top = Math.min(g.top, q.top); g.bottom = Math.max(g.bottom, q.bottom); g.left = Math.min(g.left, q.left); g.right = Math.max(g.right, q.right) }
      else lines.push({ top: q.top, bottom: q.bottom, left: q.left, right: q.right })
    }
    lines.sort((a, b) => a.top - b.top)
    const first = lines[0]
    const rectH = first.bottom - first.top
    const lhAuto = bcs.lineHeight === 'normal'
    const lh = lhAuto ? rectH : parseFloat(bcs.lineHeight)
    const left = Math.min(...lines.map((l) => l.left)), right = Math.max(...lines.map((l) => l.right))
    const align = /center/.test(bcs.textAlign) ? 'CENTER' : /right|end/.test(bcs.textAlign) ? 'RIGHT' : /justify/.test(bcs.textAlign) ? 'JUSTIFIED' : 'LEFT'
    const rec = {
      k: 't', x: left + sx, y: first.top - (lh - rectH) / 2 + sy, w: right - left, h: lines.length * lh,
      lines: lines.length, lh: R(lh), lhAuto, align,
      runs: runs.map((r) => ({ s: r.s, ...r.st })), z: zOf(bcs),
    }
    const trunc = bcs.textOverflow === 'ellipsis' && bcs.overflowX !== 'visible'
    if (trunc) {
      const br = block.getBoundingClientRect()
      const pl = parseFloat(bcs.paddingLeft) || 0, pr = parseFloat(bcs.paddingRight) || 0
      rec.x = br.left + pl + sx
      rec.w = br.width - pl - pr
      rec.trunc = true
      rec.lines = 1
    }
    const role = roleOf(block)
    if (role) rec.st = role
    rec.x = R(rec.x); rec.y = R(rec.y); rec.w = R(rec.w); rec.h = R(rec.h)
    return rec
  }

  /* ---------- SVG ---------- */
  function svgRecord(el, r, cs) {
    const clone = el.cloneNode(true)
    const src = [el, ...el.querySelectorAll('*')]
    const dst = [clone, ...clone.querySelectorAll('*')]
    src.forEach((s, i) => {
      const c = getComputedStyle(s)
      const d = dst[i]
      for (const p of ['fill', 'stroke']) {
        const v = c[p]
        if (!v || v === 'none') { d.setAttribute(p, 'none'); continue }
        const col = parseColor(v)
        if (col) { d.setAttribute(p, hex(col)); if (col[3] < 1) d.setAttribute(p + '-opacity', R(col[3])) }
      }
      if (c.stroke && c.stroke !== 'none' && c.strokeWidth) d.setAttribute('stroke-width', parseFloat(c.strokeWidth))
      const o = parseFloat(c.opacity)
      if (o < 1) d.setAttribute('opacity', o)
      d.removeAttribute('class'); d.removeAttribute('style'); d.removeAttribute('aria-hidden'); d.removeAttribute('role'); d.removeAttribute('aria-label')
    })
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', R(r.width))
    clone.setAttribute('height', R(r.height))
    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${R(r.width)} ${R(r.height)}`)
    return { k: 's', n: el.getAttribute('aria-label') ? 'Логотип mouren' : 'Иконка', svg: clone.outerHTML, x: r.left + sx, y: r.top + sy, w: R(r.width), h: R(r.height), z: zOf(cs) }
  }

  /* ---------- обход ---------- */
  function rebase(rec, abs) { rec.x = R(rec.x - abs.x); rec.y = R(rec.y - abs.y); return rec }

  function walk(el, parent, abs) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return
    if (parseFloat(cs.opacity) < 0.01) return
    if (mode === 'page' && cs.position === 'fixed') return
    const tag = el.tagName
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|BR)$/.test(tag)) return
    const r = el.getBoundingClientRect()
    if (mode === 'viewport' && (r.bottom < -40 || r.top > vh + 40)) return
    const X = r.left + sx, Y = r.top + sy

    if (transformKind(cs) === 'complex' || (tag === 'INPUT' && /checkbox|radio/.test(el.type))) {
      if (r.width < 1 || r.height < 1) return
      const id = 'c' + (rid++)
      el.setAttribute('data-capid', id)
      rasters.push(id)
      parent.ch.push(rebase({ k: 'r', id, n: nameOf(el), x: X, y: Y, w: R(r.width), h: R(r.height), z: zOf(cs) }, abs))
      return
    }
    if (tag.toLowerCase() === 'svg') { if (r.width > 0 && r.height > 0) parent.ch.push(rebase(svgRecord(el, r, cs), abs)); return }
    if (tag === 'IMG') {
      if (r.width < 1 || r.height < 1) return
      const bs = boxStyle(cs, r)
      const src = new URL(el.currentSrc || el.src).pathname.split('/').pop()
      parent.ch.push(rebase({ k: 'i', n: el.alt || 'Фото', src, fit: cs.objectFit, x: X, y: Y, w: R(r.width), h: R(r.height), rad: bs.rad, op: bs.op, blend: bs.blend, z: zOf(cs) }, abs))
      return
    }

    const bs = boxStyle(cs, r)
    const overflowing = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
    if (bs.clip && !(overflowing || bs.rad)) delete bs.clip
    const structural = /^(SECTION|HEADER|FOOTER|MAIN|NAV)$/.test(tag) || el.id === 'menu'
    let rec = parent, a = abs
    if ((isVisual(bs) || structural || bs.clip || markEls.has(el)) && r.width > 0 && r.height > 0) {
      rec = rebase({ k: 'f', n: nameOf(el), x: X, y: Y, w: R(r.width), h: R(r.height), ...bs, z: zOf(cs), ch: [] }, abs)
      if (markEls.has(el)) rec.comp = markEls.get(el)
      parent.ch.push(rec)
      a = { x: X, y: Y }
    }

    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const val = el.value || el.placeholder
      if (!val) return
      const ph = !el.value
      const st = getComputedStyle(el, ph ? '::placeholder' : null)
      const pl = parseFloat(cs.paddingLeft) || 0, pt = parseFloat(cs.paddingTop) || 0
      const lh = cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.25 : parseFloat(cs.lineHeight)
      const single = tag === 'INPUT'
      const t = {
        k: 't', x: X + pl, y: single ? Y + (r.height - lh) / 2 : Y + pt, w: r.width - pl * 2, h: lh, lines: single ? 1 : 2, lh: R(lh), lhAuto: false, align: 'LEFT', trunc: single,
        runs: [{ s: val, f: parseInt(cs.fontWeight, 10) || 400, z: parseFloat(cs.fontSize), c: rc(parseColor(st.color) || [0, 0, 0, 0.5]), ls: 0, up: false, it: false, dec: '', ff: 'Golos Text' }], z: zOf(cs),
      }
      rec.ch.push(rebase(t, a))
      return
    }

    const kids = [...el.children]
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim()) || (kids.length && el.textContent.trim())
    if (hasText && kids.every(inlineOk) && el.textContent.trim()) {
      const t = textRecord(el, null)
      if (t) rec.ch.push(rebase(t, a))
      return
    }
    for (const n of el.childNodes) {
      if (n.nodeType === 1) walk(n, rec, a)
      else if (n.nodeType === 3 && n.data.trim()) {
        const t = textRecord(el, [n])
        if (t) rec.ch.push(rebase(t, a))
      }
    }
  }

  let rootEl = document.body
  let rootRec
  if (opts.only) {
    rootEl = document.querySelector(opts.only)
    const r = rootEl.getBoundingClientRect()
    const cs = getComputedStyle(rootEl)
    rootRec = { k: 'f', n: opts.name, x: 0, y: 0, w: R(r.width), h: R(r.height), ...boxStyle(cs, r), ch: [] }
    delete rootRec.op
    const abs = { x: r.left + sx, y: r.top + sy }
    for (const n of rootEl.children) walk(n, rootRec, abs)
  } else {
    const H = mode === 'page' ? document.documentElement.scrollHeight : vh
    const bg = parseColor(getComputedStyle(document.body).backgroundColor) || [1, 1, 1, 1]
    rootRec = { k: 'f', n: opts.name, x: 0, y: 0, w: vw, h: H, fill: rc(bg), clip: true, ch: [] }
    for (const n of document.body.children) walk(n, rootRec, { x: 0, y: 0 })
  }
  return { root: rootRec, rasters }
}
