import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ImageOff, LayoutDashboard } from 'lucide-react'
import api from '../../lib/api'
import sections from '../sections'
import { useAuth } from '../AuthContext'
import { PageHeader } from '../components/ui'

const ENDPOINTS = {
  '/admin/branding': '/seo',
  '/admin/menu': '/navbar/admin',
  '/admin/quick-connect': '/quick-contacts/admin',
  '/admin/slider': '/hero/admin',
  '/admin/story': '/about/admin',
  '/admin/services': '/services/admin',
  '/admin/promise': '/why-us/admin',
  '/admin/process': '/how-it-works/admin',
  '/admin/reviews': '/testimonials/admin',
  '/admin/contact': '/contact',
  '/admin/footer': '/footer/admin',
}

// One short status line per section card
function summarize(path, data) {
  if (!data) return null
  switch (path) {
    case '/admin/branding':
      return { text: data.favicon_url ? 'Favicon is set' : 'Favicon not uploaded yet', warn: !data.favicon_url }
    case '/admin/menu':
      return { text: `${data.links.filter((l) => l.is_active).length} menu links live` }
    case '/admin/quick-connect':
      return { text: `${data.filter((c) => c.is_active).length} buttons showing` }
    case '/admin/slider': {
      const missing = data.filter((s) => !s.image_url).length
      return {
        text: missing ? `${missing} of ${data.length} slides need an image` : `${data.length} slides ready`,
        warn: missing > 0,
      }
    }
    case '/admin/story':
      return data.section.image_url
        ? { text: `${data.highlights.filter((h) => h.is_active).length} highlights showing` }
        : { text: 'Story photo not uploaded yet', warn: true }
    case '/admin/services': {
      const missing = data.services.filter((s) => !s.image_url).length
      return missing
        ? { text: `${missing} of ${data.services.length} services need a photo`, warn: true }
        : { text: `${data.services.filter((s) => s.is_active).length} services live` }
    }
    case '/admin/promise':
      return { text: `${data.features.filter((f) => f.is_active).length} reasons showing` }
    case '/admin/process':
      return { text: `${data.steps.filter((s) => s.is_active).length} steps showing` }
    case '/admin/reviews':
      return { text: `${data.testimonials.filter((t) => t.is_active).length} reviews showing` }
    case '/admin/contact':
      return data.phone ? { text: `Calls go to ${data.phone}` } : { text: 'Phone number not set', warn: true }
    case '/admin/footer': {
      // Seeded links point at the platform home pages, not a real profile
      const generic = data.socials.filter((s) => /^https?:\/\/(www\.)?[^/]+\/?$/.test(s.url)).length
      return generic
        ? { text: `${generic} social links need your profile address`, warn: true }
        : { text: `${data.socials.filter((s) => s.is_active).length} social links live` }
    }
    default:
      return null
  }
}

export default function Overview() {
  const { admin } = useAuth()
  const [stats, setStats] = useState({})

  useEffect(() => {
    Object.entries(ENDPOINTS).forEach(([path, url]) => {
      api
        .get(url)
        .then((res) => setStats((s) => ({ ...s, [path]: summarize(path, res.data.data) })))
        .catch(() => {})
    })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title={`${greeting}, ${admin.name}`}
        subtitle="Pick a part of your website to refresh. Changes go live as soon as you save."
      />

      <div className="tiles">
        {sections
          .filter((s) => !s.end)
          .map(({ path, icon: Icon, title, hint }) => {
            const stat = stats[path]
            return (
              <Link key={path} to={path} className="tile">
                <span className="tile__icon">
                  <Icon size={24} />
                </span>
                <h3>{title}</h3>
                <p>{hint}</p>
                <span className={`tile__stat ${stat?.warn ? 'is-warn' : ''}`}>
                  {stat?.warn && <ImageOff size={14} />}
                  {stat ? stat.text : 'Loading…'}
                </span>
                <ArrowRight size={18} className="tile__arrow" />
              </Link>
            )
          })}
      </div>
    </>
  )
}
