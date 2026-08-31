import {
  collectLinks,
  flattenResume,
  transformResumeXml,
} from '../../scripts/transform-lark-xml.mjs'

const fixture =
  '<title>Intro Me</title><h1>张悦</h1><p>前缀<b>重点</b><a href="https://example.com?a=1&amp;b=2">链接</a></p><ul><li>一级<ul><li><b>二级</b></li></ul></li></ul><p></p>'

test('transforms mixed rich text and nested lists without losing order', () => {
  const document = transformResumeXml(fixture)

  expect(document.documentTitle).toBe('Intro Me')
  expect(document.blocks[0]).toEqual({
    type: 'heading',
    level: 1,
    content: [{ type: 'text', text: '张悦' }],
  })
  expect(document.blocks[1]).toEqual({
    type: 'paragraph',
    content: [
      { type: 'text', text: '前缀' },
      { type: 'strong', children: [{ type: 'text', text: '重点' }] },
      {
        type: 'link',
        href: 'https://example.com?a=1&b=2',
        children: [{ type: 'text', text: '链接' }],
      },
    ],
  })
  expect(document.blocks[2]).toEqual({
    type: 'list',
    ordered: false,
    items: [
      {
        content: [{ type: 'text', text: '一级' }],
        children: [
          {
            type: 'list',
            ordered: false,
            items: [
              {
                content: [
                  {
                    type: 'strong',
                    children: [{ type: 'text', text: '二级' }],
                  },
                ],
                children: [],
              },
            ],
          },
        ],
      },
    ],
  })
  expect(document.blocks[3]).toEqual({ type: 'spacer' })
})

test('flattens visible content and collects exact links', () => {
  const document = transformResumeXml(fixture)

  expect(flattenResume(document)).toBe('张悦\n前缀重点链接\n一级\n二级')
  expect(collectLinks(document)).toEqual([
    { label: '链接', href: 'https://example.com?a=1&b=2' },
  ])
})

test('rejects visible unsupported source tags', () => {
  expect(() => transformResumeXml('<title>x</title><blockquote>内容</blockquote>')).toThrow(
    'blockquote',
  )
})
