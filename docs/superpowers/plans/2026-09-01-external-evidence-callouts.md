# External Resume Evidence Callouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Move all 19 evidence images outside the resume sheet into alternating desktop rails with numbered leader lines, while narrow screens use numbered anchors and an accessible full-screen vertical viewer.

**Architecture:** Preserve the immutable resume and evidence sources, add a presentation-order layer, and replace inline evidence galleries with empty-text numbered anchor buttons. ResumeEvidenceCanvas owns exterior callouts, DOM measurement, collision-free placement, SVG lines, responsive mode switching, and the mobile viewer; ResumeDocument remains the pure paper surface.

**Tech Stack:** React 19, TypeScript 7, Vite 8, CSS, ResizeObserver, SVG, Vitest, Testing Library, Playwright

**Spec:** docs/superpowers/specs/2026-09-01-external-evidence-callouts-design.md

## Global Constraints

- Do not modify src/data/resume.generated.ts, src/data/resume-source.xml, src/data/resume-text.txt, or src/data/resume-links.json.
- Preserve all resume wording, punctuation, links, strong spans, section order, role capsules, tool logos, education tag, and campus star-map behavior.
- The production render must contain 15 evidence groups and 19 original local assets.
- The resume sheet must contain zero evidence images.
- Desktop starts with the header group on the right and alternates groups right/left in document order.
- Same-side callouts preserve document order and never overlap.
- Narrow mode renders no evidence images until an anchor opens the viewer.
- Multi-image viewer groups stack vertically; do not add a carousel.
- Print hides callouts, lines, anchors, and the viewer.
- Add no runtime dependency.
- Use strict TDD for every behavior change: write the test, observe the expected failure, implement minimally, rerun the targeted test, then run the relevant regression suite.
- Keep screenshots, traces, and temporary browser artifacts outside the repository.

---

## File Structure

**Create**

- src/data/evidencePresentation.ts — stable group order, number, side, and campus-dimension mapping.
- src/lib/computeEvidenceLayout.ts — pure alternating-rail placement and leader-line geometry.
- src/components/EvidenceAnchor.tsx — accessible empty-text numbered source button.
- src/components/EvidenceCallout.tsx — one exterior desktop evidence group.
- src/components/EvidenceLeaderLines.tsx — inert SVG polyline layer.
- src/components/EvidenceViewer.tsx — accessible narrow-screen full-screen viewer.
- src/components/ResumeEvidenceCanvas.tsx — sheet/callout composition and interaction state.
- src/hooks/useEvidenceLayout.ts — DOM measurement and ResizeObserver lifecycle.
- src/hooks/useMediaQuery.ts — reactive wide/narrow mode.
- src/test/evidence-presentation.test.ts — presentation order, numbering, side, and campus mapping.
- src/test/evidence-layout.test.ts — pure collision avoidance and geometry.
- src/test/evidence-canvas.test.tsx — sheet/callout ownership and anchor contracts.
- src/test/evidence-viewer.test.tsx — viewer group rendering, Escape, and focus restoration.

**Modify**

- src/App.tsx — render ResumeEvidenceCanvas.
- src/data/photos.ts — keep preview assets but expose them as header-group replacements.
- src/components/EvidenceGallery.tsx — support callout/viewer variants only.
- src/components/ResumeDocument.tsx — render source anchors and remove header aside/image ownership.
- src/components/ResumeHeader.tsx — restore the pure header and add the header evidence anchor.
- src/components/ResumeBlockRenderer.tsx — replace paragraph pairs with before/after anchors.
- src/components/NestedList.tsx — replace list-item pairs with before/after anchors.
- src/components/CampusCapabilityRadar.tsx — put primary anchors on dimension labels and secondary anchors in text detail; remove images.
- src/styles.css — pure A4 sheet, exterior canvas/rails/lines, anchor styling, viewer, print cleanup.
- src/test/resume-render.test.tsx — replace inline-gallery assertions with source-anchor assertions.
- e2e/resume.spec.ts — exterior geometry, mobile viewer, assets, radar, responsive, and print acceptance.

**Delete after replacements are green**

- src/components/ResumeEvidencePair.tsx
- src/components/PhotoPanel.tsx
- src/components/ResumePhotoLayout.tsx
- src/test/photo-layout.test.tsx

---

### Task 1: Define presentation order and collision-free rail geometry

**Files:**
- Create: src/data/evidencePresentation.ts
- Create: src/lib/computeEvidenceLayout.ts
- Create: src/test/evidence-presentation.test.ts
- Create: src/test/evidence-layout.test.ts

**Interfaces:**
- Consumes: EvidenceGroup[] from src/data/evidence.ts.
- Produces:
  - type EvidenceSide = 'left' | 'right'
  - type EvidencePresentationItem = { group: EvidenceGroup; number: number; side: EvidenceSide }
  - function createEvidencePresentation(groups: EvidenceGroup[]): EvidencePresentationItem[]
  - function findEvidencePresentation(groupId: string, items: EvidencePresentationItem[]): EvidencePresentationItem
  - const campusEvidenceGroupIdsByDimension: readonly (readonly string[])[]
  - function computeEvidenceLayout(input: EvidenceLayoutInput): EvidenceLayoutResult

- [ ] **Step 1: Write the failing presentation tests**

~~~ts
import { evidenceGroups } from '../data/evidence'
import {
  campusEvidenceGroupIdsByDimension,
  createEvidencePresentation,
} from '../data/evidencePresentation'

test('numbers groups in resume order and alternates right then left', () => {
  const items = createEvidencePresentation(evidenceGroups)

  expect(items.map((item) => item.group.id)).toEqual([
    'header-profiles',
    'education-thesis',
    'campus-yourgen',
    'campus-event',
    'campus-aipo',
    'campus-model-un',
    'campus-waarzegger',
    'output-product',
    'output-delivery',
    'output-bilingual',
    'output-agent-paas',
    'output-monsora',
    'output-capture',
    'output-automation',
    'output-team',
  ])
  expect(items.map((item) => item.number)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ])
  expect(items.map((item) => item.side)).toEqual([
    'right', 'left', 'right', 'left', 'right',
    'left', 'right', 'left', 'right', 'left',
    'right', 'left', 'right', 'left', 'right',
  ])
})

