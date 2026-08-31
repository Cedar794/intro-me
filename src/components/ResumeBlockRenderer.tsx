import type { ResumeBlock } from '../data/resumeTypes'
import { NestedList } from './NestedList'
import { RichText } from './RichText'

type ResumeBlockRendererProps = {
  block: ResumeBlock
}

function unreachable(value: never): never {
  throw new Error(`Unsupported resume block: ${JSON.stringify(value)}`)
}

export function ResumeBlockRenderer({ block }: ResumeBlockRendererProps) {
  switch (block.type) {
    case 'heading':
      return block.level === 1 ? (
        <h1 className="resume-heading resume-heading-primary">
          <RichText nodes={block.content} />
        </h1>
      ) : (
        <h2 className="resume-heading resume-heading-section">
          <RichText nodes={block.content} />
        </h2>
      )
    case 'paragraph':
      return (
        <p className="resume-paragraph">
          <RichText nodes={block.content} />
        </p>
      )
    case 'list':
      return <NestedList block={block} />
    case 'spacer':
      return (
        <div
          className="resume-spacer"
          data-resume-spacer="true"
          aria-hidden="true"
        />
      )
    default:
      return unreachable(block)
  }
}
