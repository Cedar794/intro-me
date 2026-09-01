import type { EvidenceAsset, EvidenceGroup } from '../data/evidence'
import type { ResumeDocumentData } from '../data/resumeTypes'
import { PhotoPanel } from './PhotoPanel'
import { ResumeDocument } from './ResumeDocument'

type ResumePhotoLayoutProps = {
  document: ResumeDocumentData
  evidenceGroups?: EvidenceGroup[]
  photos: EvidenceAsset[]
}

export function ResumePhotoLayout({
  document,
  evidenceGroups = [],
  photos,
}: ResumePhotoLayoutProps) {
  const hasPhotos = photos.length > 0
  const panel = hasPhotos ? <PhotoPanel photos={photos} /> : undefined

  return (
    <ResumeDocument
      document={document}
      evidenceGroups={evidenceGroups}
      headerAside={panel}
      hasHeaderAside={hasPhotos}
    />
  )
}
