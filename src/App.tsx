import { ResumeEvidenceCanvas } from './components/ResumeEvidenceCanvas'
import { evidenceGroups } from './data/evidence'
import { getHeaderAssets } from './data/photos'
import { resume } from './data/resume'

export function App() {
  const visiblePhotos = getHeaderAssets()

  return (
    <main data-resume-root="true">
      <div className="resume-shell">
        <ResumeEvidenceCanvas
          document={resume}
          evidenceGroups={evidenceGroups}
          headerAssets={visiblePhotos}
        />
      </div>
    </main>
  )
}
