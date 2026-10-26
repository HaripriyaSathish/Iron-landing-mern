import { useEffect, useState } from 'react'
import api from '../lib/api'

// One request per section, all in parallel. A failed section is simply left out of the page.
const ENDPOINTS = {
  navbar: '/navbar',
  quickContacts: '/quick-contacts',
  hero: '/hero',
  about: '/about',
  services: '/services',
  specialties: '/specialties',
  why: '/why-us',
  how: '/how-it-works',
  testimonials: '/testimonials',
  contact: '/contact',
  footer: '/footer',
  ui: '/languages/ui',
  music: '/music',
}

// lang: language code, or undefined for the main language. Switching keeps the old texts on screen
// until the new ones arrive, so the page never blanks out.
export default function useSiteData(lang) {
  const [data, setData] = useState({})

  useEffect(() => {
    let stale = false
    Object.entries(ENDPOINTS).forEach(([key, url]) => {
      api
        .get(url, { params: { lang } })
        .then((res) => !stale && setData((d) => ({ ...d, [key]: res.data.data })))
        .catch(() => {})
    })
    // A slow answer for the previous language must not overwrite the new one
    return () => {
      stale = true
    }
  }, [lang])

  return data
}
