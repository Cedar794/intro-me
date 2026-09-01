import type { ReactNode } from 'react'
import type { EvidenceGroup } from '../data/evidence'
import { EvidenceGallery } from './EvidenceGallery'

type ResumeEvidencePairProps = {
  children: ReactNode
  eager?: boolean
  group: EvidenceGroup
}

export function ResumeEvidencePair({
  children,
  eager = false,
  group,
}: ResumeEvidencePairProps) {
  return (
    <div className="resume-evidence-pair" data-evidence-anchor={group.anchor}>
      <div className="resume-evidence-copy">{children}</div>
      <EvidenceGallery eager={eager} group={group} />
    </div>
  )
}
