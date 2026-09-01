import type { ListBlock } from '../data/resumeTypes'
import { RichText } from './RichText'

type NestedListProps = {
  block: ListBlock
  emphasizeResults?: boolean
  path?: string
}

export function NestedList({
  block,
  emphasizeResults = false,
  path = 'list',
}: NestedListProps) {
  const ListTag = block.ordered ? 'ol' : 'ul'

  return (
    <ListTag className="resume-list">
      {block.items.map((item, index) => {
        const itemPath = `${path}-${index}`
        return (
          <li key={itemPath}>
            <span data-resume-line="true">
              <RichText nodes={item.content} emphasizeResults={emphasizeResults} />
            </span>
            {item.children.map((child, childIndex) => (
              <NestedList
                key={`${itemPath}-child-${childIndex}`}
                block={child}
                emphasizeResults={emphasizeResults}
                path={`${itemPath}-child-${childIndex}`}
              />
            ))}
          </li>
        )
      })}
    </ListTag>
  )
}
