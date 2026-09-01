import type { EvidenceAsset } from '../data/evidence'

type PhotoPanelProps = {
  photos: EvidenceAsset[]
}

export function PhotoPanel({ photos }: PhotoPanelProps) {
  if (photos.length === 0) return null

  return (
    <div className="photo-panel" data-testid="photo-panel">
      {photos.map((photo) => (
        <figure className="photo-panel-item" key={photo.id}>
          <a
            aria-label={`查看${photo.caption}原图`}
            className="resume-evidence-link"
            href={photo.src}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt={photo.alt}
              data-evidence-image={photo.id}
              decoding="async"
              height={photo.height}
              loading="eager"
              src={photo.src}
              width={photo.width}
            />
          </a>
          <figcaption>{photo.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}
