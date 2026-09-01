import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { StrictMode, useRef, useState } from 'react'
import { afterEach, vi } from 'vitest'
import { EvidenceViewer } from '../components/EvidenceViewer'
import { evidenceGroups } from '../data/evidence'
import { createEvidencePresentation } from '../data/evidencePresentation'

afterEach(() => {
  vi.unstubAllGlobals()
})

function ViewerHarness() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const item = createEvidencePresentation(evidenceGroups).find(
    (candidate) => candidate.group.id === 'campus-yourgen',
  )!

  return (
    <>
      <button onClick={() => setOpen(true)} ref={triggerRef} type="button">
        打开证据
      </button>
      {open ? (
        <EvidenceViewer
          item={item}
          onClose={() => setOpen(false)}
          returnFocusRef={triggerRef}
        />
      ) : null}
    </>
  )
}

test('stacks every selected group image in registry order', () => {
  render(<ViewerHarness />)
  fireEvent.click(screen.getByRole('button', { name: '打开证据' }))

  const viewer = screen.getByRole('dialog', {
    name: '证据 3：语境项目',
  })
  expect(
    within(viewer).getAllByRole('img').map((image) =>
      image.getAttribute('data-evidence-image'),
    ),
  ).toEqual([
    'campus-yourgen-project',
    'campus-yourgen-promotion-1',
    'campus-yourgen-promotion-2',
  ])
})

test('closes on Escape and restores focus to the opening anchor', async () => {
  render(<ViewerHarness />)
  const trigger = screen.getByRole('button', { name: '打开证据' })

  fireEvent.click(trigger)
  fireEvent.keyDown(document, { key: 'Escape' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())
})

test('keeps content clicks open and closes from overlay or return control', () => {
  render(<ViewerHarness />)
  const trigger = screen.getByRole('button', { name: '打开证据' })

  fireEvent.click(trigger)
  let viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  fireEvent.click(within(viewer).getAllByRole('img')[0])
  expect(viewer).toBeInTheDocument()

  fireEvent.click(viewer)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  fireEvent.click(trigger)
  viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  fireEvent.click(within(viewer).getByRole('button', { name: '返回简历' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('enters and contains keyboard focus inside the open viewer', async () => {
  render(<ViewerHarness />)
  fireEvent.click(screen.getByRole('button', { name: '打开证据' }))

  const viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  const close = within(viewer).getByRole('button', { name: '返回简历' })
  const links = within(viewer).getAllByRole('link')

  await waitFor(() => expect(close).toHaveFocus())
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
  expect(links.at(-1)).toHaveFocus()

  links.at(-1)!.focus()
  fireEvent.keyDown(document, { key: 'Tab' })
  expect(close).toHaveFocus()
})

test('keeps focus inside the viewer during Strict Mode effect replay', async () => {
  const frames = new Map<number, FrameRequestCallback>()
  let nextFrame = 0
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    nextFrame += 1
    frames.set(nextFrame, callback)
    return nextFrame
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn((frame: number) => {
    frames.delete(frame)
  }))
  render(
    <StrictMode>
      <ViewerHarness />
    </StrictMode>,
  )
  fireEvent.click(screen.getByRole('button', { name: '打开证据' }))

  const viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  const close = within(viewer).getByRole('button', { name: '返回简历' })
  expect(close).toHaveFocus()
  for (const frame of frames.values()) {
    frame(0)
  }
  await waitFor(() => expect(close).toHaveFocus())
})

test('locks background scrolling only while the viewer is open', () => {
  document.body.style.overflow = 'clip'
  render(<ViewerHarness />)

  fireEvent.click(screen.getByRole('button', { name: '打开证据' }))
  expect(document.body.style.overflow).toBe('hidden')

  fireEvent.click(screen.getByRole('button', { name: '返回简历' }))
  expect(document.body.style.overflow).toBe('clip')

  document.body.style.removeProperty('overflow')
})
