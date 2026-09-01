import type { ReactNode } from 'react'
import { inlineText } from '../data/inlineText'
import type { ResumeBlock } from '../data/resumeTypes'
import type { ResumeDocumentData } from '../data/resumeTypes'
import { CampusCapabilityRadar } from './CampusCapabilityRadar'
import { EducationSummary } from './ProfileHighlights'
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
  const workSectionIndex = bodyBlocks.findIndex(
    (block) =>
      block.type === 'heading' &&
      block.level === 2 &&
      inlineText(block.content) === '实习与工作经历',
  )

  const renderedBody: ReactNode[] = []
  for (let index = 0; index < bodyBlocks.length; index += 1) {
    const block = bodyBlocks[index]
    const nextBlock = bodyBlocks[index + 1]

    if (
      isParagraphWithText(block, '上海外国语大学全日制（211）2023.9 - 2027.7') &&
      isParagraphWithText(nextBlock, '荷兰语（英语）专业 （A+专业）')
    ) {
      renderedBody.push(
        <EducationSummary
          key="education-summary"
          major={nextBlock.content}
          school={block.content}
        />,
      )
      index += 1
      continue
    }

    if (
      isHeadingWithText(block, '校园经历【全领域创造能力】') &&
      nextBlock?.type === 'list'
    ) {
      renderedBody.push(
        <CampusCapabilityRadar
          heading={block.content}
          key="campus-capability-radar"
          list={nextBlock}
        />,
      )
      index += 1
      continue
    }

    renderedBody.push(
      <ResumeBlockRenderer
        block={block}
        emphasizeResults={workSectionIndex !== -1 && index > workSectionIndex}
        key={`body-${index}`}
      />,
    )
  }

  return (
    <article
      className="resume-sheet"
      data-testid="resume-sheet"
      data-has-photos={String(hasHeaderAside)}
    >
      <ResumeHeader blocks={headerBlocks} aside={headerAside} hasAside={hasHeaderAside} />
      <ResumeSection className="resume-body">{renderedBody}</ResumeSection>
    </article>
  )
}

function isParagraphWithText(
  block: ResumeBlock | undefined,
  expectedText: string,
): block is Extract<ResumeBlock, { type: 'paragraph' }> {
  return block?.type === 'paragraph' && inlineText(block.content) === expectedText
}

function isHeadingWithText(
  block: ResumeBlock | undefined,
  expectedText: string,
): block is Extract<ResumeBlock, { type: 'heading' }> {
  return block?.type === 'heading' && inlineText(block.content) === expectedText
}
