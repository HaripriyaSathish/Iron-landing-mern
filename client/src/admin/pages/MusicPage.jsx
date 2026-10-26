import { useEffect, useMemo, useRef, useState } from 'react'
import { Info, Music, Save, Trash2, Upload } from 'lucide-react'
import api, { errorMessage, toFormData } from '../../lib/api'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader, PageLoader, Toggle } from '../components/ui'

const ACCEPT = '.mp3,.mpeg,.m4a,.aac,.wav,.ogg,.mp4,.mov,.webm,audio/*,video/*'
const MAX_MB = 40

export default function MusicPage() {
  const toast = useToast()
  const inputRef = useRef(null)
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [file, setFile] = useState(null)
  const [removed, setRemoved] = useState(false)
  const [saving, setSaving] = useState(false)

  const apply = (data) => {
    setSaved(data)
    setForm({ enabled: !!data.enabled, title: data.title ?? '', volume: data.volume ?? 40, autostart: !!data.autostart })
    setFile(null)
    setRemoved(false)
  }

  useEffect(() => {
    api
      .get('/music/admin')
      .then((res) => apply(res.data.data))
      .catch((err) => toast(errorMessage(err), 'error'))
  }, [toast])

  // Plays the picked file before it is uploaded
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (!form) return <PageLoader />

  const src = preview || (!removed && saved.music_url) || null

  const pick = (picked) => {
    if (!picked) return
    if (picked.size > MAX_MB * 1024 * 1024) return toast(`That file is over ${MAX_MB} MB`, 'error')
    setFile(picked)
    setRemoved(false)
    // A new track with no name yet takes the file name
    if (!form.title) setForm((f) => ({ ...f, title: picked.name.replace(/\.[^.]+$/, '') }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put(
        '/music',
        toFormData({
          ...form,
          music: file || undefined,
          remove_music: removed || undefined,
          // Turning music on without a file is refused by the server, so removing it switches it off
          enabled: removed && !file ? false : form.enabled,
        }),
      )
      apply(res.data.data)
      toast(file ? 'Music uploaded and saved' : 'Music settings saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        icon={Music}
        title="Background Music"
        subtitle="A soft track that plays on your website, with a music button visitors can pause."
        action={
          <Button type="submit" icon={Save} loading={saving}>
            {file ? 'Upload & save' : 'Save changes'}
          </Button>
        }
      />

      <div className="grid-2">
        <Card title="Your music" subtitle={`MP3 works best. M4A, WAV or a video file (only its sound is used) also work, up to ${MAX_MB} MB.`}>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => {
              pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          {src ? (
            <div className="music-file">
              <span className="music-file__icon">
                <Music size={22} />
              </span>
              <div className="music-file__main">
                <strong>{file ? file.name : form.title || 'Uploaded music'}</strong>
                <small>{file ? 'Not uploaded yet: press Upload & save' : 'Playing on your website when switched on'}</small>
                <audio controls preload="none" src={src} />
              </div>
            </div>
          ) : (
            <button type="button" className="music-drop" onClick={() => inputRef.current?.click()}>
              <Upload size={28} />
              <span>Choose a music file</span>
              <small>MP3, M4A, WAV or video · up to {MAX_MB} MB</small>
            </button>
          )}
          <div className="upload__actions">
            <Button type="button" variant="ghost" icon={Upload} onClick={() => inputRef.current?.click()}>
              {src ? 'Change music' : 'Choose file'}
            </Button>
            {src && (
              <Button
                type="button"
                variant="ghost-danger"
                icon={Trash2}
                onClick={() => {
                  setFile(null)
                  setRemoved(!!saved.music_url)
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <Field label="Track name" hint="Shown to visitors when they point at the music button.">
            <input
              className="input"
              maxLength={120}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
        </Card>

        <Card title="How it plays">
          <div className="switch-row">
            <Toggle checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} label="Music on the website" />
            <span>Music on the website</span>
          </div>
          <p className="field__hint">Off hides the music button too.</p>

          <div className="switch-row mt">
            <Toggle
              checked={form.autostart}
              onChange={(v) => setForm({ ...form, autostart: v })}
              label="Start on the visitor's first tap"
            />
            <span>Start on the visitor's first tap</span>
          </div>
          <p className="field__hint">Off: music only plays when the visitor presses the music button.</p>

          <Field label={`Volume · ${form.volume}%`} hint="Keep it soft so it doesn't startle visitors. 30–50% is a good range.">
            <input
              type="range"
              className="music-volume"
              min={5}
              max={100}
              step={5}
              value={form.volume}
              onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })}
            />
          </Field>

          <p className="note">
            <Info size={16} />
            <span>
              Browsers never let a website play sound by itself the moment it opens. Your music starts as soon as the
              visitor taps or clicks anywhere, and the round music button lets them pause it. A visitor who pauses it
              won't hear it again on their next visit.
            </span>
          </p>
        </Card>
      </div>
    </form>
  )
}
