import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { ResumeEvidenceCanvas } from '../components/ResumeEvidenceCanvas'
import { evidenceGroups, headerProfileGroup } from '../data/evidence'
import { resume } from '../data/resume'

const WIDE_EVIDENCE_QUERY = '(min-width: 1320px)'
let wideMatches = true
let mediaListeners = new Set<(event: MediaQueryListEvent) => void>()

function setWideMode(matches: boolean) {
  wideMatches = matches
  act(() => {
    for (const listener of mediaListeners) {
      listener({ matches, media: WIDE_EVIDENCE_QUERY } as MediaQueryListEvent)
    }
  })
}

beforeEach(() => {
  wideMatches = true
  mediaListeners = new Set()
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    addEventListener: (
      event: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      if (event === 'change') {
        mediaListeners.add(listener)
      }
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      mediaListeners.add(listener)
    },
    dispatchEvent: () => true,
    get matches() {
      return query === WIDE_EVIDENCE_QUERY && wideMatches
    },
    media: query,
    onchange: null,
    removeEventListener: (
      event: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      if (event === 'change') {
        mediaListeners.delete(listener)
      }
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      mediaListeners.delete(listener)
    },
  })))
})

afterEach(() => {
  document.body.style.removeProperty('overflow')
  vi.unstubAllGlobals()
})

test('renders every evidence image in exterior callouts and none in the sheet', () => {
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  const sheet = screen.getByTestId('resume-sheet')
  const canvas = screen.getByTestId('resume-evidence-canvas')
  const callouts = canvas.querySelectorAll('[data-evidence-callout-id]')

  expect(sheet.querySelectorAll('[data-evidence-image]')).toHaveLength(0)
  expect(callouts).toHaveLength(15)
  expect(canvas.querySelectorAll('[data-evidence-image]')).toHaveLength(19)
  expect(sheet.contains(callouts[0])).toBe(false)
})

test('preserves production profile order in the first exterior callout', () => {
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  const headerCallout = screen.getByTestId('evidence-callout-header-profiles')
  expect(
    within(headerCallout).getAllByRole('img').map((image) => image.getAttribute('alt')),
  ).toEqual(['Codex Profile图片', '今年的 GitHub Profile图片'])
})

test('renders no narrow evidence until a primary or secondary anchor opens one group', () => {
  setWideMode(false)
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  expect(document.querySelectorAll('[data-evidence-callout-id]')).toHaveLength(0)
  expect(document.querySelectorAll('[data-evidence-line-id]')).toHaveLength(0)
  expect(document.querySelectorAll('[data-evidence-image]')).toHaveLength(0)

  fireEvent.click(screen.getByRole('button', { name: '创新创业赛事能力' }))
  const yourgenAnchors = screen.getAllByRole('button', {
    name: '查看证据 3：语境项目',
  })
  expect(yourgenAnchors).toHaveLength(2)
  fireEvent.click(yourgenAnchors.at(-1)!)

  const viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  expect(
    within(viewer).getAllByRole('img').map((image) =>
      image.getAttribute('data-evidence-image'),
    ),
  ).toEqual([
    'campus-yourgen-project',
    'campus-yourgen-promotion-1',
    'campus-yourgen-promotion-2',
  ])
  expect(document.querySelectorAll('[data-evidence-image]')).toHaveLength(3)
})

test('closes a narrow viewer and restores scrolling when the viewport becomes wide', async () => {
  setWideMode(false)
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  fireEvent.click(screen.getAllByRole('button', {
    name: '查看证据 3：语境项目',
  })[0])
  expect(screen.getByRole('dialog', { name: '证据 3：语境项目' })).toBeInTheDocument()
  expect(document.body.style.overflow).toBe('hidden')

  setWideMode(true)

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(document.body.style.overflow).toBe('')
  expect(document.querySelectorAll('[data-evidence-callout-id]')).toHaveLength(15)
})

test('moves wide-screen focus from an anchor to its matching original-image link', () => {
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  fireEvent.click(screen.getAllByRole('button', {
    name: '查看证据 3：语境项目',
  })[0])

  expect(screen.getByRole('link', { name: '查看语境项目原图' })).toHaveFocus()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
