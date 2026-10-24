import { useEffect, useMemo, useState } from 'react'
import { Globe, Save, Sparkles } from 'lucide-react'
import api, { errorMessage, toFormData } from '../../lib/api'
import { applyFavicon } from '../../lib/useSeo'
import { useToast } from '../components/Toast'
import { Button, Card, Field, ImageUpload, PageHeader, PageLoader } from '../components/ui'

const TEXT_FIELDS = ['site_title', 'meta_description', 'meta_keywords', 'og_title', 'og_description', 'canonical_url']
const emptyImage = { file: null, removed: false }

export default function BrandingPage() {
  const toast = useToast()
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [favicon, setFavicon] = useState(emptyImage)
  const [ogImage, setOgImage] = useState(emptyImage)
  const [saving, setSaving] = useState(false)

  const load = (data) => {
    setSaved(data)
    setForm(Object.fromEntries(TEXT_FIELDS.map((k) => [k, data[k] ?? ''])))
    setFavicon(emptyImage)
    setOgImage(emptyImage)
  }

  useEffect(() => {
    api
      .get('/seo')
      .then((res) => load(res.data.data))
      .catch((err) => toast(errorMessage(err), 'error'))
  }, [toast])

  const faviconPreview = useMemo(() => (favicon.file ? URL.createObjectURL(favicon.file) : null), [favicon.file])
  useEffect(() => () => faviconPreview && URL.revokeObjectURL(faviconPreview), [faviconPreview])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const keywords = form.meta_keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put(
        '/seo',
        toFormData({
          ...form,
          favicon: favicon.file || undefined,
          remove_favicon: favicon.removed || undefined,
          og_image: ogImage.file || undefined,
          remove_og_image: ogImage.removed || undefined,
        }),
      )
      load(res.data.data)
      applyFavicon(res.data.data.favicon_url)
      toast('Search & branding saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        icon={Sparkles}
        title="Search & Branding"
        subtitle="How Iron Me Ka shows up on Google, in browser tabs and when shared on WhatsApp."
        action={
          <Button type="submit" icon={Save} loading={saving}>
            Save changes
          </Button>
        }
      />

      <div className="grid-2">
        <div className="stack">
          <Card title="On Google" subtitle="The title and description people see in search results.">
            <Field
              label="Page title"
              count={form.site_title.length}
              max={60}
              hint="Shown in the browser tab and as the blue link on Google."
            >
              <input className="input" required value={form.site_title} onChange={set('site_title')} />
            </Field>
            <Field
              label="Description"
              count={form.meta_description.length}
              max={160}
              hint="One or two sentences that make people want to click."
            >
              <textarea
                className="input"
                rows={3}
                required
                value={form.meta_description}
                onChange={set('meta_description')}
              />
            </Field>
            <Field label="Keywords" hint="Separate with commas, e.g. saree care, steam ironing">
              <textarea className="input" rows={2} value={form.meta_keywords} onChange={set('meta_keywords')} />
            </Field>
            {keywords.length > 0 && (
              <div className="chips">
                {keywords.map((k) => (
                  <span key={k} className="chip">
                    {k}
                  </span>
                ))}
              </div>
            )}
            <Field label="Website address (optional)" hint="Your live domain, e.g. https://ironmeka.com">
              <input className="input" value={form.canonical_url} onChange={set('canonical_url')} />
            </Field>
          </Card>

          <Card title="When shared" subtitle="The preview card on WhatsApp, Facebook and Instagram.">
            <Field label="Share title" hint="Leave empty to use the page title.">
              <input className="input" value={form.og_title} onChange={set('og_title')} />
            </Field>
            <Field label="Share description" hint="Leave empty to use the description.">
              <textarea className="input" rows={2} value={form.og_description} onChange={set('og_description')} />
            </Field>
            <ImageUpload
              label="Upload share image"
              value={saved.og_image_url}
              file={ogImage.file}
              removed={ogImage.removed}
              onPick={(file) => setOgImage({ file, removed: false })}
              onRemove={() => setOgImage({ file: null, removed: true })}
              ratio="1.91 / 1"
              hint="Best size: 1200 × 630 px."
            />
          </Card>
        </div>

        <div className="stack">
          <Card title="Google preview" subtitle="Roughly how your listing will look.">
            <div className="serp">
              <div className="serp__site">
                <span className="serp__fav">
                  {faviconPreview || (saved.favicon_url && !favicon.removed) ? (
                    <img src={faviconPreview || saved.favicon_url} alt="" />
                  ) : (
                    <Globe size={14} />
                  )}
                </span>
                <span>{form.canonical_url || 'ironmeka.com'}</span>
              </div>
              <div className="serp__title">{form.site_title || 'Page title'}</div>
              <div className="serp__desc">{form.meta_description || 'Your description will appear here.'}</div>
            </div>
          </Card>

          <Card title="Favicon" subtitle="The little icon in the browser tab.">
            <ImageUpload
              label="Upload favicon"
              value={saved.favicon_url}
              file={favicon.file}
              removed={favicon.removed}
              onPick={(file) => setFavicon({ file, removed: false })}
              onRemove={() => setFavicon({ file: null, removed: true })}
              ratio="1 / 1"
              hint="Square image, at least 64 × 64 px. PNG or SVG works best."
            />
          </Card>
        </div>
      </div>
    </form>
  )
}
