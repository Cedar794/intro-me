import type { EvidencePresentationItem } from '../data/evidencePresentation'

export type EvidenceActivationHandler = (
  groupId: string,
  trigger: HTMLButtonElement,
) => void

type EvidenceAnchorProps = {
  item: EvidencePresentationItem
  onActivate?: EvidenceActivationHandler
  primary?: boolean
}

export function EvidenceAnchor({
  item,
  onActivate,
  primary = true,
}: EvidenceAnchorProps) {
  return (
    <button
      aria-label={'查看证据 ' + item.number + '：' + item.group.assets[0].caption}
      className={'evidence-anchor evidence-anchor--' + item.side}
      data-evidence-anchor-id={item.group.id}
      data-evidence-anchor-number={item.number}
      data-evidence-anchor-primary={primary ? 'true' : undefined}
      data-evidence-anchor-secondary={primary ? undefined : 'true'}
      data-evidence-side={item.side}
      onClick={(event) => onActivate?.(item.group.id, event.currentTarget)}
      type="button"
    />
  )
}
