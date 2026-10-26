import { useEffect, useState } from 'react'
import api from '../lib/api'

const STORAGE_KEY = 'imk_lang'

// Remembered choice, or a shared link like /?lang=ta
function initialChoice() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl) return fromUrl
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// The visitor's website language. `lang` is what the API is asked for: nothing means the main language.
export default function useLanguage() {
  const [languages, setLanguages] = useState([])
  const [chosen, setChosen] = useState(initialChoice)

  useEffect(() => {
    api
      .get('/languages')
      .then((res) => setLanguages(res.data.data))
      .catch(() => {})
  }, [])

  const main = languages.find((l) => l.is_default)
  const current = languages.find((l) => l.code === chosen) ?? main
  // Until the list arrives, trust the remembered code so a returning visitor's page loads once, already translated
  const lang = languages.length ? (current && !current.is_default ? current.code : undefined) : chosen || undefined

  useEffect(() => {
    document.documentElement.lang = lang || main?.code || 'en'
  }, [lang, main])

  const choose = (code) => {
    const isMain = code === main?.code
    setChosen(isMain ? null : code)
    try {
      if (isMain) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // Private mode: the choice just isn't remembered
    }
  }

  return { languages, current, lang, choose }
}