test('maps campus evidence to the four always-visible dimensions', () => {
  expect(campusEvidenceGroupIdsByDimension).toEqual([
    ['campus-yourgen'],
    ['campus-event', 'campus-aipo'],
    ['campus-model-un'],
    ['campus-waarzegger'],
  ])
})
~~~

Production mutation caught: reordering a group, starting alternation on the wrong side, or attaching AIPO to the wrong radar dimension.

- [ ] **Step 2: Run the presentation test and verify RED**

Run:

~~~bash
npm test -- --run src/test/evidence-presentation.test.ts
~~~

Expected: FAIL because evidencePresentation.ts does not exist.

- [ ] **Step 3: Implement the presentation model**

~~~ts
import type { EvidenceGroup } from './evidence'

export type EvidenceSide = 'left' | 'right'

export type EvidencePresentationItem = {
  group: EvidenceGroup
  number: number
  side: EvidenceSide
}

const evidenceGroupOrder = [
  'header-profiles',
  'education-thesis',
  'campus-yourgen',
  'campus-event',
  'campus-aipo',
  'campus-model-un',
  'campus-waarzegger',
  'output-product',
  'output-delivery',
  'output-bilingual',
  'output-agent-paas',
  'output-monsora',
  'output-capture',
  'output-automation',
  'output-team',
] as const

export const campusEvidenceGroupIdsByDimension = [
  ['campus-yourgen'],
  ['campus-event', 'campus-aipo'],
  ['campus-model-un'],
  ['campus-waarzegger'],
] as const

export function createEvidencePresentation(
  groups: EvidenceGroup[],
): EvidencePresentationItem[] {
  const groupsById = new Map(groups.map((group) => [group.id, group]))

  return evidenceGroupOrder.map((groupId, index) => {
    const group = groupsById.get(groupId)
    if (!group) {
      throw new Error('Missing evidence group: ' + groupId)
    }

    return {
      group,
      number: index + 1,
      side: index % 2 === 0 ? 'right' : 'left',
    }
  })
}

export function findEvidencePresentation(
  groupId: string,
  items: EvidencePresentationItem[],
): EvidencePresentationItem {
  const item = items.find((candidate) => candidate.group.id === groupId)
  if (!item) {
    throw new Error('Missing evidence presentation: ' + groupId)
  }
  return item
}
~~~

- [ ] **Step 4: Run the presentation tests and verify GREEN**

Run:

~~~bash
npm test -- --run src/test/evidence-presentation.test.ts src/test/evidence-data.test.ts
~~~

Expected: both files PASS; existing 15-group/19-asset order tests remain green.

- [ ] **Step 5: Write the failing pure layout tests**

~~~ts
import { computeEvidenceLayout } from '../lib/computeEvidenceLayout'

test('keeps same-side callouts ordered and separated by the requested gap', () => {
  const result = computeEvidenceLayout({
    canvasWidth: 1400,
    sheet: { left: 303, top: 0, width: 794, height: 1000 },
    entries: [
      {
        groupId: 'one',
        number: 1,
        side: 'right',
        anchor: { x: 1020, y: 100 },
        callout: { width: 240, height: 100 },
      },
      {
        groupId: 'three',
        number: 3,
        side: 'right',
        anchor: { x: 1030, y: 70 },
        callout: { width: 240, height: 120 },
      },
    ],
    railGap: 24,
    itemGap: 24,
    leadOffset: 24,
    outerPadding: 24,
  })

  expect(result.items.map((item) => item.top)).toEqual([76, 200])
  expect(result.items[1].top).toBeGreaterThanOrEqual(
    result.items[0].top + result.items[0].height + 24,
  )
})

test('places alternating sides outside the sheet and emits orthogonal points', () => {
  const result = computeEvidenceLayout({
    canvasWidth: 1400,
    sheet: { left: 303, top: 0, width: 794, height: 1000 },
    entries: [
      {
        groupId: 'right',
        number: 1,
        side: 'right',
        anchor: { x: 1060, y: 100 },
        callout: { width: 240, height: 80 },
      },
      {
        groupId: 'left',
        number: 2,
        side: 'left',
        anchor: { x: 330, y: 200 },
        callout: { width: 240, height: 80 },
      },
    ],
    railGap: 24,
    itemGap: 24,
    leadOffset: 24,
    outerPadding: 24,
  })

  const right = result.items[0]
  const left = result.items[1]

  expect(right.left).toBeGreaterThanOrEqual(303 + 794 + 24)
  expect(left.left + left.width).toBeLessThanOrEqual(303 - 24)
  expect(right.points[0]).toEqual({ x: 1060, y: 100 })
  expect(right.points.at(-1)?.x).toBe(right.left)
  expect(left.points.at(-1)?.x).toBe(left.left + left.width)
  expect(result.canvasHeight).toBe(1000)
})
~~~

Production mutation caught: placing a callout inside the paper, reordering same-side groups by geometry instead of document order, losing the 24 px collision gap, reversing the terminal side, or shrinking the canvas below the paper.

- [ ] **Step 6: Run the layout test and verify RED**

Run:

~~~bash
npm test -- --run src/test/evidence-layout.test.ts
~~~

Expected: FAIL because computeEvidenceLayout.ts does not exist.

- [ ] **Step 7: Implement the pure layout function**

~~~ts
import type { EvidenceSide } from '../data/evidencePresentation'

type Point = { x: number; y: number }
type Size = { width: number; height: number }
type Rect = Size & { left: number; top: number }

export type EvidenceLayoutEntry = {
  groupId: string
  number: number
  side: EvidenceSide
  anchor: Point
  callout: Size
}

export type EvidenceLayoutItem = {
  groupId: string
  number: number
  side: EvidenceSide
  top: number
  left: number
  width: number
  height: number
  points: Point[]
}

export type EvidenceLayoutInput = {
  canvasWidth: number
  sheet: Rect
  entries: EvidenceLayoutEntry[]
  railGap: number
  itemGap: number
  leadOffset: number
  outerPadding: number
}

export type EvidenceLayoutResult = {
  canvasHeight: number
  items: EvidenceLayoutItem[]
}

