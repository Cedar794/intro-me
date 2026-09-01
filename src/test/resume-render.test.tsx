import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { ResumeBlockRenderer } from '../components/ResumeBlockRenderer'
import { ResumeDocument } from '../components/ResumeDocument'
import links from '../data/resume-links.json'
import resumeText from '../data/resume-text.txt?raw'
import { resume } from '../data/resume'
import type { ResumeBlock } from '../data/resumeTypes'

const blocks: ResumeBlock[] = [
  {
    type: 'heading',
    level: 2,
    content: [{ type: 'text', text: '经历' }],
  },
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: '普通' },
      { type: 'strong', children: [{ type: 'text', text: '重点' }] },
      {
        type: 'link',
        href: 'https://example.com/work',
        children: [{ type: 'text', text: '作品' }],
      },
    ],
  },
  {
    type: 'list',
    ordered: false,
    items: [
      {
        content: [{ type: 'text', text: '外层' }],
        children: [
          {
            type: 'list',
            ordered: true,
            items: [
              {
                content: [{ type: 'text', text: '内层' }],
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  { type: 'spacer' },
]

test('renders rich text and nested semantic blocks safely', () => {
  const { container } = render(
    <section>
      {blocks.map((block, index) => (
        <ResumeBlockRenderer key={index} block={block} />
      ))}
    </section>,
  )

  expect(screen.getByRole('heading', { level: 2, name: '经历' })).toBeInTheDocument()
  expect(screen.getByText('重点').tagName).toBe('STRONG')
  expect(screen.getByRole('link', { name: '作品' })).toHaveAttribute(
    'href',
    'https://example.com/work',
  )
  expect(screen.getByRole('link', { name: '作品' })).toHaveAttribute('target', '_blank')
  expect(screen.getByRole('link', { name: '作品' })).toHaveAttribute(
    'rel',
    'noreferrer noopener',
  )
  expect(container.querySelector('ul > li > ol')).toBeInTheDocument()

  const spacer = container.querySelector('[data-resume-spacer="true"]')
  expect(spacer).toHaveAttribute('aria-hidden', 'true')
  expect(spacer).toHaveTextContent('')
})

function normalizeText(value: string) {
  return value.replace(/\s+/gu, ' ').trim()
}

test('renders every captured character, link, and top-level section in source order', () => {
  const { container } = render(<ResumeDocument document={resume} />)
  const sheet = screen.getByTestId('resume-sheet')
  const renderedLines = Array.from(container.querySelectorAll('[data-resume-line]'))
    .map((element) => element.textContent ?? '')
    .join('\n')

  expect(normalizeText(renderedLines)).toBe(normalizeText(resumeText))

  for (const { label, href } of links) {
    const matchingLinks = screen.getAllByRole('link', { name: label })
    expect(matchingLinks).toHaveLength(1)
    expect(matchingLinks[0]).toHaveAttribute('href', href)
  }

  const visibleOrder = [
    '张悦',
    '教育经历【外国语言 - AI 交叉领域】',
    '校园经历【全领域创造能力】',
    '实习与工作经历',
    'OUTPUT【跨国数字内容科技头部企业】',
    '深圳英鹏图灵科技-雷锋网-AI科技评论',
    '（香港）范彻斯库科技有限公司',
    '深圳时空壶技术有限公司【北美穿戴式AI翻译设备龙头企业】',
    '泉州市乐云网络科技有限公司',
    '上海晨读信息科技有限公司【字节跳动生态企业】',
  ]

  const sheetText = sheet.textContent ?? ''
  let previousIndex = -1
  for (const label of visibleOrder) {
    const currentIndex = sheetText.indexOf(label)
    expect(currentIndex).toBeGreaterThan(previousIndex)
    previousIndex = currentIndex
  }
})

test('groups every personal keyword into a colored tag without changing the source line', () => {
  render(<ResumeDocument document={resume} />)

  const keywordList = screen.getByTestId('keyword-list')
  const keywordItems = within(keywordList).getAllByRole('listitem')
  const expectedKeywords = [
    'AI Native 产品人',
    '技术型产品经理',
    '0→1 Builder',
    '系统化产品思维',
    '数据与评测驱动',
    '跨团队交付',
    '多语种跨文化',
    '长期主义',
  ]

  expect(keywordItems).toHaveLength(expectedKeywords.length)
  expect(keywordItems.map((item) => item.textContent)).toEqual(expectedKeywords)
  expect(keywordList.closest('[data-resume-line="true"]')).toHaveTextContent(
    '个人关键词：AI Native 产品人｜技术型产品经理｜0→1 Builder｜系统化产品思维｜数据与评测驱动｜跨团队交付｜多语种跨文化｜长期主义',
  )
})

test('renders every AI tool as an icon capsule without changing the source line', () => {
  render(<ResumeDocument document={resume} />)

  const toolStack = screen.getByTestId('tool-stack')
  const toolItems = within(toolStack).getAllByRole('listitem')
  const expectedTools = [
    'ChatGPT Desktop',
    'Deepseek Harness',
    '即梦',
    'Suno',
    'Gemini App',
    'Claude Code',
    'Google AI Studio',
    'Cowork',
    'Lark CLI',
    'OpenClaw',
    'Hermes Agent',
    'Seedance 2.5 API',
    '外部插件',
  ]

  expect(toolItems).toHaveLength(expectedTools.length)
  expect(toolItems.map((item) => item.textContent)).toEqual(expectedTools)
  for (const item of toolItems) {
    expect(item.querySelector('[data-tool-icon="true"]')).toBeInTheDocument()
  }
  expect(toolStack.closest('[data-resume-line="true"]')).toHaveTextContent(
    'AI工具栈：ChatGPT Desktop、Deepseek Harness、即梦、Suno、Gemini App、Claude Code、Google AI Studio、Cowork、Lark CLI、OpenClaw、Hermes Agent、Seedance 2.5 API 及外部插件。',
  )
})

test('places the exact major tag beside the school summary', () => {
  render(<ResumeDocument document={resume} />)

  const educationSummary = screen.getByTestId('education-summary')
  expect(
    within(educationSummary).getByText('上海外国语大学全日制（211）2023.9 - 2027.7'),
  ).toBeInTheDocument()
  expect(
    within(educationSummary).getByText('荷兰语（英语）专业 （A+专业）'),
  ).toHaveAttribute('data-education-tag', 'true')
  expect(educationSummary.querySelectorAll('[data-resume-line="true"]')).toHaveLength(2)
})

test('renders the campus source list as a four-route capability star map', () => {
  render(<ResumeDocument document={resume} />)

  const heading = screen.getByRole('heading', {
    level: 2,
    name: '校园经历【全领域创造能力】',
  })
  const radar = screen.getByTestId('campus-radar')
  const dimensions = within(radar).getAllByRole('button', {
    name: /能力|组织力/u,
  })

  expect(heading).toBeInTheDocument()
  expect(dimensions.map((dimension) => dimension.textContent)).toEqual([
    '创新创业赛事能力',
    '校企活动组织力',
    '外交类学术能力',
    '艺术创作与多媒体处理能力',
  ])
  expect(radar).toHaveAttribute('data-active-dimension', '')
  expect(radar.querySelectorAll('[data-campus-detail]')).toHaveLength(4)

  const starMap = within(radar).getByTestId('campus-star-map')
  expect(radar.querySelector('svg')).not.toBeInTheDocument()
  expect(starMap).toHaveTextContent('全领域创造能力')
  expect(
    Array.from(starMap.querySelectorAll('[data-campus-star-axis]')).map(
      (axis) => axis.getAttribute('data-axis'),
    ),
  ).toEqual(['0', '1', '2', '3'])
})

test('reveals the matching campus detail on hover and hides it on leave', () => {
  render(<ResumeDocument document={resume} />)

  const radar = screen.getByTestId('campus-radar')
  const innovationDimension = within(radar).getByRole('button', {
    name: '创新创业赛事能力',
  })
  const innovationDetail = screen.getByTestId('campus-detail-0')

  expect(innovationDetail).toHaveAttribute('aria-hidden', 'true')
  fireEvent.mouseEnter(innovationDimension)
  expect(innovationDimension).toHaveAttribute('aria-expanded', 'true')
  expect(innovationDetail).toHaveAttribute('aria-hidden', 'false')
  expect(innovationDetail).toHaveTextContent('打造"AI+"一站式智慧文旅平台')

  fireEvent.mouseLeave(radar)
  expect(innovationDetail).toHaveAttribute('aria-hidden', 'true')
})

test('treats the revealed detail as part of the hover region', () => {
  vi.useFakeTimers()

  try {
    render(<ResumeDocument document={resume} />)

    const radar = screen.getByTestId('campus-radar')
    const innovationDimension = within(radar).getByRole('button', {
      name: '创新创业赛事能力',
    })
    const innovationDetail = screen.getByTestId('campus-detail-0')

    fireEvent.mouseEnter(innovationDimension)
    fireEvent.mouseLeave(innovationDimension, { relatedTarget: innovationDetail })
    fireEvent.mouseEnter(innovationDetail, { relatedTarget: innovationDimension })
    act(() => vi.advanceTimersByTime(180))
    expect(innovationDetail).toHaveAttribute('aria-hidden', 'false')

    fireEvent.mouseLeave(innovationDetail, { relatedTarget: radar })
    act(() => vi.advanceTimersByTime(180))
    expect(innovationDetail).toHaveAttribute('aria-hidden', 'true')
  } finally {
    vi.useRealTimers()
  }
})

test('does not render a persistent close control for campus details', () => {
  render(<ResumeDocument document={resume} />)

  const radar = screen.getByTestId('campus-radar')
  fireEvent.click(
    within(radar).getByRole('button', { name: '创新创业赛事能力' }),
  )

  expect(
    screen.queryAllByRole('button', {
      name: '关闭校园经历详情',
      hidden: true,
    }),
  ).toHaveLength(0)
})

test('dismisses a tapped campus detail when the user taps outside the radar', () => {
  render(<ResumeDocument document={resume} />)

  const radar = screen.getByTestId('campus-radar')
  const organizationDimension = within(radar).getByRole('button', {
    name: '校企活动组织力',
  })
  const organizationDetail = screen.getByTestId('campus-detail-1')

  fireEvent.click(organizationDimension)
  expect(organizationDetail).toHaveAttribute('aria-hidden', 'false')

  fireEvent.pointerDown(document.body)
  expect(organizationDetail).toHaveAttribute('aria-hidden', 'true')
})

test('supports tap selection and Escape dismissal for campus details', () => {
  render(<ResumeDocument document={resume} />)

  const radar = screen.getByTestId('campus-radar')
  const organizationDimension = within(radar).getByRole('button', {
    name: '校企活动组织力',
  })
  const organizationDetail = screen.getByTestId('campus-detail-1')

  fireEvent.click(organizationDimension)
  expect(organizationDetail).toHaveAttribute('aria-hidden', 'false')
  expect(organizationDetail).toHaveTextContent('上海七校')

  fireEvent.keyDown(radar, { key: 'Escape' })
  expect(organizationDetail).toHaveAttribute('aria-hidden', 'true')
})

test('emphasizes measurable work results without rewriting their text', () => {
  const { container } = render(<ResumeDocument document={resume} />)

  const highlightedResults = Array.from(
    container.querySelectorAll('strong[data-result-highlight="true"]'),
  ).map((element) => element.textContent ?? '')

  expect(highlightedResults.some((text) => text.includes('2,530 个文件'))).toBe(true)
  expect(highlightedResults.some((text) => text.includes('200+'))).toBe(true)
})
