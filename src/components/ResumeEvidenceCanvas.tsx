import { useCallback, useMemo, useRef } from 'react'
import type { EvidenceAsset, EvidenceGroup } from '../data/evidence'
import { createEvidencePresentation } from '../data/evidencePresentation'
import type { ResumeDocumentData } from '../data/resumeTypes'
import { useEvidenceLayout } from '../hooks/useEvidenceLayout'
import type { EvidenceActivationHandler } from './EvidenceAnchor'
import { EvidenceCallout } from './EvidenceCallout'
import { EvidenceLeaderLines } from './EvidenceLeaderLines'
import { ResumeDocument } from './ResumeDocument'

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
  const canvasRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
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
  const onEvidenceActivate = useCallback<EvidenceActivationHandler>((groupId) => {
    calloutElements.current
      .get(groupId)
      ?.querySelector<HTMLAnchorElement>('.resume-evidence-link')
      ?.focus()
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
  const layout = useEvidenceLayout({
    canvasRef,
    sheetRef,
    presentationItems: presentation,
    wide: true,
  })

  return (
    <div
      className="resume-evidence-canvas"
      data-testid="resume-evidence-canvas"
      ref={registerCanvas}
      style={{ minHeight: layout ? `${layout.canvasHeight}px` : undefined }}
    >
      <ResumeDocument
        document={document}
        evidenceGroups={effectiveGroups}
        onEvidenceActivate={onEvidenceActivate}
      />
      {layout ? (
        <EvidenceLeaderLines
          height={layout.canvasHeight}
          items={layout.items}
          width={layout.canvasWidth}
        />
      ) : null}
      {presentation.map((item) => (
        <EvidenceCallout
          item={item}
          key={item.group.id}
          registerElement={registerElement}
        />
      ))}
    </div>
  )
}
