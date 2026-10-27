import { useRef } from 'react'
import useSeo from '../lib/useSeo'
import useScrollReveal from '../site/useScrollReveal'
import useSiteData from '../site/useSiteData'
import useLanguage from '../site/useLanguage'
import Header from '../site/Header'
import Hero from '../site/Hero'
import Ticker from '../site/Ticker'
import About from '../site/About'
import Services from '../site/Services'
import Specialties from '../site/Specialties'
import WhyUs from '../site/WhyUs'
import HowItWorks from '../site/HowItWorks'
import Testimonials from '../site/Testimonials'
import Contact from '../site/Contact'
import Footer from '../site/Footer'
import FloatingContacts from '../site/FloatingContacts'
import MusicPlayer from '../site/MusicPlayer'
import OfferBar from '../site/OfferBar'
import '../site/site.css'

export default function Home() {
  const language = useLanguage()
  useSeo(language.lang)
  const data = useSiteData(language.lang)
  const rootRef = useRef(null)
  useScrollReveal(rootRef)

  return (
    <div className="site" ref={rootRef}>
      <OfferBar offer={data.offer} />
      <Header navbar={data.navbar} language={language} />
      <main>
        <Hero slides={data.hero} />
        <Ticker items={data.ticker} />
        <About data={data.about} />
        <Services data={data.services} />
        <Specialties blocks={data.specialties} />
        <WhyUs data={data.why} />
        <HowItWorks data={data.how} />
        <Testimonials data={data.testimonials} />
        <Contact data={data.contact} labels={data.ui} />
      </main>
      <Footer data={data.footer} />
      <FloatingContacts contacts={data.quickContacts} />
      <MusicPlayer music={data.music} labels={data.ui} />
    </div>
  )
}
