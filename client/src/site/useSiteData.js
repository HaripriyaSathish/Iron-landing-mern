import { useEffect, useState } from 'react'
import api from '../lib/api'

// One request per section, all in parallel. A failed section is simply left out of the page.
const ENDPOINTS = {
  navbar: '/navbar',
  quickContacts: '/quick-contacts',
  hero: '/hero',
  about: '/about',
  services: '/services',
  why: '/why-us',
  how: '/how-it-works',
  testimonials: '/testimonials',
  contact: '/contact',
  footer: '/footer',
}

export default function useSiteData() {
  const [data, setData] = useState({})

  useEffect(() => {
    Object.entries(ENDPOINTS).forEach(([key, url]) => {
      api
        .get(url)
        .then((res) => setData((d) => ({ ...d, [key]: res.data.data })))
        .catch(() => {})
    })
  }, [])

  return data
}