export function computeEvidenceLayout(
  input: EvidenceLayoutInput,
): EvidenceLayoutResult {
  const sheetRight = input.sheet.left + input.sheet.width
  const placed = new Map<string, EvidenceLayoutItem>()
  let canvasHeight = input.sheet.top + input.sheet.height

  for (const side of ['left', 'right'] as const) {
    let previousBottom = input.sheet.top

    const entries = input.entries.filter((entry) => entry.side === side)

    for (const entry of entries) {
      const top = Math.max(
        input.sheet.top,
        entry.anchor.y - input.leadOffset,
        previousBottom === input.sheet.top
          ? input.sheet.top
          : previousBottom + input.itemGap,
      )
      const left = side === 'left'
        ? input.sheet.left - input.railGap - entry.callout.width
        : sheetRight + input.railGap
      const endX = side === 'left'
        ? left + entry.callout.width
        : left
      const sheetEdgeX = side === 'left' ? input.sheet.left : sheetRight
      const calloutY = top + Math.min(entry.callout.height / 2, 32)
      const midX = (sheetEdgeX + endX) / 2

      const item: EvidenceLayoutItem = {
        groupId: entry.groupId,
        number: entry.number,
        side,
        top,
        left,
        width: entry.callout.width,
        height: entry.callout.height,
        points: [
          entry.anchor,
          { x: sheetEdgeX, y: entry.anchor.y },
          { x: midX, y: entry.anchor.y },
          { x: midX, y: calloutY },
          { x: endX, y: calloutY },
        ],
      }

      placed.set(entry.groupId, item)
      previousBottom = top + entry.callout.height
      canvasHeight = Math.max(
        canvasHeight,
        previousBottom + input.outerPadding,
      )
    }
  }

  return {
    canvasHeight,
    items: input.entries.map((entry) => placed.get(entry.groupId)!),
  }
}
~~~

- [ ] **Step 8: Run both new test files and verify GREEN**

Run:

~~~bash
npm test -- --run src/test/evidence-presentation.test.ts src/test/evidence-layout.test.ts
~~~

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

~~~bash
git add src/data/evidencePresentation.ts src/lib/computeEvidenceLayout.ts src/test/evidence-presentation.test.ts src/test/evidence-layout.test.ts
git commit -m "feat: define external evidence layout model"
~~~

---

### Task 2: Replace inline images with numbered source anchors

**Files:**
- Create: src/components/EvidenceAnchor.tsx
- Modify: src/components/ResumeBlockRenderer.tsx
- Modify: src/components/NestedList.tsx
- Modify: src/components/ResumeHeader.tsx
- Modify: src/components/ResumeDocument.tsx
- Modify: src/test/resume-render.test.tsx

**Interfaces:**
- Consumes: EvidenceGroup, EvidencePresentationItem, EvidenceResolver.
- Produces:
  - type EvidenceActivationHandler = (groupId: string, trigger: HTMLButtonElement) => void
  - EvidenceAnchor props: item, onActivate, primary
  - NestedList evidenceMode: 'inline' | 'primary-anchor' | 'secondary-anchor'
  - primary anchor selector: [data-evidence-anchor-primary='true']
  - secondary campus selector: [data-evidence-anchor-secondary='true']

- [ ] **Step 1: Replace the ordinary/header inline-gallery assertions with a failing anchor test**

Add to src/test/resume-render.test.tsx:

~~~tsx
test('replaces ordinary and header evidence with ten primary source anchors', () => {
  render(<ResumeDocument document={resume} evidenceGroups={evidenceGroups} />)

  const sheet = screen.getByTestId('resume-sheet')
  const primaryIds = Array.from(
    sheet.querySelectorAll('[data-evidence-anchor-primary="true"]'),
  ).map((anchor) => anchor.getAttribute('data-evidence-anchor-id'))

  expect(
    sheet.querySelectorAll(
      '[data-evidence-image^="education"], [data-evidence-image^="output"]',
    ),
  ).toHaveLength(0)
  expect(primaryIds).toEqual([
    'header-profiles',
    'education-thesis',
    'output-product',
    'output-delivery',
    'output-bilingual',
    'output-agent-paas',
    'output-monsora',
    'output-capture',
    'output-automation',
    'output-team',
  ])
  expect(
    sheet.querySelector('[data-evidence-anchor-id="output-product"]'),
  ).toHaveAttribute('aria-label', '查看证据 8：OUTPUT 产品统筹')
  expect(
    sheet.querySelector('[data-evidence-anchor-id="header-profiles"]'),
  ).toHaveAttribute('aria-label', '查看证据 1：Codex Profile')
})
~~~

Keep the frozen data-resume-line comparison test unchanged.

Production mutation caught: leaving an education/work image inline, dropping an ordinary/header anchor, or giving the wrong accessible number/caption. Campus inline evidence remains unchanged in this task and moves atomically in Task 3.

- [ ] **Step 2: Run the test and verify RED**

Run:

~~~bash
npm test -- --run src/test/resume-render.test.tsx
~~~

Expected: FAIL because ordinary evidence still renders through inline EvidenceGallery and EvidenceAnchor does not exist.

- [ ] **Step 3: Create EvidenceAnchor**

~~~tsx
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
~~~

The button intentionally has no text node. CSS later renders the visible number from data-evidence-anchor-number so data-resume-line text remains byte-for-byte faithful.

- [ ] **Step 4: Replace ResumeEvidencePair branches in ordinary paragraphs and lists**

In ResumeBlockRenderer and NestedList:

1. resolve the EvidenceGroup exactly as today;
2. convert it with findEvidencePresentation;
3. place the anchor before the source content for left groups and after for right groups;
4. pass onEvidenceActivate through recursive lists;
5. give NestedList an evidenceMode union of 'inline' | 'primary-anchor' | 'secondary-anchor', default it to 'inline', pass 'primary-anchor' from ResumeBlockRenderer, and preserve the value through recursion. This keeps campus detail inline until Task 3 while work-list anchors become primary.

Use this shape inside the existing paragraph and list-line elements:

~~~tsx
{evidenceItem?.side === 'left' ? (
  <EvidenceAnchor
    item={evidenceItem}
    onActivate={onEvidenceActivate}
  />
) : null}
<RichText nodes={block.content} emphasizeResults={emphasizeResults} />
{evidenceItem?.side === 'right' ? (
  <EvidenceAnchor
    item={evidenceItem}
    onActivate={onEvidenceActivate}
  />
) : null}
~~~

Do not wrap the paragraph or list item in a grid or evidence container.

- [ ] **Step 5: Restore the pure header and add the header anchor**

