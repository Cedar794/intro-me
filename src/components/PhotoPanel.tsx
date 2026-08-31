import type { PhotoItem } from '../data/resumeTypes'

type PhotoPanelProps = {
  photos: PhotoItem[]
}

export function PhotoPanel({ photos }: PhotoPanelProps) {
  if (photos.length === 0) return null

  return (
    <div className="photo-panel" data-testid="photo-panel">
      {photos.map((photo) => (
        <figure className="photo-panel-item" key={photo.id}>
          <img src={photo.src} alt={photo.alt} />
          {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}
