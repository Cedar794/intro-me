import { ResumeDocument } from './components/ResumeDocument'
import { resume } from './data/resume'

export function App() {
  return (
    <main data-resume-root="true">
      <div className="resume-shell">
        <ResumeDocument document={resume} />
      </div>
    </main>
  )
}