Change ResumeHeader to accept:

~~~ts
type ResumeHeaderProps = {
  blocks: ResumeBlock[]
  evidenceItem?: EvidencePresentationItem
  onEvidenceActivate?: EvidenceActivationHandler
}
~~~

Render the header anchor as a sibling at the end of resume-header-content. Remove aside, hasAside, resume-header-aside, and data-has-photos behavior. ResumeDocument passes the header-profiles item.

- [ ] **Step 6: Update ResumeDocument props and resolver wiring**

ResumeDocument keeps evidenceGroups and adds:

~~~ts
onEvidenceActivate?: EvidenceActivationHandler
~~~

Create presentation items once with createEvidencePresentation(evidenceGroups), pass them to ordinary renderers, and pass the header item to ResumeHeader. Keep data-has-evidence only if tests or print selectors still require it; it must no longer change the sheet width.

- [ ] **Step 7: Run the render test and verify GREEN for ordinary/header anchors**

Run:

~~~bash
npm test -- --run src/test/resume-render.test.tsx
~~~

Expected: the full file PASS. Ordinary/header evidence has ten primary anchors; existing campus inline behavior remains green until Task 3 replaces it.

- [ ] **Step 8: Commit Task 2**

~~~bash
git add src/components/EvidenceAnchor.tsx src/components/ResumeBlockRenderer.tsx src/components/NestedList.tsx src/components/ResumeHeader.tsx src/components/ResumeDocument.tsx src/test/resume-render.test.tsx
git commit -m "feat: replace inline evidence with source anchors"
~~~

---

### Task 3: Map campus evidence to stable radar anchors

**Files:**
- Modify: src/components/CampusCapabilityRadar.tsx
- Modify: src/components/NestedList.tsx
- Modify: src/components/ResumeDocument.tsx
- Modify: src/test/resume-render.test.tsx

**Interfaces:**
- Consumes: campusEvidenceGroupIdsByDimension, EvidencePresentationItem[], EvidenceActivationHandler.
- Produces: always-visible primary campus anchors on dimension labels and secondary exact-copy anchors inside detail.

- [ ] **Step 1: Write the failing campus anchor tests**

Replace image assertions in the campus tests with:

~~~tsx
test('anchors campus evidence to always-visible radar dimensions', () => {
  render(<ResumeDocument document={resume} evidenceGroups={evidenceGroups} />)

  const dimensions = screen.getByRole('group', { name: '校园能力维度' })
  const dimensionAnchors = Array.from(
    dimensions.querySelectorAll('[data-evidence-anchor-primary="true"]'),
  )

  expect(
    dimensionAnchors.map((anchor) => anchor.getAttribute('data-evidence-anchor-id')),
  ).toEqual([
    'campus-yourgen',
    'campus-event',
    'campus-aipo',
    'campus-model-un',
    'campus-waarzegger',
  ])
  expect(
    screen.getByTestId('resume-sheet').querySelectorAll(
      '[data-evidence-anchor-primary="true"]',
    ),
  ).toHaveLength(15)
  expect(screen.getByTestId('resume-sheet').querySelectorAll('img')).toHaveLength(0)
})

test('repeats exact campus numbers in detail without creating duplicate layout anchors', () => {
  render(<ResumeDocument document={resume} evidenceGroups={evidenceGroups} />)

  fireEvent.click(
    screen.getByRole('button', { name: '校企活动组织力' }),
  )
  const detail = screen.getByTestId('campus-detail-1')

  expect(
    Array.from(
      detail.querySelectorAll('[data-evidence-anchor-secondary="true"]'),
    ).map((anchor) => anchor.getAttribute('data-evidence-anchor-id')),
  ).toEqual(['campus-event', 'campus-aipo'])
  expect(
    detail.querySelectorAll('[data-evidence-anchor-primary="true"]'),
  ).toHaveLength(0)
})
~~~

Production mutation caught: lines measuring a hidden detail anchor, losing either organization evidence group, or rendering campus images inside the detail.

- [ ] **Step 2: Run the campus tests and verify RED**

Run:

~~~bash
npm test -- --run src/test/resume-render.test.tsx
~~~

Expected: FAIL because CampusCapabilityRadar still renders ResumeEvidencePair and has no dimension anchor mapping.

- [ ] **Step 3: Add primary anchors to dimension labels**

Pass presentationItems and onEvidenceActivate into CampusCapabilityRadar. For each dimension index, resolve campusEvidenceGroupIdsByDimension[index]. Keep each dimension as a real button, and render its evidence anchors as sibling controls inside a positioned wrapper so the DOM never nests a button inside another button.

~~~tsx
const dimensionItems = campusEvidenceGroupIdsByDimension[index].map(
  (groupId) => findEvidencePresentation(groupId, presentationItems),
)
const position = DIMENSION_POSITIONS[index]

<div
  className={'campus-radar-dimension-wrap campus-radar-dimension-wrap--' + position}
  onMouseMove={() => showDetails(index)}
>
  <button
    aria-controls={panelId}
    aria-expanded={active}
    className="campus-radar-dimension"
    onClick={() => showDetails(index)}
    onFocus={() => showDetails(index)}
    type="button"
  >
    <span className="campus-radar-dimension-label">
      <RichText nodes={item.content} />
    </span>
  </button>
  <span className="campus-dimension-evidence-anchors">
    {dimensionItems.map((evidenceItem) => (
      <EvidenceAnchor
        item={evidenceItem}
        key={evidenceItem.group.id}
        onActivate={onEvidenceActivate}
      />
    ))}
  </span>
</div>
~~~

Move the top/right/bottom/left positioning modifiers from the button to campus-radar-dimension-wrap; let the button fill that wrapper's label hit area. Keep the wrapper mouse hit area large, preserve the existing dimension button name, and keep the evidence anchors independently focusable.

- [ ] **Step 4: Render secondary anchors in detail text**

Remove ResumeEvidencePair from CampusDetail. Pass evidenceMode="secondary-anchor" through its NestedList calls and render any title evidence anchor with primary={false}. Secondary anchors stay on the exact source line, open the same viewer, and are excluded from desktop measurement.

- [ ] **Step 5: Run radar and render regressions**

Run:

~~~bash
npm test -- --run src/test/resume-render.test.tsx
npx playwright test e2e/resume.spec.ts -g "campus|radar"
~~~

