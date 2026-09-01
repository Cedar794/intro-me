import { render, screen, within } from '@testing-library/react'
import { ResumeEvidenceCanvas } from '../components/ResumeEvidenceCanvas'
import { evidenceGroups, headerProfileGroup } from '../data/evidence'
import { resume } from '../data/resume'

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
