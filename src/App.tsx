import { ResumeEvidenceCanvas } from './components/ResumeEvidenceCanvas'
import { evidenceGroups } from './data/evidence'
import { getHeaderAssets } from './data/photos'
import { resume } from './data/resume'

export function App() {
  const [showGames, setShowGames] = useState(false)
  useEffect(() => {
    document.body.classList.toggle('game-mode', showGames)
    return () => document.body.classList.remove('game-mode')
  }, [showGames])
  const visiblePhotos = getHeaderAssets()

  return (
    <>
      <div className="profile-modebar">
        <span className="profile-wordmark">CEDAR <span>/ PROFILE</span></span>
        <label className="profile-switch" htmlFor="game-mode">
          <span>显示 Game Profile</span>
          <input id="game-mode" type="checkbox" role="switch" aria-controls="resume-view game-profile" checked={showGames} onChange={(event) => setShowGames(event.target.checked)} />
          <span className="profile-switch-track" aria-hidden="true" />
        </label>
      </div>
    <main data-resume-root="true" id="resume-view" hidden={showGames}>
      <div className="resume-shell">
        <ResumeEvidenceCanvas
          document={resume}
          evidenceGroups={evidenceGroups}
          headerAssets={visiblePhotos}
        />
      </div>
    </main>
    <GameProfile hidden={!showGames} />
    </>
  )
}
import { useEffect, useState } from 'react'
import { GameProfile } from './components/GameProfile'
import './game-profile.css'
