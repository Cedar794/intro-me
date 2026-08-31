import { Fragment } from 'react'
import type { InlineNode } from '../data/resumeTypes'

type RichTextProps = {
  nodes: InlineNode[]
}

function renderNodes(nodes: InlineNode[], path: string) {
  return nodes.map((node, index) => {
    const key = `${path}-${index}`

    switch (node.type) {
      case 'text':
        return <Fragment key={key}>{node.text}</Fragment>
      case 'strong':
        return <strong key={key}>{renderNodes(node.children, key)}</strong>
      case 'link':
        return (
          <a key={key} href={node.href} target="_blank" rel="noreferrer noopener">
            {renderNodes(node.children, key)}
          </a>
        )
    }
  })
}

export function RichText({ nodes }: RichTextProps) {
  return <>{renderNodes(nodes, 'inline')}</>
}
