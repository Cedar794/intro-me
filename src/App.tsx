import { ResumePhotoLayout } from './components/ResumePhotoLayout'
import { getPreviewPhotos, photos } from './data/photos'
import { resume } from './data/resume'

export function App() {
  const previewPhotos = getPreviewPhotos()
  const visiblePhotos = previewPhotos.length > 0 ? previewPhotos : photos

  return (
    <main data-resume-root="true">
      <div className="resume-shell">
        <ResumePhotoLayout document={resume} photos={visiblePhotos} />
      </div>
    </main>
  )
}