Expected: campus anchor tests PASS and every existing hover, focus, tap, Escape, outside-dismiss, star-map, and white-light-field test remains PASS.

- [ ] **Step 6: Commit Task 3**

~~~bash
git add src/components/CampusCapabilityRadar.tsx src/components/NestedList.tsx src/components/ResumeDocument.tsx src/test/resume-render.test.tsx
git commit -m "feat: anchor campus evidence to radar dimensions"
~~~

---

### Task 4: Compose exterior callouts around a pure sheet

**Files:**
- Create: src/components/EvidenceCallout.tsx
- Create: src/components/ResumeEvidenceCanvas.tsx
- Create: src/test/evidence-canvas.test.tsx
- Modify: src/components/EvidenceGallery.tsx
- Modify: src/App.tsx
- Modify: src/data/photos.ts
- Delete: src/components/ResumeEvidencePair.tsx
- Delete: src/components/PhotoPanel.tsx
- Delete: src/components/ResumePhotoLayout.tsx
- Delete: src/test/photo-layout.test.tsx

**Interfaces:**
- Consumes: ResumeDocumentData, EvidenceGroup[], EvidenceAsset[] header replacement, EvidencePresentationItem[].
- Produces:
  - ResumeEvidenceCanvas props: document, evidenceGroups, headerAssets
  - callout selector: [data-evidence-callout-id]
  - callout side: data-evidence-side
  - all evidence images outside resume-sheet

- [ ] **Step 1: Write the failing canvas ownership tests**

~~~tsx
import { render, screen, within } from '@testing-library/react'
import { ResumeEvidenceCanvas } from '../components/ResumeEvidenceCanvas'
import { evidenceGroups, headerProfileGroup } from '../data/evidence'
import { resume } from '../data/resume'

test('renders every evidence image in exterior callouts and none in the sheet', () => {
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  const sheet = screen.getByTestId('resume-sheet')
  const canvas = screen.getByTestId('resume-evidence-canvas')
  const callouts = canvas.querySelectorAll('[data-evidence-callout-id]')

  expect(sheet.querySelectorAll('img')).toHaveLength(0)
  expect(callouts).toHaveLength(15)
  expect(canvas.querySelectorAll('[data-evidence-image]')).toHaveLength(19)
  expect(sheet.contains(callouts[0])).toBe(false)
})

test('preserves production profile order in the first exterior callout', () => {
  render(
    <ResumeEvidenceCanvas
      document={resume}
      evidenceGroups={evidenceGroups}
      headerAssets={headerProfileGroup.assets}
    />,
  )

  const headerCallout = screen.getByTestId('evidence-callout-header-profiles')
  expect(
    within(headerCallout).getAllByRole('img').map((image) => image.getAttribute('alt')),
  ).toEqual(['Codex Profile图片', '今年的 GitHub Profile图片'])
})
~~~

Production mutation caught: nesting a callout under article.resume-sheet, omitting an asset, or reversing Profile order.

- [ ] **Step 2: Run the canvas test and verify RED**

Run:

~~~bash
npm test -- --run src/test/evidence-canvas.test.tsx
~~~

Expected: FAIL because ResumeEvidenceCanvas and EvidenceCallout do not exist.

- [ ] **Step 3: Refactor EvidenceGallery variants**

Use one component for callout and viewer image rendering:

~~~ts
type EvidenceGalleryProps = {
  eager?: boolean
  group: EvidenceGroup
  variant: 'callout' | 'viewer'
}
~~~

Add data-evidence-gallery-variant and variant classes. Keep local original links, alt text, source dimensions, asset order, async decoding, and eager header loading.

- [ ] **Step 4: Create EvidenceCallout**

~~~tsx
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
~~~

- [ ] **Step 5: Create the initial ResumeEvidenceCanvas composition**

Replace the header-profiles assets with headerAssets while preserving the group id and caption metadata. Build presentation items from the effective groups. Render all callouts as siblings of ResumeDocument and pass onEvidenceActivate into the document.

The Task 4 canvas uses unpositioned rail containers; Task 5 replaces that temporary layout with measured absolute placement and lines.

- [ ] **Step 6: Update App and remove obsolete inline layout files**

App renders:

~~~tsx
<ResumeEvidenceCanvas
  document={resume}
  evidenceGroups={evidenceGroups}
  headerAssets={visiblePhotos}
/>
~~~

Delete ResumeEvidencePair, PhotoPanel, ResumePhotoLayout, and photo-layout.test only after imports are gone and the replacement canvas test is green.

- [ ] **Step 7: Run component and source-fidelity tests**

Run:

~~~bash
npm test -- --run src/test/evidence-canvas.test.tsx src/test/resume-render.test.tsx
~~~

Expected: PASS with 19 exterior images, zero sheet images, and unchanged frozen source text.

- [ ] **Step 8: Commit Task 4**

~~~bash
git add src/App.tsx src/data/photos.ts src/components/EvidenceGallery.tsx src/components/EvidenceCallout.tsx src/components/ResumeEvidenceCanvas.tsx src/test/evidence-canvas.test.tsx src/components/ResumeEvidencePair.tsx src/components/PhotoPanel.tsx src/components/ResumePhotoLayout.tsx src/test/photo-layout.test.tsx
git commit -m "feat: move resume evidence outside the sheet"
~~~

---

### Task 5: Measure callouts and draw exterior leader lines

**Files:**
- Create: src/components/EvidenceLeaderLines.tsx
- Create: src/hooks/useEvidenceLayout.ts
- Modify: src/components/ResumeEvidenceCanvas.tsx
- Modify: src/styles.css
- Modify: e2e/resume.spec.ts

**Interfaces:**
- Consumes: computeEvidenceLayout, primary anchor elements, sheet/callout/canvas refs.
- Produces:
  - hook result EvidenceLayoutResult | null
  - SVG polyline selector: [data-evidence-line-id]
  - positioned callouts with inline top/left
  - canvas min-height derived from layout.canvasHeight

- [ ] **Step 1: Write the failing desktop geometry browser test**

