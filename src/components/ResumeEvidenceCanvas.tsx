import { useCallback, useRef } from 'react'
import type { EvidenceAsset, EvidenceGroup } from '../data/evidence'
import { createEvidencePresentation } from '../data/evidencePresentation'
import type { ResumeDocumentData } from '../data/resumeTypes'
import type { EvidenceActivationHandler } from './EvidenceAnchor'
import { EvidenceCallout } from './EvidenceCallout'
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
  const calloutElements = useRef(new Map<string, HTMLElement>())
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
  const effectiveGroups = evidenceGroups.map((group) =>
    group.id === 'header-profiles' ? { ...group, assets: headerAssets } : group,
  )
  const presentation = createEvidencePresentation(effectiveGroups)
  const leftItems = presentation.filter((item) => item.side === 'left')
  const rightItems = presentation.filter((item) => item.side === 'right')

  return (
    <div className="resume-evidence-canvas" data-testid="resume-evidence-canvas">
      <section aria-label="左侧证据" className="evidence-rail evidence-rail--left">
        {leftItems.map((item) => (
          <EvidenceCallout item={item} key={item.group.id} registerElement={registerElement} />
        ))}
      </section>
      <ResumeDocument
        document={document}
        evidenceGroups={effectiveGroups}
        onEvidenceActivate={onEvidenceActivate}
      />
      <section aria-label="右侧证据" className="evidence-rail evidence-rail--right">
        {rightItems.map((item) => (
          <EvidenceCallout item={item} key={item.group.id} registerElement={registerElement} />
        ))}
      </section>
    </div>
  )
}
