import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ICONS } from '../../lib/icons'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, X } from 'lucide-react'

export function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <header className="page-header">
      <div className="page-header__icon">
        <Icon size={26} />
      </div>
      <div className="page-header__text">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}

export function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="card__head">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, count, max, children }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {max && (
          <span className={`field__count ${count > max ? 'is-over' : ''}`}>
            {count}/{max}
          </span>
        )}
      </span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  )
}

export function Button({ children, variant = 'primary', loading, disabled, icon: Icon, ...props }) {
  return (
    <button className={`btn btn--${variant}`} disabled={loading || disabled} {...props}>
      {loading ? <Loader2 size={18} className="spin" /> : Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

export function IconButton({ icon: Icon, label, variant = '', ...props }) {
  return (
    <button type="button" className={`icon-btn ${variant}`} aria-label={label} title={label} {...props}>
      <Icon size={17} />
    </button>
  )
}

export function MoveButtons({ index, total, onMove }) {
  return (
    <div className="move-btns">
      <IconButton icon={ArrowUp} label="Move up" disabled={index === 0} onClick={() => onMove(index, -1)} />
      <IconButton icon={ArrowDown} label="Move down" disabled={index === total - 1} onClick={() => onMove(index, 1)} />
    </div>
  )
}

// value: saved image url; file: newly picked File; removed: user cleared the saved image
export function ImageUpload({ value, file, removed, onPick, onRemove, label = 'Upload image', ratio = '16 / 9', hint }) {
  const inputRef = useRef(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const src = preview || (!removed && value) || null

  return (
    <div className="upload">
      <div className="upload__box" style={{ aspectRatio: ratio }} onClick={() => inputRef.current?.click()}>
        {src ? (
          <img src={src} alt="" />
        ) : (
          <div className="upload__empty">
            <ImagePlus size={30} />
            <span>{label}</span>
            <small>JPG, PNG, WEBP or SVG · up to 5 MB</small>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) onPick(e.target.files[0])
          e.target.value = ''
        }}
      />
      <div className="upload__actions">
        <Button type="button" variant="ghost" icon={ImagePlus} onClick={() => inputRef.current?.click()}>
          {src ? 'Change' : 'Choose'}
        </Button>
        {src && (
          <Button type="button" variant="ghost-danger" icon={Trash2} onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  )
}

export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Portal to <body> so animated (transformed) page wrappers can't trap the fixed overlay
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <h2>{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({ title, message, confirmText = 'Delete', loading, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Keep it
          </Button>
          <Button variant="danger" icon={Trash2} loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
    </Modal>
  )
}

export function IconPicker({ value, onChange }) {
  return (
    <div className="icon-picker" role="radiogroup" aria-label="Choose an icon">
      {Object.entries(ICONS).map(([key, { component: Icon, label }]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          title={label}
          className={`icon-picker__opt ${value === key ? 'is-active' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      <Icon size={36} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Loader2 size={28} className="spin" />
    </div>
  )
}
