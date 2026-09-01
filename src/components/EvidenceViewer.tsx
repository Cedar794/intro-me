import { useEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { EvidencePresentationItem } from '../data/evidencePresentation'
import { EvidenceGallery } from './EvidenceGallery'

type EvidenceViewerProps = {
  item: EvidencePresentationItem
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function EvidenceViewer({
  item,
  onClose,
  returnFocusRef,
}: EvidenceViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreFrameRef = useRef<number | null>(null)
  const label = `证据 ${item.number}：${item.group.assets[0].caption}`

  useEffect(() => {
    if (
      restoreFrameRef.current !== null
      && typeof window.cancelAnimationFrame === 'function'
    ) {
      window.cancelAnimationFrame(restoreFrameRef.current)
      restoreFrameRef.current = null
    }

    const viewer = viewerRef.current
    const returnFocus = returnFocusRef.current
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !viewer) {
        return
      }

      const focusable = Array.from(
        viewer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled'))
      if (focusable.length === 0) {
        event.preventDefault()
        viewer.focus()
        return
      }

      const first = focusable[0]
      const last = focusable.at(-1)!
      const active = document.activeElement
      if (event.shiftKey && (active === first || !viewer.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !viewer.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = priorOverflow
      document.removeEventListener('keydown', onKeyDown)
      const restoreFocus = () => returnFocus?.focus()
      if (typeof window.requestAnimationFrame === 'function') {
        const frame = window.requestAnimationFrame(() => {
          if (restoreFrameRef.current === frame) {
            restoreFrameRef.current = null
          }
          restoreFocus()
        })
        restoreFrameRef.current = frame
      } else {
        restoreFocus()
      }
    }
  }, [onClose, returnFocusRef])

  return createPortal(
    <div
      aria-label={label}
      aria-modal="true"
      className="evidence-viewer"
      data-evidence-viewer
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      ref={viewerRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="evidence-viewer-content">
        <header className="evidence-viewer-header">
          <button
            className="evidence-viewer-return"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            返回简历
          </button>
          <p className="evidence-viewer-title">{label}</p>
        </header>
        <EvidenceGallery eager group={item.group} variant="viewer" />
      </div>
    </div>,
    document.body,
  )
}
