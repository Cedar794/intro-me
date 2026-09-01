import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EvidenceAsset, EvidenceGroup } from '../data/evidence'
import {
  createEvidencePresentation,
  type EvidencePresentationItem,
} from '../data/evidencePresentation'
import type { ResumeDocumentData } from '../data/resumeTypes'
import { useEvidenceLayout } from '../hooks/useEvidenceLayout'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { EvidenceActivationHandler } from './EvidenceAnchor'
import { EvidenceCallout } from './EvidenceCallout'
import { EvidenceLeaderLines } from './EvidenceLeaderLines'
import { EvidenceViewer } from './EvidenceViewer'
import { ResumeDocument } from './ResumeDocument'

export const WIDE_EVIDENCE_QUERY = '(min-width: 1320px)'

type ResumeEvidenceCanvasProps = {
  document: ResumeDocumentData
  evidenceGroups: EvidenceGroup[]
  headerAssets: EvidenceAsset[]
}

export function ResumeEvidenceCanvas({
  document,
  evidenceGroups,
  headerAssets,
}: ResumeEvidenceCanvasProps) {
  const wide = useMediaQuery(WIDE_EVIDENCE_QUERY)
  const [selectedItem, setSelectedItem] = useState<EvidencePresentationItem | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const viewerTriggerRef = useRef<HTMLButtonElement>(null)
  const calloutElements = useRef(new Map<string, HTMLElement>())
  const registerCanvas = useCallback((element: HTMLDivElement | null) => {
    canvasRef.current = element
    sheetRef.current = element?.querySelector<HTMLElement>('[data-testid="resume-sheet"]') ?? null
  }, [])
  const registerElement = useCallback((groupId: string, element: HTMLElement | null) => {
    if (element) {
      calloutElements.current.set(groupId, element)
      return
    }

    calloutElements.current.delete(groupId)
  }, [])
  const effectiveGroups = useMemo(
    () => evidenceGroups.map((group) =>
      group.id === 'header-profiles' ? { ...group, assets: headerAssets } : group,
    ),
    [evidenceGroups, headerAssets],
  )
  const presentation = useMemo(
    () => createEvidencePresentation(effectiveGroups),
    [effectiveGroups],
  )
  const presentationById = useMemo(
    () => new Map(presentation.map((item) => [item.group.id, item])),
    [presentation],
  )
  const onEvidenceActivate = useCallback<EvidenceActivationHandler>(
    (groupId, trigger) => {
      const item = presentationById.get(groupId)
      if (!item) {
        return
      }

      if (wide) {
        calloutElements.current
          .get(groupId)
          ?.querySelector<HTMLAnchorElement>('.resume-evidence-link')
          ?.focus()
        return
      }

      viewerTriggerRef.current = trigger
      setSelectedItem(item)
    },
    [presentationById, wide],
  )
  const closeViewer = useCallback(() => setSelectedItem(null), [])

  useEffect(() => {
    if (wide) {
      setSelectedItem(null)
    }
  }, [wide])

  const layout = useEvidenceLayout({
    canvasRef,
    sheetRef,
    presentationItems: presentation,
    wide,
  })

  return (
    <div
      className="resume-evidence-canvas"
      data-testid="resume-evidence-canvas"
      ref={registerCanvas}
      style={{ minHeight: wide && layout ? `${layout.canvasHeight}px` : undefined }}
    >
      <ResumeDocument
        document={document}
        evidenceGroups={effectiveGroups}
        onEvidenceActivate={onEvidenceActivate}
      />
      {wide && layout ? (
        <EvidenceLeaderLines
          height={layout.canvasHeight}
          items={layout.items}
          width={layout.canvasWidth}
        />
      ) : null}
      {wide
        ? presentation.map((item) => (
            <EvidenceCallout
              item={item}
              key={item.group.id}
              registerElement={registerElement}
            />
          ))
        : null}
      {!wide && selectedItem ? (
        <EvidenceViewer
          item={selectedItem}
          onClose={closeViewer}
          returnFocusRef={viewerTriggerRef}
        />
      ) : null}
    </div>
  )
}
