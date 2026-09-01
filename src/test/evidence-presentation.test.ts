import { describe, expect, test } from 'vitest'
import { evidenceGroups } from '../data/evidence'
import {
  campusEvidenceGroupIdsByDimension,
  createEvidencePresentation,
} from '../data/evidencePresentation'

test('numbers groups in resume order and alternates right then left', () => {
  const items = createEvidencePresentation(evidenceGroups)
  expect(items.map((item) => item.group.id)).toEqual([
    'header-profiles', 'education-thesis', 'campus-yourgen', 'campus-event', 'campus-aipo',
    'campus-model-un', 'campus-waarzegger', 'output-product', 'output-delivery', 'output-bilingual',
    'output-agent-paas', 'output-monsora', 'output-capture', 'output-automation', 'output-team',
  ])
  expect(items.map((item) => item.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))
  expect(items.map((item) => item.side)).toEqual([
    'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left',
    'right', 'left', 'right', 'left', 'right',
  ])
})

test('maps campus evidence to the four always-visible dimensions', () => {
  expect(campusEvidenceGroupIdsByDimension).toEqual([
    ['campus-yourgen'], ['campus-event', 'campus-aipo'], ['campus-model-un'], ['campus-waarzegger'],
  ])
})
