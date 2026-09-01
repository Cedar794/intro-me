# Resume Evidence Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all 19 user-supplied profile and work-evidence images to their approved resume locations with desktop side-by-side comparison, mobile stacking, campus-radar detail integration, and clean image-free print output.

**Architecture:** Keep the generated resume data immutable and add a separate typed evidence registry whose groups resolve against exact source-text anchors. Reusable `EvidenceGallery` and `ResumeEvidencePair` components attach media locally to header, education, campus, and OUTPUT render paths; CSS widens only the on-screen evidence layout and collapses it responsively. Print hides evidence and restores the existing A4 text flow.

**Tech Stack:** React 19, TypeScript, Vite 8, plain CSS, Vitest, React Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-01-resume-evidence-gallery-design.md`

## Global Constraints

- Do not modify `src/data/resume.generated.ts`, `src/data/resume-source.xml`, `src/data/resume-text.txt`, or `src/data/resume-links.json`.
- Use exactly 19 supplied images: header 2, education 1, campus 7, OUTPUT 9.
- Use exactly 15 evidence groups: header 1, education 1, campus 5, OUTPUT 8.
- Captions and alt text use only the user's supplied labels; do not infer screenshot metrics, identities, dates, or claims.
- Desktop renders exact resume copy on the left and its evidence on the right; at `840px` and below, copy renders before evidence.
- Keep the existing campus hover/focus/tap interaction and automatic exit behavior; do not add a close button.
- Do not add a carousel, lightbox, sticky gallery, masonry wall, image editing, animation, backend, route, or dependency.
- `@media print` hides all evidence and restores the existing clean A4 resume without empty media columns.
- Use imported local assets so Vite preserves GitHub Pages-compatible relative URLs.
- Every task follows red-green-refactor, runs its scoped tests, and ends with a focused commit.

---

## File Structure

### Create

- `src/assets/evidence/` — 19 immutable copies of the supplied originals, renamed semantically.
- `src/data/evidence.ts` — evidence types, complete registry, header group, and location-scoped resolver.
- `src/components/EvidenceGallery.tsx` — accessible linked image/caption rendering for one evidence group.
- `src/components/ResumeEvidencePair.tsx` — conditional copy-left/evidence-right layout boundary.
- `src/test/evidence-data.test.ts` — inventory, grouping, order, anchor, and uniqueness tests.

### Modify

- `src/data/photos.ts` — production header photos come from the header evidence group; development preview remains available.
- `src/data/resumeTypes.ts` — remove the obsolete `PhotoItem` type after consumers use `EvidenceAsset`.
- `src/App.tsx` — pass the registry and production header assets into the document layout.
- `src/components/PhotoPanel.tsx` — render linked, dimensioned, eager header evidence.
- `src/components/ResumePhotoLayout.tsx` — pass content evidence into `ResumeDocument` and expose evidence mode.
- `src/components/ResumeDocument.tsx` — create education/work/campus resolvers and route them to the correct render paths.
- `src/components/ResumeBlockRenderer.tsx` — attach evidence to matching paragraphs and lists without changing source lines.
- `src/components/NestedList.tsx` — attach evidence to exact matching recursive list items.
- `src/components/CampusCapabilityRadar.tsx` — render mapped campus media inside the active light-field detail.
- `src/styles.css` — wide evidence sheet, galleries, local pairs, responsive stacking, campus detail sizing, and print hiding.
- `src/test/photo-layout.test.tsx` — header order, link, dimension, empty-state, and evidence-mode tests.
- `src/test/resume-render.test.tsx` — exact education/work/campus binding and unchanged source-text tests.
- `e2e/resume.spec.ts` — desktop/mobile placement, asset loading, campus evidence, full-size links, overflow, and print tests.

---

### Task 1: Copy Assets And Build The Evidence Registry

**Files:**
- Create: `src/assets/evidence/*`
- Create: `src/data/evidence.ts`
- Create: `src/test/evidence-data.test.ts`

**Interfaces:**
- Consumes: Vite static asset imports and the frozen `src/data/resume-text.txt` fixture.
- Produces: `EvidenceLocation`, `EvidenceAsset`, `EvidenceGroup`, `EvidenceResolver`, `evidenceGroups`, `headerProfileGroup`, and `createEvidenceResolver(location, groups?)`.

- [ ] **Step 1: Write the failing registry test**

Create `src/test/evidence-data.test.ts`:

```ts
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
    createEvidenceResolver('campus')('语境YourGen——LLM+外语场景应用开发')
      ?.assets.map((asset) => asset.id),
  ).toEqual([
    'campus-yourgen-project',
    'campus-yourgen-promotion-1',
    'campus-yourgen-promotion-2',
  ])
  expect(
    createEvidenceResolver('work')('【自动化与技术研究】测试文本')
      ?.assets.map((asset) => asset.id),
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
```

- [ ] **Step 2: Run the registry test and verify red state**

Run:

```bash
npx vitest run src/test/evidence-data.test.ts
```

Expected: FAIL because `src/data/evidence.ts` does not exist.

- [ ] **Step 3: Copy all 19 originals with semantic filenames**

Run:

```bash
mkdir -p src/assets/evidence
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-03e413b4-7f06-4a2a-ba6e-465872a02676.png src/assets/evidence/profile-codex.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-b2e5b7d5-e4ab-4a5a-a21a-a030a6965253.png src/assets/evidence/profile-github-2026.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-fe8858a5-bcf6-4942-bbe0-cd0c62e3046c.png src/assets/evidence/education-thesis-proposal.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-cbe34263-d4e0-43de-998c-8480b2aa376a.jpg src/assets/evidence/campus-aipo-competition.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-65c4948d-0591-4698-85ef-c1af6c33fb39.jpg src/assets/evidence/campus-yourgen-project.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-a588f703-4ded-4ef0-8d63-73e07b417dc9.jpg src/assets/evidence/campus-yourgen-promotion-1.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-5e5228ca-8473-46fc-9732-be1ab0360a0e.jpg src/assets/evidence/campus-yourgen-promotion-2.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-3a579dfd-f7ac-44fd-b706-549d5cd5e7cb.jpg src/assets/evidence/campus-waarzegger-short-film.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-1485279a-1157-4f59-b690-f81f8fabf773.jpg src/assets/evidence/campus-event-organization.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-aca1c285-061e-4ee4-892e-9c0f41c5b157.jpg src/assets/evidence/campus-model-un-conference.jpg
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-7c478588-a2fd-4e38-a992-30d94db395b8.png src/assets/evidence/output-product-orchestration.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-032ce20c-ca4a-4cd2-934c-a00b517f2df1.png src/assets/evidence/output-delivery-mechanism.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-13c1fcc0-9bf0-417d-b5f4-48db8114a5e6.png src/assets/evidence/output-bilingual-review.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-6823a7b2-42e7-4029-929b-86201ff95744.png src/assets/evidence/output-expert-agent-paas.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-e419dcc2-68ac-4303-a8e7-52cedb4afacb.png src/assets/evidence/output-monsora-workbench.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-788519dd-8d24-40f5-82cc-4db91de5546b.png src/assets/evidence/output-cross-platform-capture.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-57a384f3-5367-4070-a2c5-5d334ae1893f.png src/assets/evidence/output-automation-platform-1.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-8dfef794-f574-423b-9d6c-227c74a0e776.png src/assets/evidence/output-automation-platform-2.png
cp /var/folders/xw/tl39gxl55slg633rbczq26pr0000gn/T/codex-clipboard-e693a5de-eeff-4864-b9d4-81a946bab708.png src/assets/evidence/output-team-knowledge-sharing.png
```

Confirm exactly 19 files:

```bash
find src/assets/evidence -type f | sort
```

Expected: 19 semantic asset paths and no other files.

- [ ] **Step 4: Implement the typed registry and resolver**

Create `src/data/evidence.ts` with the four exported types, 15 groups in the inventory order from the spec, and a resolver that is location-scoped:

```ts
import profileCodex from '../assets/evidence/profile-codex.png'
import profileGithub from '../assets/evidence/profile-github-2026.png'
import educationThesis from '../assets/evidence/education-thesis-proposal.png'
import campusAipo from '../assets/evidence/campus-aipo-competition.jpg'
import campusYourgen from '../assets/evidence/campus-yourgen-project.jpg'
import campusYourgenPromotion1 from '../assets/evidence/campus-yourgen-promotion-1.jpg'
import campusYourgenPromotion2 from '../assets/evidence/campus-yourgen-promotion-2.jpg'
import campusWaarzegger from '../assets/evidence/campus-waarzegger-short-film.jpg'
import campusEvent from '../assets/evidence/campus-event-organization.jpg'
import campusModelUn from '../assets/evidence/campus-model-un-conference.jpg'
import outputProduct from '../assets/evidence/output-product-orchestration.png'
import outputDelivery from '../assets/evidence/output-delivery-mechanism.png'
import outputBilingual from '../assets/evidence/output-bilingual-review.png'
import outputAgentPaas from '../assets/evidence/output-expert-agent-paas.png'
import outputMonsora from '../assets/evidence/output-monsora-workbench.png'
import outputCapture from '../assets/evidence/output-cross-platform-capture.png'
import outputAutomation1 from '../assets/evidence/output-automation-platform-1.png'
import outputAutomation2 from '../assets/evidence/output-automation-platform-2.png'
import outputTeam from '../assets/evidence/output-team-knowledge-sharing.png'

export type EvidenceLocation = 'header' | 'education' | 'campus' | 'work'

export type EvidenceAsset = {
  id: string
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export type EvidenceGroup = {
  id: string
  anchor: string
  location: EvidenceLocation
  assets: EvidenceAsset[]
}

export type EvidenceResolver = (sourceText: string) => EvidenceGroup | undefined

const asset = (
  id: string,
  src: string,
  caption: string,
  width: number,
  height: number,
): EvidenceAsset => ({ id, src, alt: `${caption}图片`, caption, width, height })

export const evidenceGroups: EvidenceGroup[] = [
  {
    id: 'header-profiles',
    anchor: 'opening personal header',
    location: 'header',
    assets: [
      asset('profile-codex', profileCodex, 'Codex Profile', 783, 732),
      asset('profile-github-2026', profileGithub, '今年的 GitHub Profile', 1127, 713),
    ],
  },
  {
    id: 'education-thesis',
    anchor: '毕业设计研究方向',
    location: 'education',
    assets: [asset('education-thesis-proposal', educationThesis, '毕业设计开题节选', 1358, 1604)],
  },
  {
    id: 'campus-aipo',
    anchor: 'Way to AGI——AIPO校园创投大赛',
    location: 'campus',
    assets: [asset('campus-aipo-competition', campusAipo, '校园 AIPO 比赛', 1440, 960)],
  },
  {
    id: 'campus-yourgen',
    anchor: '语境YourGen——LLM+外语场景应用开发',
    location: 'campus',
    assets: [
      asset('campus-yourgen-project', campusYourgen, '语境项目', 1620, 1080),
      asset('campus-yourgen-promotion-1', campusYourgenPromotion1, '地推+YourGen项目', 1706, 1280),
      asset('campus-yourgen-promotion-2', campusYourgenPromotion2, '地推+YourGen项目2', 1706, 1280),
    ],
  },
  {
    id: 'campus-waarzegger',
    anchor: '荷兰语原创短剧《Waarzegger Kenneth》执导',
    location: 'campus',
    assets: [asset('campus-waarzegger-short-film', campusWaarzegger, 'Waarzegger短剧', 1200, 3837)],
  },
  {
    id: 'campus-event',
    anchor: '校企活动组织力',
    location: 'campus',
    assets: [asset('campus-event-organization', campusEvent, '校园活动举办', 1600, 1200)],
  },
  {
    id: 'campus-model-un',
    anchor: '模拟联合国大会——长期活跃的模联选手',
    location: 'campus',
    assets: [asset('campus-model-un-conference', campusModelUn, '模联大会', 1920, 1280)],
  },
  {
    id: 'output-product',
    anchor: '【产品统筹】',
    location: 'work',
    assets: [asset('output-product-orchestration', outputProduct, 'OUTPUT 产品统筹', 1004, 783)],
  },
  {
    id: 'output-delivery',
    anchor: '【交付机制建设】',
    location: 'work',
    assets: [asset('output-delivery-mechanism', outputDelivery, 'OUTPUT 交付机制建设', 2919, 3223)],
  },
  {
    id: 'output-bilingual',
    anchor: '【双语评审规模化交付】',
    location: 'work',
    assets: [asset('output-bilingual-review', outputBilingual, '双语评审规模化交付', 1240, 997)],
  },
  {
    id: 'output-agent-paas',
    anchor: '【Expert Agent PaaS】',
    location: 'work',
    assets: [asset('output-expert-agent-paas', outputAgentPaas, 'Expert Agent PaaS', 377, 447)],
  },
  {
    id: 'output-monsora',
    anchor: '【Monsora 多模态资产工作台】',
    location: 'work',
    assets: [asset('output-monsora-workbench', outputMonsora, 'Monsora 多模态资产工作台', 1485, 1063)],
  },
  {
    id: 'output-capture',
    anchor: '【跨平台资产捕捉】',
    location: 'work',
    assets: [asset('output-cross-platform-capture', outputCapture, '跨平台资产捕捉', 1182, 1013)],
  },
  {
    id: 'output-automation',
    anchor: '【自动化与技术研究】',
    location: 'work',
    assets: [
      asset('output-automation-platform-1', outputAutomation1, '自动化平台1', 1026, 1019),
      asset('output-automation-platform-2', outputAutomation2, '自动化平台2', 1028, 1046),
    ],
  },
  {
    id: 'output-team',
    anchor: '【团队建设与知识共享】',
    location: 'work',
    assets: [asset('output-team-knowledge-sharing', outputTeam, '团队建设与知识共享', 1158, 373)],
  },
]

export const headerProfileGroup = evidenceGroups[0]

export function createEvidenceResolver(
  location: EvidenceLocation,
  groups: EvidenceGroup[] = evidenceGroups,
): EvidenceResolver {
  const scopedGroups = groups.filter((group) => group.location === location)
  return (sourceText) => scopedGroups.find((group) => sourceText.includes(group.anchor))
}
```

- [ ] **Step 5: Run the registry test and verify green state**

Run:

```bash
npx vitest run src/test/evidence-data.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit the registry and binary assets**

```bash
git add src/assets/evidence src/data/evidence.ts src/test/evidence-data.test.ts
git commit -m "feat: add resume evidence registry"
```

---

### Task 2: Render The Two Header Profiles And Reusable Evidence Primitives

**Files:**
- Create: `src/components/EvidenceGallery.tsx`
- Create: `src/components/ResumeEvidencePair.tsx`
- Modify: `src/data/photos.ts`
- Modify: `src/data/resumeTypes.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/PhotoPanel.tsx`
- Modify: `src/components/ResumePhotoLayout.tsx`
- Modify: `src/components/ResumeDocument.tsx`
- Modify: `src/styles.css:39-63,823-846`
- Modify: `src/test/photo-layout.test.tsx`

**Interfaces:**
- Consumes: `EvidenceAsset`, `EvidenceGroup`, `evidenceGroups`, and `headerProfileGroup` from Task 1.
- Produces: `EvidenceGallery({ group, eager? })`, `ResumeEvidencePair({ children, group, eager? })`, and `ResumePhotoLayout({ document, photos, evidenceGroups })`.

- [ ] **Step 1: Write failing header and primitive tests**

Update the Testing Library import to include `within`, update the configured fixture so it includes `caption`, `width`, and `height`, then add assertions:

```tsx
import { evidenceGroups, headerProfileGroup } from '../data/evidence'

test('renders the two production profiles in supplied order as full-size links', () => {
  render(
    <ResumePhotoLayout
      document={resume}
      evidenceGroups={evidenceGroups}
      photos={headerProfileGroup.assets}
    />,
  )

  const panel = screen.getByTestId('photo-panel')
  const images = within(panel).getAllByRole('img')
  expect(images.map((image) => image.getAttribute('alt'))).toEqual([
    'Codex Profile图片',
    '今年的 GitHub Profile图片',
  ])
  expect(images[0]).toHaveAttribute('width', '783')
  expect(images[0]).toHaveAttribute('height', '732')
  expect(images[0]).toHaveAttribute('loading', 'eager')
  expect(within(panel).getAllByRole('link')).toHaveLength(2)
  expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-evidence', 'true')
})
```

Retain the existing empty-photo test and expect both `data-has-photos="false"` and `data-has-evidence="false"` when `photos={[]}` and `evidenceGroups={[]}`.

- [ ] **Step 2: Run the header test and verify red state**

Run:

```bash
npx vitest run src/test/photo-layout.test.tsx
```

Expected: FAIL because the evidence props, attributes, and components are not implemented.

- [ ] **Step 3: Implement `EvidenceGallery` and `ResumeEvidencePair`**

Create `src/components/EvidenceGallery.tsx`:

```tsx
import type { EvidenceGroup } from '../data/evidence'

export function EvidenceGallery({
  eager = false,
  group,
}: {
  eager?: boolean
  group: EvidenceGroup
}) {
  return (
    <div
      className="resume-evidence-gallery"
      data-evidence-group={group.id}
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
```

Create `src/components/ResumeEvidencePair.tsx`:

```tsx
import type { ReactNode } from 'react'
import type { EvidenceGroup } from '../data/evidence'
import { EvidenceGallery } from './EvidenceGallery'

export function ResumeEvidencePair({
  children,
  eager = false,
  group,
}: {
  children: ReactNode
  eager?: boolean
  group: EvidenceGroup
}) {
  return (
    <div className="resume-evidence-pair" data-evidence-anchor={group.anchor}>
      <div className="resume-evidence-copy">{children}</div>
      <EvidenceGallery eager={eager} group={group} />
    </div>
  )
}
```

- [ ] **Step 4: Wire header data and remove the obsolete photo type**

Change `src/data/photos.ts` to import `EvidenceAsset` and `headerProfileGroup`, export `photos = headerProfileGroup.assets`, and give the development preview `caption`, `width: 360`, and `height: 480`.

Change `PhotoPanel` to accept `EvidenceAsset[]`, wrap each image in a local link, set `loading="eager"`, `decoding="async"`, source dimensions, `data-evidence-image`, and the existing caption.

Change `ResumePhotoLayout` to accept `evidenceGroups: EvidenceGroup[] = []`, pass them to `ResumeDocument`, and set evidence mode when either header photos or content groups exist.

Change `ResumeDocument` to accept `evidenceGroups: EvidenceGroup[] = []` and add:

```tsx
data-has-evidence={String(hasHeaderAside || evidenceGroups.length > 0)}
```

Change `App.tsx` to pass the complete registry:

```tsx
<ResumePhotoLayout
  document={resume}
  evidenceGroups={evidenceGroups}
  photos={visiblePhotos}
/>
```

Delete the unused `PhotoItem` definition from `src/data/resumeTypes.ts` after all consumers import `EvidenceAsset`.

- [ ] **Step 5: Add base evidence and header styling**

Add to `src/styles.css`:

```css
.resume-sheet[data-has-evidence="true"] {
  width: min(1180px, 100%);
}

.resume-evidence-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(130px, 100%), 1fr));
  gap: 10px;
  min-width: 0;
}

.resume-evidence-item {
  min-width: 0;
  margin: 0;
}

.resume-evidence-link {
  display: block;
  border-radius: 4px;
  outline-offset: 3px;
}

.resume-evidence-link img,
.photo-panel img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 340px;
  object-fit: contain;
  background: #fafafa;
  border: 1px solid #d6d9de;
  border-radius: 4px;
}

.resume-evidence-item figcaption,
.photo-panel figcaption {
  margin-top: 4px;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.45;
}
```

Keep `.photo-panel` as a simple vertical grid and remove its old `object-fit: cover` rule.

- [ ] **Step 6: Run scoped unit tests and build**

Run:

```bash
npx vitest run src/test/evidence-data.test.ts src/test/photo-layout.test.tsx
npm run build
```

Expected: all scoped tests PASS and the Vite build emits the 19 hashed evidence assets.

- [ ] **Step 7: Commit reusable evidence rendering**

```bash
git add src/App.tsx src/components/EvidenceGallery.tsx src/components/PhotoPanel.tsx src/components/ResumeDocument.tsx src/components/ResumeEvidencePair.tsx src/components/ResumePhotoLayout.tsx src/data/photos.ts src/data/resumeTypes.ts src/styles.css src/test/photo-layout.test.tsx
git commit -m "feat: add profile evidence panel"
```

---

### Task 3: Bind Education And OUTPUT Evidence To Exact Resume Text

**Files:**
- Modify: `src/components/ResumeDocument.tsx`
- Modify: `src/components/ResumeBlockRenderer.tsx`
- Modify: `src/components/NestedList.tsx`
- Modify: `src/styles.css`
- Modify: `src/test/resume-render.test.tsx`

**Interfaces:**
- Consumes: `createEvidenceResolver`, `EvidenceResolver`, `EvidenceGallery`, and `ResumeEvidencePair`.
- Produces: `ResumeBlockRenderer({ block, emphasizeResults?, evidenceResolver? })` and `NestedList({ block, emphasizeResults?, evidenceResolver?, path? })`.

- [ ] **Step 1: Write failing education and OUTPUT binding tests**

Extend `src/test/resume-render.test.tsx`:

```tsx
import { evidenceGroups } from '../data/evidence'

test('binds education and OUTPUT evidence to exact copy without changing source lines', () => {
  const { container } = render(
    <ResumeDocument document={resume} evidenceGroups={evidenceGroups} />,
  )

  expect(
    screen.getByTestId('resume-sheet').querySelectorAll('[data-evidence-image]'),
  ).toHaveLength(17)

  const thesisPair = container.querySelector(
    '[data-evidence-anchor="毕业设计研究方向"]',
  )
  expect(thesisPair).toHaveTextContent('毕业设计研究方向')
  expect(thesisPair?.querySelector('[data-evidence-image="education-thesis-proposal"]'))
    .toBeInTheDocument()

  const productPair = container.querySelector('[data-evidence-anchor="【产品统筹】"]')
  expect(productPair).toHaveTextContent('【产品统筹】')
  expect(productPair?.querySelector('[data-evidence-image="output-product-orchestration"]'))
    .toBeInTheDocument()

  const automationPair = container.querySelector(
    '[data-evidence-anchor="【自动化与技术研究】"]',
  )
  expect(
    Array.from(automationPair?.querySelectorAll('[data-evidence-image]') ?? []).map(
      (image) => image.getAttribute('data-evidence-image'),
    ),
  ).toEqual([
    'output-automation-platform-1',
    'output-automation-platform-2',
  ])
})
```

In the existing source-fidelity test, render with `evidenceGroups={evidenceGroups}` and keep the comparison based only on `[data-resume-line]` elements. This ensures captions never alter the frozen resume copy.

- [ ] **Step 2: Run the binding test and verify red state**

Run:

```bash
npx vitest run src/test/resume-render.test.tsx
```

Expected: FAIL because body renderers do not yet resolve evidence.

- [ ] **Step 3: Add optional evidence resolution to paragraph and list rendering**

In `ResumeBlockRenderer`, add `evidenceResolver?: EvidenceResolver`. For ordinary paragraphs, build the existing `<p data-resume-line="true">` once, resolve `evidenceResolver?.(blockText)`, and return either the original paragraph or:

```tsx
<ResumeEvidencePair group={evidenceGroup}>{paragraph}</ResumeEvidencePair>
```

Do not wrap keyword, tool-stack, work-metadata, heading, or spacer branches.

For list blocks, pass the resolver:

```tsx
<NestedList
  block={block}
  emphasizeResults={emphasizeResults}
  evidenceResolver={evidenceResolver}
/>
```

In `NestedList`, add `evidenceResolver?: EvidenceResolver`, derive `itemText = inlineText(item.content)`, create the existing source line, and conditionally wrap that line in `ResumeEvidencePair`. Pass the same resolver through every recursive child call.

- [ ] **Step 4: Route education and work resolvers from `ResumeDocument`**

Create the three scoped resolvers once:

```tsx
const educationEvidence = createEvidenceResolver('education', evidenceGroups)
const campusEvidence = createEvidenceResolver('campus', evidenceGroups)
const workEvidence = createEvidenceResolver('work', evidenceGroups)
```

Pass `campusEvidence` to the campus component for Task 4. For ordinary blocks, pass `educationEvidence` before the work-section heading and `workEvidence` after it:

```tsx
const evidenceResolver = workSectionIndex !== -1 && index > workSectionIndex
  ? workEvidence
  : educationEvidence
```

The exact anchors prevent non-education blocks before work from acquiring media.

- [ ] **Step 5: Add local pair styling**

Add:

```css
.resume-evidence-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 33%);
  gap: 30px;
  align-items: start;
  margin: 10px 0 14px;
}

.resume-evidence-copy {
  min-width: 0;
}

.resume-evidence-copy > :first-child {
  margin-top: 0;
}

.resume-evidence-copy > :last-child {
  margin-bottom: 0;
}
```

Keep list markers and nested children intact; do not use absolute positioning.

- [ ] **Step 6: Run fidelity and binding tests**

Run:

```bash
npx vitest run src/test/resume-render.test.tsx src/test/evidence-data.test.ts
```

Expected: all tests PASS, including the original exact-source comparison, six links, role capsules, and result emphasis.

- [ ] **Step 7: Commit education and work binding**

```bash
git add src/components/NestedList.tsx src/components/ResumeBlockRenderer.tsx src/components/ResumeDocument.tsx src/styles.css src/test/resume-render.test.tsx
git commit -m "feat: pair resume evidence with source copy"
```

---

### Task 4: Add Campus Evidence To The Existing Radar Detail State

**Files:**
- Modify: `src/components/CampusCapabilityRadar.tsx`
- Modify: `src/components/ResumeDocument.tsx`
- Modify: `src/styles.css:241-273,658-733,899-936`
- Modify: `src/test/resume-render.test.tsx`

**Interfaces:**
- Consumes: the `campusEvidence: EvidenceResolver` created in Task 3 and the unchanged radar state machine.
- Produces: `CampusCapabilityRadar({ heading, list, evidenceResolver? })` and campus detail groups attached to exact top-level and nested item anchors.

- [ ] **Step 1: Write failing campus mapping and exit-state tests**

Add to `src/test/resume-render.test.tsx`:

```tsx
test('reveals mapped campus evidence inside the active radar detail', () => {
  render(<ResumeDocument document={resume} evidenceGroups={evidenceGroups} />)

  const radar = screen.getByTestId('campus-radar')
  fireEvent.mouseEnter(
    within(radar).getByRole('button', { name: '创新创业赛事能力' }),
  )
  const innovationDetail = screen.getByTestId('campus-detail-0')
  expect(
    Array.from(innovationDetail.querySelectorAll('[data-evidence-image]')).map(
      (image) => image.getAttribute('data-evidence-image'),
    ),
  ).toEqual([
    'campus-yourgen-project',
    'campus-yourgen-promotion-1',
    'campus-yourgen-promotion-2',
  ])

  fireEvent.mouseLeave(radar)
  expect(innovationDetail).toHaveAttribute('aria-hidden', 'true')
})

test('maps organization title and AIPO child evidence without a close button', () => {
  render(<ResumeDocument document={resume} evidenceGroups={evidenceGroups} />)

  const radar = screen.getByTestId('campus-radar')
  fireEvent.click(within(radar).getByRole('button', { name: '校企活动组织力' }))
  const detail = screen.getByTestId('campus-detail-1')
  expect(
    Array.from(detail.querySelectorAll('[data-evidence-image]')).map(
      (image) => image.getAttribute('data-evidence-image'),
    ),
  ).toEqual(['campus-event-organization', 'campus-aipo-competition'])
  expect(screen.queryByRole('button', { name: '关闭校园经历详情' }))
    .not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run campus tests and verify red state**

Run:

```bash
npx vitest run src/test/resume-render.test.tsx -t "campus evidence|organization title"
```

Expected: FAIL because the radar detail does not receive an evidence resolver.

- [ ] **Step 3: Resolve top-level and nested campus items**

Add optional `evidenceResolver?: EvidenceResolver` props to `CampusCapabilityRadar` and `CampusDetail`.

Inside `CampusDetail`, resolve the title with `evidenceResolver?.(inlineText(item.content))`. Wrap the existing `<h3 data-resume-line="true">` in `ResumeEvidencePair` only when a title group exists. Pass the resolver to every child `NestedList` so AIPO, YourGen, Model UN, and Waarzegger bind at their original nesting level.

In `ResumeDocument`, pass the already-created campus resolver:

```tsx
<CampusCapabilityRadar
  evidenceResolver={campusEvidence}
  heading={block.content}
  key="campus-capability-radar"
  list={nextBlock}
/>
```

Do not change `activeIndex`, hover timers, pointer-outside dismissal, Escape dismissal, or button behavior.

- [ ] **Step 4: Make the light-field detail large enough for copy-plus-evidence**

Update the relevant CSS:

```css
.campus-radar {
  min-height: 470px;
}

.campus-radar-detail-layer {
  inset: 8% 4%;
}

.campus-radar-detail {
  max-height: 400px;
  padding: 30px 36px;
}

.campus-radar-detail .resume-evidence-pair {
  grid-template-columns: minmax(0, 1fr) minmax(230px, 36%);
  gap: 24px;
}

.campus-radar-detail .resume-evidence-link img {
  max-height: 180px;
}
```

Retain the transparent surface, radial white halo, marker-free lists, background blur, and automatic hover exit.

- [ ] **Step 5: Run the complete radar and fidelity suite**

Run:

```bash
npx vitest run src/test/resume-render.test.tsx
```

Expected: all existing and new radar tests PASS, including hover retention, leave dismissal, tap, outside tap, Escape, no close button, star-map structure, and exact source text.

- [ ] **Step 6: Commit campus integration**

```bash
git add src/components/CampusCapabilityRadar.tsx src/components/ResumeDocument.tsx src/styles.css src/test/resume-render.test.tsx
git commit -m "feat: show campus evidence in radar details"
```

---

### Task 5: Finish Responsive, Full-Size, And Print Behavior

**Files:**
- Modify: `src/styles.css:39-63,848-963,970-1126`
- Modify: `e2e/resume.spec.ts`

**Interfaces:**
- Consumes: `data-has-evidence`, `data-evidence-anchor`, `data-evidence-group`, and `data-evidence-image` from Tasks 2–4.
- Produces: verified desktop side-by-side placement, `840px` stacking, asset reachability, no overflow, and image-free A4 print.

- [ ] **Step 1: Write failing browser checks for all approved modes**

Update the default resume checks to expect one `photo-panel`, two header images, and 19 total `[data-evidence-image]` elements in the DOM. Keep the `?photoPreview=1` tests for the single development placeholder.

Add these checks to `e2e/resume.spec.ts`:

```ts
test('places mapped copy left of evidence on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  const pair = page.locator('[data-evidence-anchor="【产品统筹】"]')
  const copyBox = await pair.locator('.resume-evidence-copy').boundingBox()
  const galleryBox = await pair.locator('.resume-evidence-gallery').boundingBox()
  expect(copyBox).not.toBeNull()
  expect(galleryBox).not.toBeNull()
  expect(galleryBox!.x).toBeGreaterThanOrEqual(copyBox!.x + copyBox!.width)
})

test('stacks mapped evidence after copy on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const pair = page.locator('[data-evidence-anchor="【产品统筹】"]')
  const copyBox = await pair.locator('.resume-evidence-copy').boundingBox()
  const galleryBox = await pair.locator('.resume-evidence-gallery').boundingBox()
  expect(copyBox).not.toBeNull()
  expect(galleryBox).not.toBeNull()
  expect(galleryBox!.y).toBeGreaterThanOrEqual(copyBox!.y + copyBox!.height)
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
})

test('serves every local evidence asset and links to the original', async ({ page }) => {
  await page.goto('/')
  const images = page.locator('[data-evidence-image]')
  await expect(images).toHaveCount(19)

  const sources = await images.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLImageElement).src),
  )
  expect(new Set(sources).size).toBe(19)
  for (const source of sources) {
    const assetResponse = await page.request.get(source)
    expect(assetResponse.ok()).toBe(true)
  }

  const originalLink = page.getByRole('link', { name: '查看Codex Profile原图' })
  await expect(originalLink).toHaveAttribute('target', '_blank')
  const href = await originalLink.getAttribute('href')
  expect(href).not.toBeNull()
  const response = await page.request.get(new URL(href!, page.url()).href)
  expect(response.ok()).toBe(true)
})

test('hides all evidence and restores one-column A4 print flow', async ({ page }) => {
  await page.emulateMedia({ media: 'print' })
  await page.goto('/')

  await expect(page.getByTestId('photo-panel')).toBeHidden()
  await expect(page.locator('.resume-evidence-gallery')).toHaveCount(14)
  for (const gallery of await page.locator('.resume-evidence-gallery').all()) {
    await expect(gallery).toBeHidden()
  }
  const pairDisplay = await page
    .locator('[data-evidence-anchor="【产品统筹】"]')
    .evaluate((element) => window.getComputedStyle(element).display)
  expect(pairDisplay).toBe('block')
})
```

The 14 content galleries plus one header panel account for all 15 groups. Preserve the existing print assertions for border, shadow, role capsules, and visible campus text.

- [ ] **Step 2: Run the new browser checks and verify red state**

Run:

```bash
npx playwright test e2e/resume.spec.ts
```

Expected: placement and print tests FAIL until responsive and print rules are complete.

- [ ] **Step 3: Implement the `840px` stacking breakpoint**

Add a new evidence breakpoint before the existing `720px` block:

```css
@media (max-width: 840px) {
  .resume-header[data-has-photos="true"],
  .resume-evidence-pair,
  .campus-radar-detail .resume-evidence-pair {
    grid-template-columns: 1fr;
  }

  .resume-header[data-has-photos="true"] {
    gap: 18px;
  }

  .resume-header-aside,
  .photo-panel {
    width: min(460px, 100%);
  }

  .resume-evidence-pair {
    gap: 12px;
  }

  .campus-radar {
    min-height: 520px;
  }

  .campus-radar-detail {
    max-height: 450px;
    padding: 24px 22px;
  }

  .campus-radar-detail .resume-evidence-link img {
    max-height: 150px;
  }
}
```

Remove the duplicate header stacking and `240px` panel width from the existing `720px` block. Keep its edge-to-edge paper, typography, list indentation, and compact radar rules.

- [ ] **Step 4: Implement image-free print restoration**

Inside `@media print`, add:

```css
.photo-panel,
.resume-evidence-gallery {
  display: none !important;
}

.resume-header[data-has-photos="true"],
.resume-evidence-pair,
.campus-radar-detail .resume-evidence-pair {
  display: block;
}

.resume-sheet[data-has-evidence="true"] {
  width: auto;
}
```

Remove `.photo-panel-item` from print orphan/widow rules because the entire panel is hidden. Keep all campus details statically visible in print so the original resume text remains complete.

- [ ] **Step 5: Run browser checks and production build**

Run:

```bash
npx playwright test e2e/resume.spec.ts
npm run build
```

Expected: all browser tests PASS, all 19 images have non-zero natural width, desktop pairs are horizontal, mobile pairs are vertical, and print media contains no visible evidence.

- [ ] **Step 6: Commit responsive and print behavior**

```bash
git add e2e/resume.spec.ts src/styles.css
git commit -m "test: verify responsive resume evidence"
```

---

### Task 6: Full Regression And Production Review

**Files:**
- Modify only files implicated by a failing check.
- Review: `dist/`

**Interfaces:**
- Consumes: the complete feature from Tasks 1–5.
- Produces: a clean worktree with verified unit, browser, build, source-fidelity, responsive, and print behavior.

- [ ] **Step 1: Run the complete unit suite**

```bash
npm test
```

Expected: every Vitest test PASS, including resume XML transform, content fidelity, logos, role capsules, evidence registry, and radar interaction.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: TypeScript and Vite complete successfully; `dist/assets/` contains emitted evidence files and no missing import error.

- [ ] **Step 3: Run the complete browser suite**

```bash
npm run test:e2e
```

Expected: every Playwright test PASS at desktop, tablet, mobile, campus interaction, full-size link, and print modes.

- [ ] **Step 4: Verify repository hygiene and source immutability**

```bash
git diff --check
git status --short
git diff 8e6b960 -- src/data/resume.generated.ts src/data/resume-source.xml src/data/resume-text.txt src/data/resume-links.json
find src/assets/evidence -type f | wc -l
```

Expected:

- `git diff --check` prints nothing;
- the four source-of-truth files have no diff;
- the evidence directory count is `19`;
- only intended feature files are changed or committed.

- [ ] **Step 5: Perform the final visual acceptance pass**

Open the production page at desktop and mobile sizes and verify these concrete points:

1. Codex Profile appears before GitHub Profile in the opening right rail.
2. The thesis, each mapped OUTPUT statement, and the selected campus detail show only their assigned images.
3. Desktop copy is left of evidence; mobile copy is above evidence.
4. Moving away from the campus radar removes the detail state without a close control.
5. Captions use only supplied labels and all images open their originals.
6. Print preview shows the complete text resume and no evidence media or blank right column.

- [ ] **Step 6: Commit only if final verification required a correction**

If Step 1–5 required a code or test fix, stage only those files and commit:

```bash
git add src e2e
git commit -m "fix: complete resume evidence verification"
```

If no files changed, do not create an empty commit.
