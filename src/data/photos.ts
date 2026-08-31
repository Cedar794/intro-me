import type { PhotoItem } from './resumeTypes'

export const photos: PhotoItem[] = []

const previewPhoto: PhotoItem = {
  id: 'layout-preview',
  alt: '照片布局预览',
  src: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
      <rect width="360" height="480" fill="#f1f1f1"/>
      <circle cx="180" cy="165" r="72" fill="#c7c7c7"/>
      <path d="M72 430c8-103 51-154 108-154s100 51 108 154" fill="#c7c7c7"/>
    </svg>
  `)}`,
}

export function getPreviewPhotos(): PhotoItem[] {
  if (!import.meta.env.DEV || typeof window === 'undefined') return []
  const previewEnabled = new URLSearchParams(window.location.search).get('photoPreview') === '1'
  return previewEnabled ? [previewPhoto] : []
}
