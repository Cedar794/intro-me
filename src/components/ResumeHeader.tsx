import type { EvidencePresentationItem } from '../data/evidencePresentation'
import type { ResumeBlock } from '../data/resumeTypes'
import { EvidenceAnchor, type EvidenceActivationHandler } from './EvidenceAnchor'
import { ResumeBlockRenderer } from './ResumeBlockRenderer'

type ResumeHeaderProps = {
  blocks: ResumeBlock[]
  evidenceItem?: EvidencePresentationItem
  onEvidenceActivate?: EvidenceActivationHandler
}

export function ResumeHeader({
  blocks,
  evidenceItem,
  onEvidenceActivate,
}: ResumeHeaderProps) {
  return (
    <header className="resume-header">
      <div className="resume-header-content" data-testid="resume-header-content">
        {blocks.map((block, index) => (
          <ResumeBlockRenderer key={`header-${index}`} block={block} />
        ))}
        {evidenceItem ? (
          <EvidenceAnchor item={evidenceItem} onActivate={onEvidenceActivate} />
        ) : null}
      </div>
    </header>
  )
}
