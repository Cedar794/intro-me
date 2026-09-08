import { fireEvent, render, screen } from '@testing-library/react'
import { App } from './App'

test('renders a semantic resume main element', () => {
  render(<App />)
  expect(screen.getByRole('main')).toHaveAttribute('data-resume-root', 'true')
  expect(screen.getByRole('heading', { level: 1, name: '张悦' })).toBeInTheDocument()
})

test('toggles game profile without changing the original resume content', () => {
  render(<App />)
  const resume = screen.getByRole('main')
  const originalMarkup = resume.innerHTML
  const toggle = screen.getByRole('switch', { name: '显示 Game Profile' })
  expect(toggle).not.toBeChecked()
  fireEvent.click(toggle)
  expect(resume).not.toBeVisible()
  expect(screen.getByRole('main', { name: 'Cedar 的游戏档案' })).toBeVisible()
  expect(document.querySelectorAll('.game-card')).toHaveLength(32)
  expect(screen.getByRole('heading', { name: '真恋～寄语枫秋～' })).toBeVisible()
  expect(screen.getByRole('heading', { name: '盛夏离与合' })).toBeVisible()
  expect(resume.innerHTML).toBe(originalMarkup)
  fireEvent.click(toggle)
  expect(resume).toBeVisible()
  expect(resume.innerHTML).toBe(originalMarkup)
  expect(document.body).not.toHaveClass('game-mode')
})
