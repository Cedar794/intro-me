import type { EvidenceResolver } from '../data/evidence'
import { inlineText } from '../data/inlineText'
import type { ListBlock } from '../data/resumeTypes'
import { ResumeEvidencePair } from './ResumeEvidencePair'
import { RichText } from './RichText'

type NestedListProps = {
  block: ListBlock
  emphasizeResults?: boolean
  evidenceResolver?: EvidenceResolver
  path?: string
}

export function NestedList({
  block,
  emphasizeResults = false,
  evidenceResolver,
  path = 'list',
}: NestedListProps) {
  const ListTag = block.ordered ? 'ol' : 'ul'

  return (
    <ListTag className="resume-list">
      {block.items.map((item, index) => {
        const itemPath = `${path}-${index}`
        const evidenceGroup = evidenceResolver?.(inlineText(item.content))
        const line = (
          <span data-resume-line="true">
            <RichText nodes={item.content} emphasizeResults={emphasizeResults} />
          </span>
        )

        return (
          <li key={itemPath}>
            {evidenceGroup ? (
              <ResumeEvidencePair group={evidenceGroup}>{line}</ResumeEvidencePair>
            ) : line}
            {item.children.map((child, childIndex) => (
              <NestedList
                key={`${itemPath}-child-${childIndex}`}
                block={child}
                emphasizeResults={emphasizeResults}
                evidenceResolver={evidenceResolver}
                path={`${itemPath}-child-${childIndex}`}
              />
            ))}
          </li>
        )
      })}
    </ListTag>
  )
}
