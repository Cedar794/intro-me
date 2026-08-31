import type { ReactNode } from 'react'
import type { ResumeDocumentData } from '../data/resumeTypes'
import { ResumeBlockRenderer } from './ResumeBlockRenderer'
import { ResumeHeader } from './ResumeHeader'
import { ResumeSection } from './ResumeSection'

type ResumeDocumentProps = {
  document: ResumeDocumentData
  headerAside?: ReactNode
  hasHeaderAside?: boolean
}

export function ResumeDocument({
  document,
  headerAside,
  hasHeaderAside = false,
}: ResumeDocumentProps) {
  const firstSectionIndex = document.blocks.findIndex(
    (block) => block.type === 'heading' && block.level === 2,
  )
  const headerEnd = firstSectionIndex === -1 ? document.blocks.length : firstSectionIndex
  const headerBlocks = document.blocks.slice(0, headerEnd)
  const bodyBlocks = document.blocks.slice(headerEnd)

  return (
    <article
      className="resume-sheet"
      data-testid="resume-sheet"
      data-has-photos={String(hasHeaderAside)}
    >
      <ResumeHeader blocks={headerBlocks} aside={headerAside} hasAside={hasHeaderAside} />
      <ResumeSection className="resume-body">
        {bodyBlocks.map((block, index) => (
          <ResumeBlockRenderer key={`body-${index}`} block={block} />
        ))}
      </ResumeSection>
    </article>
  )
}
