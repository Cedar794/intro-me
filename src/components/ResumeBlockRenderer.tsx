import type { ResumeBlock } from '../data/resumeTypes'
import { inlineText } from '../data/inlineText'
import { NestedList } from './NestedList'
import { KeywordList } from './ProfileHighlights'
import { RichText } from './RichText'
import { ToolStack } from './ToolStack'

type ResumeBlockRendererProps = {
  block: ResumeBlock
  emphasizeResults?: boolean
}

function unreachable(value: never): never {
  throw new Error(`Unsupported resume block: ${JSON.stringify(value)}`)
}

export function ResumeBlockRenderer({
  block,
  emphasizeResults = false,
}: ResumeBlockRendererProps) {
  const blockText = 'content' in block ? inlineText(block.content) : ''
  const isWorkMetadata =
    emphasizeResults &&
    block.type === 'paragraph' &&
    blockText.length < 80 &&
    (/\d{4}\.\d{2}-\d{4}\.\d{2}/u.test(blockText) || blockText.endsWith(' 长期'))

  switch (block.type) {
    case 'heading':
      return block.level === 1 ? (
        <h1 className="resume-heading resume-heading-primary" data-resume-line="true">
          <RichText nodes={block.content} />
        </h1>
      ) : (
        <h2 className="resume-heading resume-heading-section" data-resume-line="true">
          <RichText nodes={block.content} />
        </h2>
      )
    case 'paragraph':
      if (blockText.startsWith('个人关键词：')) {
        return <KeywordList text={blockText} />
      }

      if (blockText.startsWith('AI工具栈：')) {
        return <ToolStack text={blockText} />
      }

      return (
        <p
          className={`resume-paragraph${isWorkMetadata ? ' work-metadata' : ''}`}
          data-resume-line="true"
        >
          <RichText nodes={block.content} emphasizeResults={emphasizeResults} />
        </p>
      )
    case 'list':
      return <NestedList block={block} emphasizeResults={emphasizeResults} />
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
