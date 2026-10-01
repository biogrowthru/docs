// Анимированные примитивы в духе React Bits, на motion/react
import { useEffect, useRef, useState } from 'react'
import {
  motion, useInView, useMotionValue, useSpring, useTransform, useScroll,
  useVelocity, useAnimationFrame, useReducedMotion, animate,
} from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

/* Заголовок, который проявляется по словам: блюр → резкость, снизу вверх */
export function BlurText({ text, as: Tag = 'span', className = '', delay = 0, stagger = 0.06, once = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const words = String(text).split(' ')
  const MotionTag = motion[Tag] || motion.span
  return (
    <MotionTag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={reduce ? false : { opacity: 0, y: '0.35em', filter: 'blur(10px)' }}
          animate={inView || reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
        >
          {w}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  )
}

/* Появление блока при скролле */
export function Reveal({ children, className = '', delay = 0, y = 28, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const M = motion[as] || motion.div
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  )
}

/* Число, которое досчитывает до значения, когда попадает в кадр */
export function CountUp({ to, from = 0, duration = 1.6, decimals = 0, className = '', suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const fmt = (v) => prefix + new Intl.NumberFormat('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v).replace(/\s/g, ' ') + suffix
  const [val, setVal] = useState(fmt(reduce ? to : from))
  useEffect(() => {
    if (!inView || reduce) { if (reduce) setVal(fmt(to)); return }
    const c = animate(from, to, { duration, ease: EASE, onUpdate: (v) => setVal(fmt(v)) })
    return () => c.stop()
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{val}</span>
}

/* Бегущая строка, которая ускоряется и наклоняется от скорости скролла */
function wrap(min, max, v) { const r = max - min; return ((((v - min) % r) + r) % r) + min }
export function VelocityMarquee({ children, baseVelocity = -2, className = '' }) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false })
  const skew = useTransform(smooth, [-2000, 2000], [8, -8])
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)
  const dir = useRef(1)
  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = dir.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1; else if (f > 0) dir.current = 1
    move += dir.current * move * f
    baseX.set(baseX.get() + move)
  })
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div className="inline-flex flex-nowrap" style={{ x, skewX: reduce ? 0 : skew }}>
        {[0, 1, 2, 3].map((i) => <span key={i} className="inline-flex shrink-0" aria-hidden={i > 0}>{children}</span>)}
      </motion.div>
    </div>
  )
}

/* Магнитная кнопка/ссылка: тянется за курсором */
export function Magnet({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 250, damping: 18 })
  const y = useSpring(0, { stiffness: 250, damping: 18 })
  const reduce = useReducedMotion()
  function onMove(e) {
    if (reduce || e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  return (
    <motion.div ref={ref} className={`inline-block ${className}`} style={{ x, y }} onPointerMove={onMove} onPointerLeave={() => { x.set(0); y.set(0) }}>
      {children}
    </motion.div>
  )
}

/* 3D-наклон за курсором (для упаковки) */
export function Tilt({ children, className = '', max = 10 }) {
  const ref = useRef(null)
  const rx = useSpring(0, { stiffness: 150, damping: 15 })
  const ry = useSpring(0, { stiffness: 150, damping: 15 })
  const reduce = useReducedMotion()
  function onMove(e) {
    if (reduce || e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max)
  }
  return (
    <motion.div ref={ref} className={className} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onPointerMove={onMove} onPointerLeave={() => { rx.set(0); ry.set(0) }}>
      {children}
    </motion.div>
  )
}

export { EASE }
