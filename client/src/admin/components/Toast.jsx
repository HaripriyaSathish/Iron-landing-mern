import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Check, X } from 'lucide-react'

const ToastContext = createContext(null)

// Successful saves get a centered popup; errors get a corner toast that stays a little longer
export function ToastProvider({ children }) {
  const [popup, setPopup] = useState(null)
  const [errors, setErrors] = useState([])
  const popupTimer = useRef(null)

  const dismissError = useCallback((id) => setErrors((list) => list.filter((t) => t.id !== id)), [])
  const closePopup = useCallback(() => {
    clearTimeout(popupTimer.current)
    setPopup(null)
  }, [])

  const show = useCallback(
    (message, type = 'success') => {
      if (type === 'error') {
        const id = Date.now() + Math.random()
        setErrors((list) => [...list, { id, message }])
        setTimeout(() => dismissError(id), 5000)
        return
      }
      clearTimeout(popupTimer.current)
      setPopup({ id: Date.now(), message })
      popupTimer.current = setTimeout(() => setPopup(null), 2200)
    },
    [dismissError],
  )

  useEffect(() => () => clearTimeout(popupTimer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {createPortal(
        <>
          {popup && (
            <div className="saved-backdrop" onClick={closePopup}>
              <div key={popup.id} className="saved-popup" role="status" aria-live="polite">
                <span className="saved-popup__check">
                  <Check size={34} strokeWidth={3} />
                </span>
                <h3>Done!</h3>
                <p>{popup.message}</p>
                <span className="saved-popup__bar" />
              </div>
            </div>
          )}
          <div className="toast-stack" role="alert" aria-live="assertive">
            {errors.map((t) => (
              <div key={t.id} className="toast toast--error">
                <AlertCircle size={18} />
                <span>{t.message}</span>
                <button type="button" onClick={() => dismissError(t.id)} aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
