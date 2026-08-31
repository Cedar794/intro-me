import type { ReactNode } from 'react'
import type { ResumeBlock } from '../data/resumeTypes'
import { ResumeBlockRenderer } from './ResumeBlockRenderer'

type ResumeHeaderProps = {
  blocks: ResumeBlock[]
  aside?: ReactNode
  hasAside: boolean
}

export function ResumeHeader({ blocks, aside, hasAside }: ResumeHeaderProps) {
  return (
    <header className="resume-header" data-has-photos={String(hasAside)}>
      <div className="resume-header-content" data-testid="resume-header-content">
        {blocks.map((block, index) => (
          <ResumeBlockRenderer key={`header-${index}`} block={block} />
        ))}
      </div>
      {aside ? (
        <div className="resume-header-aside" data-testid="resume-header-aside">
          {aside}
        </div>
      ) : null}
    </header>
  )
}
