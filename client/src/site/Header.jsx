import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

// Highlights the menu link of the section currently on screen. Checked on scroll (not observed once)
// because sections appear one by one as their data arrives.
function useActiveSection(targets) {
  const [active, setActive] = useState(null)
  const key = targets.join('|')

  useEffect(() => {
    const ids = key.split('|').filter((t) => /^#[\w-]+$/.test(t))
    let frame = 0
    const check = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current = ids[0] ?? null
      for (const id of ids) {
        const el = document.querySelector(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [key])

  return active
}

// Switches the header to the ☰ menu on narrow screens, and also whenever the menu doesn't fit on one
// line (longer words, e.g. in Tamil). Set as a data attribute, which React leaves alone between renders.
function useCompactHeader(ref, contentKey) {
  useLayoutEffect(() => {
    const header = ref.current
    const inner = header?.querySelector('.header__inner')
    if (!inner) return
    const update = () => {
      // Measure the full one-line layout, then decide (all before the browser paints).
      // Transitions are off meanwhile and the final state is applied before they come back on.
      header.dataset.measuring = ''
      delete header.dataset.compact
      const tooWide = inner.scrollWidth > inner.clientWidth + 1
      if (tooWide || window.innerWidth <= 980) header.dataset.compact = ''
      void inner.offsetWidth
      delete header.dataset.measuring
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [ref, contentKey])
}

export default function Header({ navbar, language }) {
  const [open, setOpen] = useState(false)
  const links = navbar?.links ?? []
  const settings = navbar?.settings
  const active = useActiveSection(links.map((l) => l.target))
  const headerRef = useRef(null)
  useCompactHeader(headerRef, [...links.map((l) => l.label), settings?.cta_text, language.current?.code].join('|'))

  // Lock page scroll while the phone menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header ref={headerRef} className={`header ${open ? 'is-open' : ''}`}>
      <div className="container header__inner">
        <a href="#home" className="header__logo" onClick={() => setOpen(false)}>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.logo_alt || 'Iron Me Ka'} />
          ) : (
            <span className="header__logo-text">Iron Me Ka</span>
          )}
        </a>

        <nav className="header__nav" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.target}
              className={active === link.target ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {settings?.cta_text && (
            <a href={settings.cta_link} className="site-btn site-btn--primary header__cta-mobile" onClick={() => setOpen(false)}>
              {settings.cta_text}
            </a>
          )}
        </nav>

        {settings?.cta_text && (
          <a href={settings.cta_link} className="site-btn site-btn--primary header__cta">
            {settings.cta_text}
          </a>
        )}

        <LanguageSwitcher languages={language.languages} current={language.current} onChange={language.choose} />

        <button
          type="button"
          className="header__toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
