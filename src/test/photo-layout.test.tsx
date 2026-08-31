import { render, screen } from '@testing-library/react'
import { ResumePhotoLayout } from '../components/ResumePhotoLayout'
import { resume } from '../data/resume'

test('uses the full resume width when no photos are configured', () => {
  render(<ResumePhotoLayout document={resume} photos={[]} />)

  expect(screen.queryByTestId('photo-panel')).not.toBeInTheDocument()
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'false')
})

test('places configured photos in the resume header', () => {
  render(
    <ResumePhotoLayout
      document={resume}
      photos={[{ id: 'portrait', src: '/photo.jpg', alt: '个人照片' }]}
    />,
  )

  expect(screen.getByTestId('photo-panel')).toBeInTheDocument()
  expect(screen.getByAltText('个人照片')).toHaveAttribute('src', '/photo.jpg')
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'true')
})
