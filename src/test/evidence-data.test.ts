import resumeText from '../data/resume-text.txt?raw'
import {
  createEvidenceResolver,
  evidenceGroups,
  headerProfileGroup,
} from '../data/evidence'

const expectedAssetIds = [
  'profile-codex',
  'profile-github-2026',
  'education-thesis-proposal',
  'campus-aipo-competition',
  'campus-yourgen-project',
  'campus-yourgen-promotion-1',
  'campus-yourgen-promotion-2',
  'campus-waarzegger-short-film',
  'campus-event-organization',
  'campus-model-un-conference',
  'output-product-orchestration',
  'output-delivery-mechanism',
  'output-bilingual-review',
  'output-expert-agent-paas',
  'output-monsora-workbench',
  'output-cross-platform-capture',
  'output-automation-platform-1',
  'output-automation-platform-2',
  'output-team-knowledge-sharing',
]

test('registers all 19 supplied assets in 15 semantic groups', () => {
  const assets = evidenceGroups.flatMap((group) => group.assets)

  expect(evidenceGroups).toHaveLength(15)
  expect(new Set(evidenceGroups.map((group) => group.id)).size).toBe(15)
  expect(assets.map((asset) => asset.id)).toEqual(expectedAssetIds)
  expect(new Set(assets.map((asset) => asset.id)).size).toBe(19)
  expect(assets.every((asset) => asset.width > 0 && asset.height > 0)).toBe(true)
})

test('preserves the supplied per-location counts and image order', () => {
  const assetsAt = (location: 'header' | 'education' | 'campus' | 'work') =>
    evidenceGroups
      .filter((group) => group.location === location)
      .flatMap((group) => group.assets)

  expect(assetsAt('header')).toHaveLength(2)
  expect(assetsAt('education')).toHaveLength(1)
  expect(assetsAt('campus')).toHaveLength(7)
  expect(assetsAt('work')).toHaveLength(9)
  expect(headerProfileGroup.assets.map((asset) => asset.id)).toEqual([
    'profile-codex',
    'profile-github-2026',
  ])
  expect(
    createEvidenceResolver('campus')(
      '语境YourGen——LLM+外语场景应用开发',
    )?.assets.map((asset) => asset.id),
  ).toEqual([
    'campus-yourgen-project',
    'campus-yourgen-promotion-1',
    'campus-yourgen-promotion-2',
  ])
  expect(
    createEvidenceResolver('work')('【自动化与技术研究】测试文本')?.assets.map(
      (asset) => asset.id,
    ),
  ).toEqual([
    'output-automation-platform-1',
    'output-automation-platform-2',
  ])
})

test('finds every non-header anchor in the frozen resume source', () => {
  for (const group of evidenceGroups.filter((item) => item.location !== 'header')) {
    expect(resumeText).toContain(group.anchor)
  }
})
