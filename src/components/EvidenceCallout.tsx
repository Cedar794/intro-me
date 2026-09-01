import type { EvidencePresentationItem } from '../data/evidencePresentation'
import { EvidenceGallery } from './EvidenceGallery'

type EvidenceCalloutProps = {
  item: EvidencePresentationItem
  registerElement?: (groupId: string, element: HTMLElement | null) => void
}

export function EvidenceCallout({
  item,
  registerElement,
}: EvidenceCalloutProps) {
  return (
    <aside
      aria-label={'证据 ' + item.number + '：' + item.group.assets[0].caption}
      className={'evidence-callout evidence-callout--' + item.side}
      data-evidence-callout-id={item.group.id}
      data-evidence-number={item.number}
      data-evidence-side={item.side}
      data-testid={'evidence-callout-' + item.group.id}
      ref={(element) => registerElement?.(item.group.id, element)}
    >
      <span aria-hidden="true" className="evidence-callout-number">
        {item.number}
      </span>
      <EvidenceGallery
        eager={item.group.id === 'header-profiles'}
        group={item.group}
        variant="callout"
      />
    </aside>
  )
}