~~~ts
test('keeps every desktop evidence image outside the sheet in alternating rails', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const sheet = page.getByTestId('resume-sheet')
  const callouts = page.locator('[data-evidence-callout-id]')
  const lines = page.locator('[data-evidence-line-id]')
  const sheetBox = await sheet.boundingBox()

  expect(sheetBox).not.toBeNull()
  await expect(callouts).toHaveCount(15)
  await expect(lines).toHaveCount(15)

  for (let index = 0; index < 15; index += 1) {
    const callout = callouts.nth(index)
    const box = await callout.boundingBox()
    const side = await callout.getAttribute('data-evidence-side')
    const groupId = await callout.getAttribute('data-evidence-callout-id')
    const number = String(index + 1)
    const anchor = page.locator(
      '[data-evidence-anchor-primary="true"][data-evidence-anchor-id="' + groupId + '"]',
    )
    const line = page.locator('[data-evidence-line-id="' + groupId + '"]')

    expect(box).not.toBeNull()
    await expect(anchor).toHaveAttribute('data-evidence-anchor-number', number)
    await expect(line).toHaveAttribute('data-evidence-number', number)
    if (side === 'left') {
      expect(box!.x + box!.width).toBeLessThanOrEqual(sheetBox!.x)
    } else {
      expect(box!.x).toBeGreaterThanOrEqual(sheetBox!.x + sheetBox!.width)
    }
    expect(side).toBe(index % 2 === 0 ? 'right' : 'left')
  }
})

test('prevents same-side callout overlap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  for (const side of ['left', 'right']) {
    const boxes = await page
      .locator('[data-evidence-callout-id][data-evidence-side="' + side + '"]')
      .evaluateAll((nodes) =>
        nodes
          .map((node) => {
            const rect = node.getBoundingClientRect()
            return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY }
          })
          .sort((a, b) => a.top - b.top),
      )

    for (let index = 1; index < boxes.length; index += 1) {
      expect(boxes[index].top).toBeGreaterThanOrEqual(boxes[index - 1].bottom + 23)
    }
  }
})
~~~

Production mutation caught: returning to an inline column, swapping alternation, or allowing two same-side groups to collide.

- [ ] **Step 2: Run the desktop geometry test and verify RED**

Run:

~~~bash
npx playwright test e2e/resume.spec.ts -g "outside the sheet|callout overlap"
~~~

Expected: FAIL because callouts are not measured/positioned and leader lines do not exist.

- [ ] **Step 3: Create EvidenceLeaderLines**

~~~tsx
import type { EvidenceLayoutItem } from '../lib/computeEvidenceLayout'

export function EvidenceLeaderLines({
  items,
  width,
  height,
}: {
  items: EvidenceLayoutItem[]
  width: number
  height: number
}) {
  return (
    <svg
      aria-hidden="true"
      className="evidence-leader-lines"
      height={height}
      pointerEvents="none"
      viewBox={'0 0 ' + width + ' ' + height}
      width={width}
    >
      {items.map((item) => (
        <polyline
          className="evidence-leader-line"
          data-evidence-line-id={item.groupId}
          data-evidence-number={item.number}
          key={item.groupId}
          points={item.points.map((point) => point.x + ',' + point.y).join(' ')}
        />
      ))}
    </svg>
  )
}
~~~

- [ ] **Step 4: Implement useEvidenceLayout**

The hook accepts canvasRef, sheetRef, presentationItems, and a wide boolean. In useLayoutEffect:

1. query one primary anchor per group;
2. query one callout per group;
3. convert all getBoundingClientRect values to canvas-relative coordinates;
4. call computeEvidenceLayout with railGap=24, itemGap=24, leadOffset=24, and outerPadding=24;
5. observe canvas, sheet, primary anchors, and callouts when ResizeObserver exists; otherwise keep the initial measurement path for jsdom;
6. listen for document.fonts.ready when document.fonts exists, guarded by a disposed flag so a late promise cannot schedule work after cleanup;
7. schedule one requestAnimationFrame per invalidation;
8. clean up observers and frames.

Development builds warn with the exact group id and group.anchor text when a primary anchor or callout is missing. Narrow mode returns null and does not install observers.

- [ ] **Step 5: Apply layout in ResumeEvidenceCanvas**

Set canvas minHeight from layout.canvasHeight. Each callout receives top and left from its layout item and remains visibility:hidden until a complete result exists. Render EvidenceLeaderLines after the sheet and before callout links in stacking order.

- [ ] **Step 6: Replace inline-gallery CSS with exterior canvas CSS**

Implement these invariants:

- resume-sheet width is min(210mm, 100%); remove the 1180 px evidence width.
- resume-evidence-canvas is position:relative and centered.
- evidence-callout is position:absolute with width clamp(210px, calc((100vw - 210mm - 72px) / 2), 260px), so the 1320 px wide breakpoint still has two exterior rails without overflow.
- evidence images use object-fit:contain and a bounded callout preview height.
- leader SVG is absolute, inset:0, pointer-events:none.
- anchors render their number through .evidence-anchor::before { content: attr(data-evidence-anchor-number) }.
- left anchors appear before source content; right anchors after.
- no raised callout card background or shadow.

- [ ] **Step 7: Run the targeted browser tests and verify GREEN**

Run:

~~~bash
npx playwright test e2e/resume.spec.ts -g "outside the sheet|callout overlap"
~~~

Expected: PASS at 1440 px with 15 lines, 15 non-overlapping callouts, and all images outside the sheet.

- [ ] **Step 8: Run build and desktop regressions**

Run:

~~~bash
npm run build
npx playwright test e2e/resume.spec.ts -g "desktop|campus|radar|positions"
~~~

Expected: PASS.

- [ ] **Step 9: Commit Task 5**

~~~bash
git add src/components/EvidenceLeaderLines.tsx src/hooks/useEvidenceLayout.ts src/components/ResumeEvidenceCanvas.tsx src/styles.css e2e/resume.spec.ts
git commit -m "feat: connect exterior evidence with leader lines"
~~~

---

### Task 6: Add narrow-screen full-screen evidence viewer

**Files:**
- Create: src/components/EvidenceViewer.tsx
- Create: src/hooks/useMediaQuery.ts
- Create: src/test/evidence-viewer.test.tsx
- Modify: src/components/ResumeEvidenceCanvas.tsx
- Modify: src/components/EvidenceAnchor.tsx
- Modify: src/styles.css
- Modify: src/test/evidence-canvas.test.tsx
- Modify: e2e/resume.spec.ts

