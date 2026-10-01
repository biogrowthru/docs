import { useCallback, useMemo, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { CONFIG } from './config.js'
import { SmoothScroll } from './components/SmoothScroll.jsx'
import { PromoBar, Header, Hero, Stats } from './sections/Top.jsx'
import { Pains, Bridge, Replace, Why, Ritual } from './sections/Story.jsx'
import { Directions, Timeline, SelfProof, Label, Compare } from './sections/Proof.jsx'
import { Plans, FitCheck, Faq, FinalCta, Footer, StickyBar } from './sections/Offer.jsx'
import { OrderSheet } from './sections/Order.jsx'

export default function App() {
  const params = useMemo(() => new URLSearchParams(location.search), [])
  const promo = (params.get('promo') || '').trim().slice(0, 32)
  const angle = params.get('angle') || ''
  const [planId, setPlanId] = useState(CONFIG.defaultPlan)
  const [open, setOpen] = useState(false)
  const order = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <PromoBar promo={promo} />
      <Header onOrder={order} />
      <main>
        <Hero onOrder={order} angle={angle} />
        <Stats />
        <Pains />
        <Bridge />
        <Replace onOrder={order} />
        <Why />
        <Timeline onOrder={order} />
        <Directions />
        <Ritual />
        <SelfProof />
        <Label />
        <Compare />
        <Plans planId={planId} setPlanId={setPlanId} onOrder={order} />
        <FitCheck onOrder={order} />
        <Faq />
        <FinalCta onOrder={order} />
      </main>
      <Footer />
      <StickyBar planId={planId} onOrder={order} />
      <OrderSheet open={open} onClose={close} planId={planId} setPlanId={setPlanId} promo={promo} />
    </MotionConfig>
  )
}
