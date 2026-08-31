import type { ListBlock } from '../data/resumeTypes'
import { RichText } from './RichText'

type NestedListProps = {
  block: ListBlock
  path?: string
}

export function NestedList({ block, path = 'list' }: NestedListProps) {
  const ListTag = block.ordered ? 'ol' : 'ul'

  return (
    <ListTag className="resume-list">
      {block.items.map((item, index) => {
        const itemPath = `${path}-${index}`
        return (
          <li key={itemPath}>
            <RichText nodes={item.content} />
            {item.children.map((child, childIndex) => (
              <NestedList
                key={`${itemPath}-child-${childIndex}`}
                block={child}
                path={`${itemPath}-child-${childIndex}`}
              />
            ))}
          </li>
        )
      })}
    </ListTag>
  )
}