**Interfaces:**
- Consumes: selected EvidencePresentationItem and trigger element.
- Produces:
  - dialog selector: [data-evidence-viewer]
  - close control named 返回简历
  - wide query constant: (min-width: 1320px)
  - mobile default contains zero evidence images

- [ ] **Step 1: Write the failing viewer component tests**

Use a stateful test harness rather than asserting only on mocks:

~~~tsx
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useRef, useState } from 'react'

function ViewerHarness() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const item = createEvidencePresentation(evidenceGroups).find(
    (candidate) => candidate.group.id === 'campus-yourgen',
  )!

  return (
    <>
      <button onClick={() => setOpen(true)} ref={triggerRef} type="button">
        打开证据
      </button>
      {open ? (
        <EvidenceViewer
          item={item}
          onClose={() => setOpen(false)}
          returnFocusRef={triggerRef}
        />
      ) : null}
    </>
  )
}

test('stacks every selected group image in registry order', () => {
  render(<ViewerHarness />)
  fireEvent.click(screen.getByRole('button', { name: '打开证据' }))

  const viewer = screen.getByRole('dialog', {
    name: '证据 3：语境项目',
  })
  expect(
    within(viewer).getAllByRole('img').map((image) =>
      image.getAttribute('data-evidence-image'),
    ),
  ).toEqual([
    'campus-yourgen-project',
    'campus-yourgen-promotion-1',
    'campus-yourgen-promotion-2',
  ])
})

test('closes on Escape and restores focus to the opening anchor', async () => {
  render(<ViewerHarness />)
  const trigger = screen.getByRole('button', { name: '打开证据' })

  fireEvent.click(trigger)
  fireEvent.keyDown(document, { key: 'Escape' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())
})

test('keeps content clicks open and closes from overlay or return control', () => {
  render(<ViewerHarness />)
  const trigger = screen.getByRole('button', { name: '打开证据' })

  fireEvent.click(trigger)
  let viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  fireEvent.click(within(viewer).getAllByRole('img')[0])
  expect(viewer).toBeInTheDocument()

  fireEvent.click(viewer)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  fireEvent.click(trigger)
  viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  fireEvent.click(within(viewer).getByRole('button', { name: '返回简历' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('enters and contains keyboard focus inside the open viewer', async () => {
  render(<ViewerHarness />)
  fireEvent.click(screen.getByRole('button', { name: '打开证据' }))

  const viewer = screen.getByRole('dialog', { name: '证据 3：语境项目' })
  const close = within(viewer).getByRole('button', { name: '返回简历' })
  const links = within(viewer).getAllByRole('link')

  await waitFor(() => expect(close).toHaveFocus())
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
  expect(links.at(-1)).toHaveFocus()

  links.at(-1)!.focus()
  fireEvent.keyDown(document, { key: 'Tab' })
  expect(close).toHaveFocus()
})
~~~

Production mutation caught: rendering only the first asset, reversing group order, ignoring Escape, losing return focus, dismissing on content clicks, dropping either explicit close path, or allowing keyboard focus to escape.

- [ ] **Step 2: Run the viewer tests and verify RED**

Run:

~~~bash
npm test -- --run src/test/evidence-viewer.test.tsx
~~~

Expected: FAIL because EvidenceViewer does not exist.

- [ ] **Step 3: Implement useMediaQuery**

~~~ts
import { useEffect, useState } from 'react'

function readMatch(query: string) {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => readMatch(query))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      setMatches(false)
      return undefined
    }

    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}
~~~

- [ ] **Step 4: Implement EvidenceViewer**

Render through createPortal into document.body. Use role='dialog', aria-modal='true', a caption-derived accessible name, a top 返回简历 button, and EvidenceGallery variant='viewer'.

On mount:

- store and set body.style.overflow='hidden';
- focus 返回简历;
- listen for Escape;
- contain Tab and Shift+Tab between viewer focusables.

On cleanup:

- restore the prior body overflow;
- remove the key listener;
- requestAnimationFrame focus back to returnFocusRef.current.

The overlay click handler closes only when event.target === event.currentTarget so clicking an image or link never dismisses accidentally.

Style the portal as a fixed, white, full-viewport reading surface with a scrollable vertical content column, unused white margin around the column, original-aspect images stacked in registry order, and no carousel, card shell, transition, or decorative motion.

- [ ] **Step 5: Wire wide and narrow behavior in ResumeEvidenceCanvas**

Use:

~~~ts
const WIDE_EVIDENCE_QUERY = '(min-width: 1320px)'
const wide = useMediaQuery(WIDE_EVIDENCE_QUERY)
~~~

- Wide: render all callouts and lines; activating an anchor focuses the first original-image link in its matching callout.
- Narrow: do not render callouts or lines; activating an anchor stores the selected item and trigger and renders EvidenceViewer.
- Resizing wide while the viewer is open closes it and restores document scrolling.

Update evidence-canvas.test.tsx to install a matchMedia stub whose matches value is true for WIDE_EVIDENCE_QUERY, then restore the original after each test. This keeps its 15-callout/19-image assertions explicitly in desktop mode instead of depending on jsdom defaults. useEvidenceLayout must also tolerate an unavailable ResizeObserver/document.fonts in jsdom while still performing its initial measurement.

- [ ] **Step 6: Write the failing mobile browser test**

~~~ts
test('opens only the selected evidence group from a mobile anchor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.locator('[data-evidence-callout-id]')).toHaveCount(0)
  await expect(page.locator('[data-evidence-image]')).toHaveCount(0)

  const anchor = page.getByRole('button', {
    name: '查看证据 3：语境项目',
  }).first()
  await anchor.click()

  const viewer = page.getByRole('dialog', {
    name: '证据 3：语境项目',
  })
  await expect(viewer).toBeVisible()
  await expect(viewer.locator('[data-evidence-image]')).toHaveCount(3)

  const boxes = await viewer.locator('[data-evidence-image]').evaluateAll(
    (images) => images.map((image) => image.getBoundingClientRect()),
  )
  expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom)
  expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom)

  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(anchor).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})
~~~

- [ ] **Step 7: Run viewer unit and mobile browser tests and verify GREEN**

Run:

~~~bash
npm test -- --run src/test/evidence-viewer.test.tsx src/test/evidence-canvas.test.tsx
npx playwright test e2e/resume.spec.ts -g "selected evidence group from a mobile anchor"
~~~

Expected: PASS.

- [ ] **Step 8: Commit Task 6**

~~~bash
git add src/components/EvidenceViewer.tsx src/hooks/useMediaQuery.ts src/test/evidence-viewer.test.tsx src/test/evidence-canvas.test.tsx src/components/ResumeEvidenceCanvas.tsx src/components/EvidenceAnchor.tsx src/styles.css e2e/resume.spec.ts
git commit -m "feat: add mobile evidence viewer"
~~~

---

### Task 7: Replace obsolete assertions and verify responsive, print, source, and asset behavior

**Files:**
- Modify: e2e/resume.spec.ts
- Modify: src/test/resume-render.test.tsx
- Modify: src/test/evidence-canvas.test.tsx
- Modify: src/styles.css
- Verify unchanged: src/data/resume.generated.ts
- Verify unchanged: src/data/resume-source.xml
- Verify unchanged: src/data/resume-text.txt
- Verify unchanged: src/data/resume-links.json

**Interfaces:**
- Consumes: all preceding production interfaces.
- Produces: final acceptance coverage and clean repository state.

- [ ] **Step 1: Update default viewport expectations**

For 1440 px expect:

- resume root, source content, chips, roles, and radar visible;
- 15 exterior callouts;
- 19 evidence images;
- zero images inside resume-sheet;
- no horizontal overflow.

For 768 px and 390 px expect:

- zero exterior callouts and zero default evidence images;
- 15 primary anchors;
- no horizontal overflow.

Delete the old optional-photo-right, optional-photo-below, inline-copy-left, and inline-gallery-below assertions because those are now rejected behavior.

- [ ] **Step 2: Add wide/narrow resize regression**

~~~ts
test('switches from exterior rails to anchor-only mode without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('[data-evidence-callout-id]')).toHaveCount(15)

  await page.setViewportSize({ width: 1024, height: 900 })
  await expect(page.locator('[data-evidence-callout-id]')).toHaveCount(0)
  await expect(page.locator('[data-evidence-image]')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024)
})
~~~

