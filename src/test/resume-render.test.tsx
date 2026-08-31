import { render, screen } from '@testing-library/react'
import { ResumeBlockRenderer } from '../components/ResumeBlockRenderer'
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
