import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CONFIG, rub, perDay } from '../config.js'
import { Shield } from '../components/ui.jsx'

const RULES = {
  name: (v) => (v.trim() ? '' : 'Укажите имя'),
  phone: (v) => { const d = v.replace(/\D/g, ''); return d.length >= 10 && d.length <= 12 ? '' : 'Укажите телефон: 10–11 цифр' },
  email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Проверьте адрес почты'),
  address: (v) => (v.trim().length >= 5 ? '' : 'Укажите город и адрес доставки'),
}

export function OrderSheet({ open, onClose, planId, setPlanId, promo }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', promo: promo || '', consent: false })
  const [err, setErr] = useState({})
  const [step, setStep] = useState('form')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState('')
  const first = useRef(null)
  const p = CONFIG.plans.find((x) => x.id === planId)

  useEffect(() => {
    if (!open) return
    setStep('form'); setCopied('')
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => first.current && first.current.focus(), 250)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = '' }
  }, [open, onClose])

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [k]: v })
    if (err[k]) setErr({ ...err, [k]: RULES[k] ? RULES[k](v) : '' })
  }
  const text = () => [
    'Заказ mouren', `Тариф: ${p.title} — ${rub(p.price)} ${p.unit}`, `Имя: ${form.name}`, `Телефон: ${form.phone}`,
    form.email && `Email: ${form.email}`, `Адрес: ${form.address}`, form.promo && `Промокод: ${form.promo}`,
  ].filter(Boolean).join('\n').replace(/ /g, ' ')

  async function submit(e) {
    e.preventDefault()
    const next = Object.fromEntries(Object.keys(RULES).map((k) => [k, RULES[k](form[k])]))
    if (!form.consent) next.consent = 'Нужно согласие на обработку данных'
    setErr(next)
    const bad = Object.keys(next).find((k) => next[k])
    if (bad) { document.getElementById(`o-${bad}`)?.focus(); return }
    if (!CONFIG.orderEndpoint) { setStep('manual'); return }
    setSending(true)
    try {
      const r = await fetch(CONFIG.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, plan: p.id, planTitle: p.title, price: p.price, currency: 'RUB', page: location.href, createdAt: new Date().toISOString() }) })
      if (!r.ok) throw new Error(r.status)
      setStep('sent')
    } catch { setStep('manual') } finally { setSending(false) }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(text()); setCopied('Скопировано') }
    catch { document.getElementById('o-copy')?.select(); setCopied('Текст выделен — скопируйте вручную') }
  }
  const C = CONFIG.contacts
  const field = (k, label, props = {}) => (
    <label className="flex flex-col gap-1.5" htmlFor={`o-${k}`}>
      <span className="text-[14px] font-medium text-black/70">{label}</span>
      {props.as === 'textarea'
        ? <textarea id={`o-${k}`} rows={2} value={form[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? `o-${k}-e` : undefined} className="min-h-[72px] rounded-[16px] border border-wine/15 bg-white px-4 py-3 text-[16px] outline-none focus:border-wine" />
        : <input id={`o-${k}`} ref={k === 'name' ? first : undefined} value={form[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? `o-${k}-e` : undefined} className="h-[52px] rounded-[16px] border border-wine/15 bg-white px-4 text-[16px] outline-none focus:border-wine" {...props} />}
      {err[k] && <span id={`o-${k}-e`} className="text-[13px] text-red-700">{err[k]}</span>}
    </label>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-sm md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="order-title" className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[28px] bg-blush-soft p-6 pb-[max(24px,env(safe-area-inset-bottom))] md:max-w-[520px] md:rounded-[28px] md:p-8"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
            <div className="flex items-center justify-between gap-4">
              <h2 id="order-title" className="text-[26px] font-bold tracking-[-0.03em]">{step === 'form' ? 'Оформление' : step === 'sent' ? 'Заказ принят' : 'Заявка готова'}</h2>
              <button type="button" onClick={onClose} aria-label="Закрыть" className="grid size-10 place-items-center rounded-full border border-wine/15 text-[22px] text-wine cursor-pointer">×</button>
            </div>
            {step === 'form' && (
              <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
                <div className="grid gap-2" role="radiogroup" aria-label="Тариф">
                  {CONFIG.plans.map((x) => (
                    <label key={x.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-[16px] border p-3.5 ${x.id === planId ? 'border-wine bg-white' : 'border-wine/12 bg-white/60'}`}>
                      <span className="flex items-center gap-3"><input type="radio" name="o-plan" checked={x.id === planId} onChange={() => setPlanId(x.id)} className="size-4 accent-[#471D1F]" /><span className="text-[15px] font-semibold">{x.title}</span></span>
                      <span className="tnum text-[14px] text-black/60">{rub(perDay(x))}/день</span>
                    </label>
                  ))}
                </div>
                {field('name', 'Имя', { autoComplete: 'given-name' })}
                {field('phone', 'Телефон', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '+7 900 000-00-00' })}
                {field('email', 'Email — для чека и трека', { type: 'email', autoComplete: 'email' })}
                {field('address', 'Город и адрес доставки', { as: 'textarea' })}
                {field('promo', 'Промокод', { autoComplete: 'off' })}
                <label className="flex cursor-pointer gap-3 text-[13.5px] text-black/65" htmlFor="o-consent">
                  <input id="o-consent" type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-0.5 size-5 shrink-0 accent-[#471D1F]" aria-invalid={!!err.consent} />
                  <span>Согласна на обработку персональных данных{CONFIG.legal.privacyUrl && <> — <a href={CONFIG.legal.privacyUrl} className="underline">политика</a></>}</span>
                </label>
                {err.consent && <span className="-mt-2 text-[13px] text-red-700">{err.consent}</span>}
                <button type="submit" disabled={sending} className="btn btn-wine w-full disabled:opacity-60">{sending ? 'Отправляем…' : `Оформить — ${rub(p.price)}`}</button>
                <p className="flex items-center justify-center gap-2 text-center text-[13px] text-black/55"><Shield className="size-4" />Гарантия пустой тубы · {p.guaranteeDays} дней · доставка 0 ₽</p>
              </form>
            )}
            {step === 'sent' && (
              <div className="mt-5 flex flex-col gap-4"><p className="text-[16px] leading-relaxed text-black/70">Мы свяжемся с вами, чтобы подтвердить заказ и оплату.</p><button type="button" onClick={onClose} className="btn btn-wine">Готово</button></div>
            )}
            {step === 'manual' && (
              <div className="mt-5 flex flex-col gap-3">
                <p className="text-[15.5px] leading-relaxed text-black/70">{C.telegram || C.email || C.phone ? 'Отправьте эту заявку нам удобным способом — подтвердим заказ и оплату.' : 'Приём заказов через сайт ещё не подключён. Сохраните текст заявки.'}</p>
                <textarea id="o-copy" readOnly rows={7} value={text()} className="rounded-[16px] border border-wine/15 bg-white p-4 text-[14px] leading-relaxed" aria-label="Текст заявки" />
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={copy} className="btn btn-wine min-h-[50px]">Скопировать</button>
                  {C.telegram && <a className="font-semibold text-wine underline" href={`https://t.me/${C.telegram.replace('@', '')}`}>Telegram</a>}
                  {C.email && <a className="font-semibold text-wine underline" href={`mailto:${C.email}?subject=${encodeURIComponent('Заказ mouren')}&body=${encodeURIComponent(text())}`}>Отправить письмо</a>}
                </div>
                <p className="text-[13px] text-black/55" aria-live="polite">{copied}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
