import type { InlineNode } from './resumeTypes'

export function inlineText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return node.text
      }

      return inlineText(node.children)
    })
    .join('')
}
