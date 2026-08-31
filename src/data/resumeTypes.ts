export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }

export type ListItem = {
  content: InlineNode[]
  children: ListBlock[]
}

export type ListBlock = {
  type: 'list'
  ordered: boolean
  items: ListItem[]
}

export type ResumeBlock =
  | { type: 'heading'; level: 1 | 2; content: InlineNode[] }
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'spacer' }
  | ListBlock

export type ResumeDocumentData = {
  documentTitle: string
  blocks: ResumeBlock[]
}

export type PhotoItem = {
  id: string
  src: string
  alt: string
  caption?: string
  priority?: number
}
