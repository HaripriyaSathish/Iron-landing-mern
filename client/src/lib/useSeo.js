import { useEffect } from 'react'
import api from './api'

function setMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) return tag?.remove()
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!href) return
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = rel
    document.head.appendChild(tag)
  }
  tag.removeAttribute('type')
  tag.href = href
}

export const applyFavicon = (url) => setLink('icon', url)

// Website and admin panel share the favicon uploaded in Search & Branding
export function useSiteFavicon() {
  useEffect(() => {
    api
      .get('/seo')
      .then(({ data: { data: seo } }) => applyFavicon(seo.favicon_url))
      .catch(() => {})
  }, [])
}

// Applies the admin-managed title, meta tags and favicon to the page head (in the visitor's language)
export default function useSeo(lang) {
  useEffect(() => {
    api
      .get('/seo', { params: { lang } })
      .then(({ data: { data: seo } }) => {
        document.title = seo.site_title
        setMeta('name', 'description', seo.meta_description)
        setMeta('name', 'keywords', seo.meta_keywords)
        setMeta('property', 'og:title', seo.og_title || seo.site_title)
        setMeta('property', 'og:description', seo.og_description || seo.meta_description)
        setMeta('property', 'og:image', seo.og_image_url)
        setMeta('property', 'og:type', 'website')
        setLink('icon', seo.favicon_url)
        setLink('canonical', seo.canonical_url)
      })
      .catch(() => {})
  }, [lang])
}
