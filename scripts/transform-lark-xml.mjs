import { parseDocument } from 'htmlparser2'

function isText(node) {
  return node.type === 'text'
}

function isTag(node) {
  return node.type === 'tag'
}

function childrenOf(node) {
  return Array.isArray(node.children) ? node.children : []
}

function visibleText(node) {
  if (isText(node)) return node.data
  return childrenOf(node).map(visibleText).join('')
}

function hasVisibleText(node) {
  return /\S/u.test(visibleText(node))
}

function unsupported(node, context) {
  const name = isTag(node) ? node.name : node.type
  throw new Error(`Unsupported visible ${context} tag: ${name}`)
}

function transformInlineChildren(nodes) {
  return nodes.flatMap((node) => {
    if (isText(node)) {
      return [{ type: 'text', text: node.data }]
    }

    if (!isTag(node)) {
      return hasVisibleText(node) ? unsupported(node, 'inline') : []
    }

    if (node.name === 'br') {
      return [{ type: 'text', text: '\n' }]
    }

    if (node.name === 'b') {
      return [{ type: 'strong', children: transformInlineChildren(childrenOf(node)) }]
    }

    if (node.name === 'a') {
      const href = node.attribs?.href
      if (typeof href !== 'string') {
        throw new Error('Link tag is missing an href attribute')
      }
      return [
        {
          type: 'link',
          href,
          children: transformInlineChildren(childrenOf(node)),
        },
      ]
    }

    return hasVisibleText(node) ? unsupported(node, 'inline') : []
  })
}

function transformList(node) {
  const items = []

  for (const child of childrenOf(node)) {
    if (isText(child) && !/\S/u.test(child.data)) continue
    if (!isTag(child) || child.name !== 'li') {
      if (hasVisibleText(child)) unsupported(child, 'list')
      continue
    }

    const inlineChildren = []
    const nestedLists = []

    for (const itemChild of childrenOf(child)) {
      if (isTag(itemChild) && (itemChild.name === 'ul' || itemChild.name === 'ol')) {
        nestedLists.push(transformList(itemChild))
      } else {
        inlineChildren.push(itemChild)
      }
    }

    items.push({
      content: transformInlineChildren(inlineChildren),
      children: nestedLists,
    })
  }

  return {
    type: 'list',
    ordered: node.name === 'ol',
    items,
  }
}

function transformBlock(node) {
  if (!isTag(node)) {
    return hasVisibleText(node) ? unsupported(node, 'block') : null
  }

  if (node.name === 'h1' || node.name === 'h2') {
    return {
      type: 'heading',
      level: node.name === 'h1' ? 1 : 2,
      content: transformInlineChildren(childrenOf(node)),
    }
  }

  if (node.name === 'p') {
    const content = transformInlineChildren(childrenOf(node))
    return /\S/u.test(inlineText(content))
      ? { type: 'paragraph', content }
      : { type: 'spacer' }
  }

  if (node.name === 'ul' || node.name === 'ol') {
    return transformList(node)
  }

  return hasVisibleText(node) ? unsupported(node, 'block') : null
}

function inlineText(nodes) {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.text
      return inlineText(node.children)
    })
    .join('')
}

function listLines(block) {
  return block.items.flatMap((item) => [
    inlineText(item.content),
    ...item.children.flatMap(listLines),
  ])
}

export function transformResumeXml(xml) {
  if (typeof xml !== 'string' || xml.length === 0) {
    throw new Error('Resume XML is empty')
  }

  const root = parseDocument(xml, { xmlMode: true, decodeEntities: true })
  let documentTitle = ''
  const blocks = []

  for (const node of root.children) {
    if (isText(node) && !/\S/u.test(node.data)) continue

    if (isTag(node) && node.name === 'title') {
      documentTitle = visibleText(node)
      continue
    }

    const block = transformBlock(node)
    if (block) blocks.push(block)
  }

  if (!documentTitle) {
    throw new Error('Resume XML is missing a visible title')
  }

  return { documentTitle, blocks }
}

export function flattenResume(document) {
  const lines = document.blocks.flatMap((block) => {
    if (block.type === 'spacer') return []
    if (block.type === 'list') return listLines(block)
    return [inlineText(block.content)]
  })

  return lines
    .flatMap((line) => line.replace(/\r\n?/gu, '\n').split('\n'))
    .filter((line) => /\S/u.test(line))
    .join('\n')
}

function collectInlineLinks(nodes, links) {
  for (const node of nodes) {
    if (node.type === 'text') continue
    if (node.type === 'link') {
      links.push({ label: inlineText(node.children), href: node.href })
    }
    collectInlineLinks(node.children, links)
  }
}

function collectListLinks(block, links) {
  for (const item of block.items) {
    collectInlineLinks(item.content, links)
    for (const child of item.children) collectListLinks(child, links)
  }
}

export function collectLinks(document) {
  const links = []

  for (const block of document.blocks) {
    if (block.type === 'spacer') continue
    if (block.type === 'list') {
      collectListLinks(block, links)
    } else {
      collectInlineLinks(block.content, links)
    }
  }

  return links
}
