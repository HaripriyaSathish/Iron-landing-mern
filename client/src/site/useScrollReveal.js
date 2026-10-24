import { useEffect } from 'react'

// Elements marked data-reveal="up|left|right|zoom" animate in the first time they scroll into view.
// A plain position check on scroll (not IntersectionObserver), so it works in every browser state.
// Sections arrive one by one as their data loads, so new elements are picked up as they appear.
// Content is only hidden once this runs (the `reveal-ready` class), so it never stays invisible without JS.
export default function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // A short timer (not requestAnimationFrame) batches scroll events and still runs in background/throttled tabs
    let timer = 0
    const check = () => {
      timer = 0
      // Reveal once the element's top passes 88% of the screen height
      const line = window.innerHeight * 0.88
      root.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => {
        if (el.getBoundingClientRect().top < line) el.classList.add('is-revealed')
      })
    }
    const schedule = () => {
      if (!timer) timer = setTimeout(check, 60)
    }

    root.classList.add('reveal-ready')
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const mo = new MutationObserver(schedule)
    mo.observe(root, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mo.disconnect()
      clearTimeout(timer)
    }
  }, [rootRef])
}

// Stagger for grid items: restarts every `perRow` items so later rows don't wait
export const revealDelay = (index, perRow = 4, step = 110) => ({ '--reveal-delay': `${(index % perRow) * step}ms` })
