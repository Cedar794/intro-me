import { render, screen, within } from '@testing-library/react'
import { GameProfile } from '../components/GameProfile'

test('groups every game once and links category navigation to the matching sections', () => {
  render(<GameProfile hidden={false} />)
  const nav = screen.getByRole('navigation', { name: '游戏分类' })
  const expected = [
    ['竞技对抗', 4, '王者荣耀'],
    ['开放世界与角色扮演', 6, '赛博朋克 2077'],
    ['沙盒建造与生存', 4, '我的世界'],
    ['模拟经营与运动', 5, '星露谷物语'],
    ['合作冒险与派对', 7, '双人成行'],
    ['互动影游与视觉小说', 6, '真恋～寄语枫秋～'],
  ] as const
  expect(within(nav).getAllByRole('link')).toHaveLength(6)
  const images: string[] = []
  for (const [name, count, title] of expected) {
    const section = screen.getByRole('region', { name })
    const link = within(nav).getByRole('link', { name: `${name} ${count}` })
    expect(link).toHaveAttribute('href', `#${section.id}`)
    expect(within(section).getAllByRole('link')).toHaveLength(count)
    expect(within(section).getByRole('heading', { name: title })).toBeVisible()
    images.push(...within(section).getAllByRole('img').map(img => img.getAttribute('src')!))
  }
  expect(images).toHaveLength(32)
  expect(new Set(images).size).toBe(32)
})
