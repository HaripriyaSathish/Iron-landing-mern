import { useRef } from 'react'
import useSeo from '../lib/useSeo'
import useScrollReveal from '../site/useScrollReveal'
import useSiteData from '../site/useSiteData'
import useLanguage from '../site/useLanguage'
import Header from '../site/Header'
import Hero from '../site/Hero'
import About from '../site/About'
import Services from '../site/Services'
import WhyUs from '../site/WhyUs'
import HowItWorks from '../site/HowItWorks'
import Testimonials from '../site/Testimonials'
import Contact from '../site/Contact'
import Footer from '../site/Footer'
import FloatingContacts from '../site/FloatingContacts'
import '../site/site.css'

export default function Home() {
  const language = useLanguage()
  useSeo(language.lang)
  const data = useSiteData(language.lang)
  const rootRef = useRef(null)
  useScrollReveal(rootRef)

  return (
    <div className="site" ref={rootRef}>
      <Header navbar={data.navbar} language={language} />
      <main>
        <Hero slides={data.hero} />
        <About data={data.about} />
        <Services data={data.services} />
        <WhyUs data={data.why} />
        <HowItWorks data={data.how} />
        <Testimonials data={data.testimonials} />
        <Contact data={data.contact} labels={data.ui} />
      </main>
      <Footer data={data.footer} />
      <FloatingContacts contacts={data.quickContacts} />
    </div>
  )
}
