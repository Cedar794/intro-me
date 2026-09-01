import type { EvidenceGroup } from './evidence'
export type EvidenceSide = 'left' | 'right'
export type EvidencePresentationItem = { group: EvidenceGroup; number: number; side: EvidenceSide }
const evidenceGroupOrder = ['header-profiles','education-thesis','campus-yourgen','campus-event','campus-aipo','campus-model-un','campus-waarzegger','output-product','output-delivery','output-bilingual','output-agent-paas','output-monsora','output-capture','output-automation','output-team'] as const
export const campusEvidenceGroupIdsByDimension = [['campus-yourgen'],['campus-event','campus-aipo'],['campus-model-un'],['campus-waarzegger']] as const
export function createEvidencePresentation(groups: EvidenceGroup[]): EvidencePresentationItem[] {
  const byId = new Map(groups.map((group) => [group.id, group]))
  return evidenceGroupOrder.map((groupId, index) => { const group = byId.get(groupId); if (!group) throw new Error('Missing evidence group: ' + groupId); return { group, number: index + 1, side: index % 2 === 0 ? 'right' : 'left' } })
}
export function findEvidencePresentation(groupId: string, items: EvidencePresentationItem[]): EvidencePresentationItem {
  const item = items.find((candidate) => candidate.group.id === groupId); if (!item) throw new Error('Missing evidence presentation: ' + groupId); return item
}
