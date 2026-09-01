import type { EvidenceGroup } from '../data/evidence'

type EvidenceGalleryProps = {
  eager?: boolean
  group: EvidenceGroup
  variant: 'callout' | 'viewer'
}

export function EvidenceGallery({
  eager = false,
  group,
  variant,
}: EvidenceGalleryProps) {
  return (
    <div
      className={`resume-evidence-gallery resume-evidence-gallery--${variant}`}
      data-evidence-group={group.id}
      data-evidence-gallery-variant={variant}
      data-evidence-size={group.assets.length}
    >
      {group.assets.map((asset) => (
        <figure className="resume-evidence-item" key={asset.id}>
          <a
            aria-label={`查看${asset.caption}原图`}
            className="resume-evidence-link"
            href={asset.src}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt={asset.alt}
              data-evidence-image={asset.id}
              decoding="async"
              height={asset.height}
              loading={eager ? 'eager' : 'lazy'}
              src={asset.src}
              width={asset.width}
            />
          </a>
          <figcaption>{asset.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}
