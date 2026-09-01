import type { EvidenceResolver } from '../data/evidence'
import {
  findEvidencePresentation,
  type EvidencePresentationItem,
} from '../data/evidencePresentation'
import { inlineText } from '../data/inlineText'
import type { ListBlock } from '../data/resumeTypes'
import { EvidenceAnchor, type EvidenceActivationHandler } from './EvidenceAnchor'
import { ResumeEvidencePair } from './ResumeEvidencePair'
import { RichText } from './RichText'

type EvidenceMode = 'inline' | 'primary-anchor' | 'secondary-anchor'

type NestedListProps = {
  block: ListBlock
  emphasizeResults?: boolean
  evidenceMode?: EvidenceMode
  evidencePresentation?: EvidencePresentationItem[]
  evidenceResolver?: EvidenceResolver
  onEvidenceActivate?: EvidenceActivationHandler
  path?: string
}

export function NestedList({
  block,
  emphasizeResults = false,
  evidenceMode = 'inline',
  evidencePresentation = [],
  evidenceResolver,
  onEvidenceActivate,
  path = 'list',
}: NestedListProps) {
  const ListTag = block.ordered ? 'ol' : 'ul'

  return (
    <ListTag className="resume-list">
      {block.items.map((item, index) => {
        const itemPath = `${path}-${index}`
        const evidenceGroup = evidenceResolver?.(inlineText(item.content))
        const evidenceItem = evidenceGroup && evidenceMode !== 'inline'
          ? findEvidencePresentation(evidenceGroup.id, evidencePresentation)
          : undefined
        const line = (
          <span data-resume-line="true">
            <RichText nodes={item.content} emphasizeResults={emphasizeResults} />
            {evidenceItem ? (
              <EvidenceAnchor
                item={evidenceItem}
                onActivate={onEvidenceActivate}
                primary={evidenceMode === 'primary-anchor'}
              />
            ) : null}
          </span>
        )

        return (
          <li key={itemPath}>
            {evidenceGroup && evidenceMode === 'inline' ? (
              <ResumeEvidencePair group={evidenceGroup}>{line}</ResumeEvidencePair>
            ) : line}
            {item.children.map((child, childIndex) => (
              <NestedList
                key={`${itemPath}-child-${childIndex}`}
                block={child}
                emphasizeResults={emphasizeResults}
                evidenceMode={evidenceMode}
                evidencePresentation={evidencePresentation}
                evidenceResolver={evidenceResolver}
                onEvidenceActivate={onEvidenceActivate}
                path={`${itemPath}-child-${childIndex}`}
              />
            ))}
          </li>
        )
      })}
    </ListTag>
  )
}