- [ ] **Step 3: Update local asset verification**

At 1440 px, collect all 19 exterior image URLs, assert uniqueness, request each URL, and verify the Codex Profile original link still opens a local asset in a new tab.

At 390 px, keep the default DOM image-free; the dedicated mobile viewer test verifies the selected three-image YourGen group, while the 1440 px asset test verifies all 19 local files.

- [ ] **Step 4: Update print acceptance**

~~~ts
test('prints only the clean A4 resume sheet', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('[data-evidence-callout-id]')).toHaveCount(15)
  await page.emulateMedia({ media: 'print' })

  await expect(page.locator('[data-evidence-callout-id]')).toBeHidden()
  await expect(page.locator('[data-evidence-line-id]')).toBeHidden()
  await expect(page.locator('[data-evidence-anchor-id]')).toBeHidden()
  await expect(page.getByTestId('resume-sheet').locator('img')).toHaveCount(0)

  const sheetStyles = await page.getByTestId('resume-sheet').evaluate((sheet) => {
    const styles = window.getComputedStyle(sheet)
    return {
      width: styles.width,
      borderTopWidth: styles.borderTopWidth,
      boxShadow: styles.boxShadow,
    }
  })

  expect(sheetStyles.borderTopWidth).toBe('0px')
  expect(sheetStyles.boxShadow).toBe('none')
})
~~~

Keep the existing print role-capsule and campus-detail text assertions.

In @media print, also reset resume-evidence-canvas min-height to 0/auto and remove exterior positioning from the canvas wrapper so hidden callouts cannot create blank print pages.

- [ ] **Step 5: Run the complete unit suite**

Run:

~~~bash
npm test
~~~

Expected: every test file PASS with zero failures.

- [ ] **Step 6: Run the production build**

Run:

~~~bash
npm run build
~~~

Expected: TypeScript and Vite build exit 0; all 19 evidence assets appear in dist/assets.

- [ ] **Step 7: Run the complete browser suite**

Run:

~~~bash
npm run test:e2e
~~~

Expected: every desktop, tablet, mobile, radar, viewer, asset, resize, and print test PASS with zero failures.

- [ ] **Step 8: Verify repository hygiene and source immutability**

Run:

~~~bash
git diff --check
test "$(find src/assets/evidence -type f | wc -l | tr -d ' ')" = "19"
git diff 8e6b960 -- src/data/resume.generated.ts src/data/resume-source.xml src/data/resume-text.txt src/data/resume-links.json
git status --short
~~~

Expected:

- diff check is silent;
- asset count is 19;
- the four source-of-truth files have no diff;
- status contains only the intended final task changes before commit.

- [ ] **Step 9: Validate the rendered UI through the Browser plugin**

The flow under test is:

~~~text
localhost resume loads -> desktop exterior callouts connect to source anchors ->
campus hover retains text-only detail -> resize to 390 px removes rails ->
anchor opens the correct full-screen vertical viewer -> Escape restores focus
~~~

Required checks at http://127.0.0.1:4174/:

- page identity and meaningful DOM;
- no framework overlay;
- no relevant console errors or warnings;
- 1440x900 screenshot with both rails;
- 1440x900 campus hover screenshot;
- 390x844 default screenshot with anchors only;
- 390x844 three-image YourGen viewer screenshot;
- interaction proof for line/callout mapping, viewer close, and focus restoration;
- reset the temporary viewport when finished.

Keep a mismatch ledger against the approved design: exterior placement, no images inside paper, restrained lines, no callout cards, vertical mobile viewer, and pure print.

- [ ] **Step 10: Audit the final React changes**

Read and apply build-web-apps:react-best-practices to the modified TSX files. Check for unnecessary effects, unstable dependencies, avoidable re-renders, layout read/write loops, missing cleanup, and accessibility regressions. Make only changes required by the audit and rerun the targeted tests for any code changed.

- [ ] **Step 11: Commit Task 7**

~~~bash
git add e2e/resume.spec.ts src/test/resume-render.test.tsx src/test/evidence-canvas.test.tsx src/styles.css
git commit -m "test: verify external resume evidence"
~~~

- [ ] **Step 12: Run completion verification after the final commit**

Run:

~~~bash
npm test
npm run build
npm run test:e2e
git diff --check
git status --short
~~~

Expected: all test/build commands exit 0 and git status is clean.
