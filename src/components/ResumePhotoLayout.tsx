import type { PhotoItem, ResumeDocumentData } from '../data/resumeTypes'
import { PhotoPanel } from './PhotoPanel'
import { ResumeDocument } from './ResumeDocument'

type ResumePhotoLayoutProps = {
  document: ResumeDocumentData
  photos: PhotoItem[]
}

export function ResumePhotoLayout({ document, photos }: ResumePhotoLayoutProps) {
  const hasPhotos = photos.length > 0
  const panel = hasPhotos ? <PhotoPanel photos={photos} /> : undefined

  return (
    <ResumeDocument
      document={document}
      headerAside={panel}
      hasHeaderAside={hasPhotos}
    />
  )
}
