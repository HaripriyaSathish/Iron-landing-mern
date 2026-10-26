import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'

// Globe button in the header; the menu lists each language in its own script (English, தமிழ், Français)
export default function LanguageSwitcher({ languages, current, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (languages.length < 2 || !current) return null

  return (
    <div className={`lang ${open ? 'is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="lang__btn"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.native_name}`}
      >
        <Globe size={17} />
        <span className="lang__current">{current.native_name}</span>
        <span className="lang__code">{current.code}</span>
        <ChevronDown size={15} className="lang__chevron" />
      </button>
      <ul className="lang__menu" role="listbox" aria-label="Choose language">
        {languages.map((l) => {
          const selected = l.code === current.code
          return (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                lang={l.code}
                className={selected ? 'is-active' : ''}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  onChange(l.code)
                  setOpen(false)
                }}
              >
                <span>{l.native_name}</span>
                {selected && <Check size={15} />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
