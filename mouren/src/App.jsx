import { useCallback, useMemo, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { CONFIG, productUrl } from './config.js'
import { SmoothScroll } from './components/SmoothScroll.jsx'
import { PromoBar, Header, Hero, Stats } from './sections/Top.jsx'
import { Pains, Bridge, Replace, Why, Ritual } from './sections/Story.jsx'
import { Directions, Timeline, Label, Compare } from './sections/Proof.jsx'
import { Science, Reviews } from './sections/Science.jsx'
import { Plans, FitCheck, Faq, FinalCta, Footer, StickyBar } from './sections/Offer.jsx'

// Порядок секций — по конверсии: обещание → доказательства → боль → механизм и деньги →
// результаты по неделям → отзывы → состав для скептиков → оффер и гарантия → возражения → финал
export default function App() {
  const params = useMemo(() => new URLSearchParams(location.search), [])
  const promo = (params.get('promo') || '').trim().slice(0, 32)
  const angle = params.get('angle') || ''
  const [planId, setPlanId] = useState(CONFIG.defaultPlan)
  const order = useCallback(() => { location.href = productUrl(planId) }, [planId])
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
        <Science />
        <Timeline onOrder={order} />
        <Reviews />
        <Why />
        <Directions />
        <Label />
        <Ritual />
        <Compare />
        <Plans planId={planId} setPlanId={setPlanId} onOrder={order} />
        <FitCheck onOrder={order} />
        <Faq />
        <FinalCta onOrder={order} />
      </main>
      <Footer />
      <StickyBar planId={planId} onOrder={order} />
    </MotionConfig>
  )
}
