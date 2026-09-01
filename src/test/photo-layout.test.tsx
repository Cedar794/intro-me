import { render, screen, within } from '@testing-library/react'
import { ResumePhotoLayout } from '../components/ResumePhotoLayout'
import { evidenceGroups, headerProfileGroup } from '../data/evidence'
import { resume } from '../data/resume'

test('uses the full resume width when no photos are configured', () => {
  render(<ResumePhotoLayout document={resume} evidenceGroups={[]} photos={[]} />)

  expect(screen.queryByTestId('photo-panel')).not.toBeInTheDocument()
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'false')
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute(
    'data-has-evidence',
    'false',
  )
})

test('places configured photos in the resume header', () => {
  render(
    <ResumePhotoLayout
      document={resume}
      evidenceGroups={[]}
      photos={[
        {
          id: 'portrait',
          src: '/photo.jpg',
          alt: '个人照片',
          caption: '个人照片',
          width: 300,
          height: 400,
        },
      ]}
    />,
  )

  expect(screen.getByTestId('photo-panel')).toBeInTheDocument()
  expect(screen.getByAltText('个人照片')).toHaveAttribute('src', '/photo.jpg')
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'true')
})

test('renders the two production profiles in supplied order as full-size links', () => {
  render(
    <ResumePhotoLayout
      document={resume}
      evidenceGroups={evidenceGroups}
      photos={headerProfileGroup.assets}
    />,
  )

  const panel = screen.getByTestId('photo-panel')
  const images = within(panel).getAllByRole('img')

  expect(images.map((image) => image.getAttribute('alt'))).toEqual([
    'Codex Profile图片',
    '今年的 GitHub Profile图片',
  ])
  expect(images[0]).toHaveAttribute('width', '783')
  expect(images[0]).toHaveAttribute('height', '732')
  expect(images[0]).toHaveAttribute('loading', 'eager')
  expect(within(panel).getAllByRole('link')).toHaveLength(2)
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute(
    'data-has-evidence',
    'true',
  )
})
