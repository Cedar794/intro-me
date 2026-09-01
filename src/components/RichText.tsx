import { Fragment, type ReactNode } from 'react'
import type { InlineNode } from '../data/resumeTypes'

type RichTextProps = {
  nodes: InlineNode[]
  emphasizeResults?: boolean
}

const RESULT_PATTERN =
  /(?:0→1|0到1|DAU提升\d+\+|(?:获赞|分享|收藏)\d[\d,.]*|\d[\d,.]*\s+vs\s+\d[\d,.]*|\d[\d,.]*(?:–\d[\d,.]*)?\+?\s*(?:个不重复 GitHub 热门项目|个唯一媒体 URL|个目标页面|个评测项目|个隐蔽Bug|个外语专业|个文件|项资产|名译员|人次|美元\/月|MiB\/s|MiB|GB|TB|ms|秒|分钟|小时|个月|份|篇|类|条|场|行|维|分片|页面|用户|万阅读|万|%))/gu

function renderHighlightedText(text: string, key: string): ReactNode[] {
  const content: ReactNode[] = []
  let cursor = 0

  for (const [index, match] of Array.from(text.matchAll(RESULT_PATTERN)).entries()) {
    const start = match.index
    const end = start + match[0].length

    if (start > cursor) {
      content.push(<Fragment key={`${key}-text-${index}`}>{text.slice(cursor, start)}</Fragment>)
    }

    content.push(
      <strong
        className="result-highlight"
        data-result-highlight="true"
        key={`${key}-result-${index}`}
      >
        {match[0]}
      </strong>,
    )
    cursor = end
  }

  if (cursor < text.length) {
    content.push(<Fragment key={`${key}-tail`}>{text.slice(cursor)}</Fragment>)
  }

  return content.length > 0 ? content : [<Fragment key={key}>{text}</Fragment>]
}

function renderNodes(
  nodes: InlineNode[],
  path: string,
  emphasizeResults: boolean,
  insideProtectedNode = false,
) {
  return nodes.map((node, index) => {
    const key = `${path}-${index}`

    switch (node.type) {
      case 'text':
        return emphasizeResults && !insideProtectedNode
          ? renderHighlightedText(node.text, key)
          : <Fragment key={key}>{node.text}</Fragment>
      case 'strong':
        return (
          <strong key={key}>
            {renderNodes(node.children, key, emphasizeResults, true)}
          </strong>
        )
      case 'link':
        return (
          <a key={key} href={node.href} target="_blank" rel="noreferrer noopener">
            {renderNodes(node.children, key, emphasizeResults, true)}
          </a>
        )
    }
  })
}

export function RichText({ nodes, emphasizeResults = false }: RichTextProps) {
  return <>{renderNodes(nodes, 'inline', emphasizeResults)}</>
}
