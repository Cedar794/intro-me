import { render, screen } from '@testing-library/react'
import { App } from './App'

test('renders a semantic resume main element', () => {
  render(<App />)
  expect(screen.getByRole('main')).toHaveAttribute('data-resume-root', 'true')
  expect(screen.getByRole('heading', { level: 1, name: '张悦' })).toBeInTheDocument()
})
