# Resume Evidence Gallery Design

Date: 2026-09-01
Status: Approved

## 1. Objective

Add the 19 user-supplied profile and work-evidence images to the existing static React resume without changing any resume wording. The approved presentation follows the original A-style photo concept:

- desktop: the relevant resume copy remains on the left and its image evidence appears on the right;
- mobile: the copy appears first and the image evidence stacks below it;
- print: evidence images are hidden and the original clean A4 text resume is restored;
- the page remains restrained and PDF-like, with no carousel, modal lightbox, decorative animation, or portfolio-style card wall.

The two profile screenshots belong in the opening personal section. The remaining 17 images are attached to the exact education, campus, and OUTPUT statements supplied by the user.

## 2. Content Fidelity

- `src/data/resume.generated.ts`, `src/data/resume-source.xml`, `src/data/resume-text.txt`, and `src/data/resume-links.json` remain unchanged.
- Evidence data is stored separately from the resume source. Adding or removing an image must not modify the resume copy.
- Captions and accessible alternative text use only the user's supplied descriptions. No metric, conclusion, role, date, or achievement is inferred from the screenshots.
- The visible resume section order, nested-list order, strong spans, links, punctuation, and source-text fidelity checks remain unchanged.
- Image numbering records the user's upload order only; document placement follows the semantic order of the resume.

## 3. Evidence Inventory And Anchors

Implementation copies the uploads into `src/assets/evidence/` using stable semantic filenames. Each group has one exact text anchor so a screenshot cannot silently drift to the wrong experience.

| Group | Semantic asset filename | Exact placement anchor | User-supplied label | Layout |
| --- | --- | --- | --- | --- |
| Header A | `profile-codex.png` | opening personal header | Codex Profile | first item in the header evidence rail |
| Header B | `profile-github-2026.png` | opening personal header | 今年的 GitHub Profile | second item in the header evidence rail |
| 8 | `education-thesis-proposal.png` | `毕业设计研究方向` | 毕业设计开题节选 | one image |
| 1 | `campus-aipo-competition.jpg` | `Way to AGI——AIPO校园创投大赛` | 校园 AIPO 比赛 | one image |
| 2 | `campus-yourgen-project.jpg` | `语境YourGen——LLM+外语场景应用开发` | 语境项目 | first image in a three-image group |
| 5 | `campus-yourgen-promotion-1.jpg` | `语境YourGen——LLM+外语场景应用开发` | 地推+YourGen项目 | second image in the group |
| 6 | `campus-yourgen-promotion-2.jpg` | `语境YourGen——LLM+外语场景应用开发` | 地推+YourGen项目2 | third image in the group |
| 3 | `campus-waarzegger-short-film.jpg` | `荷兰语原创短剧《Waarzegger Kenneth》执导` | Waarzegger短剧 | one image |
| 4 | `campus-event-organization.jpg` | `校企活动组织力` | 校园活动举办 | one image |
| 7 | `campus-model-un-conference.jpg` | `模拟联合国大会——长期活跃的模联选手` | 模联大会 | one image |
| 9 | `output-product-orchestration.png` | `【产品统筹】` | OUTPUT 产品统筹 | one image |
| 10 | `output-delivery-mechanism.png` | `【交付机制建设】` | OUTPUT 交付机制建设 | one image |
| 11 | `output-bilingual-review.png` | `【双语评审规模化交付】` | 双语评审规模化交付 | one image |
| 12 | `output-expert-agent-paas.png` | `【Expert Agent PaaS】` | Expert Agent PaaS | one image |
| 13 | `output-monsora-workbench.png` | `【Monsora 多模态资产工作台】` | Monsora 多模态资产工作台 | one image |
| 14 | `output-cross-platform-capture.png` | `【跨平台资产捕捉】` | 跨平台资产捕捉 | one image |
| 15 | `output-automation-platform-1.png` | `【自动化与技术研究】` | 自动化平台1 | first image in a two-image group |
| 16 | `output-automation-platform-2.png` | `【自动化与技术研究】` | 自动化平台2 | second image in the group |
| 17 | `output-team-knowledge-sharing.png` | `【团队建设与知识共享】` | 团队建设与知识共享 | one image |

Inventory totals:

- opening personal section: 2 images;
- education: 1 image;
- campus experience: 7 images across 5 anchors;
- OUTPUT: 9 images across 8 anchors;
- overall: 19 images across 15 evidence groups.

## 4. Page Layout

### 4.1 Desktop

- Evidence-enabled screen mode expands the centered white sheet from its A4 reading width to approximately `1180px`, while preserving the existing paper surface and typography.
- The text column remains approximately `720–760px`; the corresponding evidence rail is approximately `300–340px`, separated by a restrained `28–36px` gap.
- The opening personal section places the two profile screenshots in one right-hand rail, stacked in the supplied order: Codex Profile, then GitHub Profile.
- Education and OUTPUT evidence is rendered as a local two-column pair: the source-authored paragraph or list item on the left and only its mapped evidence group on the right.
- A paragraph without mapped evidence remains in the normal text column. It does not reserve an empty image slot.
- Evidence must stay near its anchor rather than moving into a sticky gallery or a detached portfolio section.
- One-image groups use the full evidence-column width. Two- and three-image groups use a compact responsive grid inside the same rail, preserving each source image's aspect ratio.

### 4.2 Campus Radar Detail

- The existing campus radar remains the entry point for campus experience and retains its current hover/tap behavior.
- The default radar view does not display all seven campus images at once.
- Hovering or focusing a capability still blurs the radar background and reveals the existing text detail layer.
- Within that detail layer, mapped copy occupies the left side and the selected item's evidence appears on the right. Moving the pointer outside the radar restores the default state; no close button is added.
- When a capability contains several resume items, each item reveals its own mapped evidence alongside its original text. Items without evidence remain text-only.

### 4.3 Mobile And Narrow Screens

- At approximately `840px` and below, every evidence pair becomes a single column: exact resume copy first, corresponding image group second.
- The two opening Profile screenshots stack below the personal-header text in their supplied order.
- Campus detail copy appears before its evidence images, and the overlay remains fully scrollable without horizontal overflow.
- Multi-image groups become one or two columns according to available width; no image is cropped merely to equalize heights.
- Tap and keyboard focus provide the same campus detail access as pointer hover.

### 4.4 Print

- `@media print` hides all `.resume-evidence-*` and header profile media.
- The sheet returns to the existing A4 width, normal text flow, and print margins.
- Hiding evidence must not hide, duplicate, or reorder the associated resume copy.
- No blank right column, caption, broken-image placeholder, or forced evidence page remains in the printed resume.

## 5. Visual Treatment

- Evidence is documentary support, not decorative content: true image colors, neutral `1px` border, small radius, and no gradient, glass layer, heavy shadow, or hover zoom.
- Images use `display: block; width: 100%; height: auto; object-fit: contain` so screenshots and group photos remain uncropped.
- Tall screenshots are shown at a readable constrained preview height with `object-fit: contain`; opening the image exposes the full original.
- Each image has a small, subdued caption using the exact label in the inventory table. Captions do not repeat screenshot-derived metrics.
- Each image is wrapped in a normal local-asset link with `target="_blank"` and `rel="noreferrer"`, allowing full-size inspection without a custom lightbox.
- The evidence rail uses the same white paper background as the resume and must not look like a separate card deck.

## 6. Data And Component Design

### 6.1 Evidence Data

Create `src/data/evidence.ts` with typed records separate from resume text:

```ts
type EvidenceAsset = {
  id: string
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

type EvidenceGroup = {
  id: string
  anchor: string
  location: 'header' | 'education' | 'campus' | 'work'
  assets: EvidenceAsset[]
}
```

- Asset dimensions are recorded from the supplied originals to prevent layout shift.
- `anchor` contains an exact, stable substring already present in the generated resume data.
- A lookup helper returns a group by location and anchor. Duplicate group IDs, duplicate asset IDs, missing anchors, and orphan assets fail tests rather than being silently ignored.

### 6.2 Components

- `EvidenceGallery`: renders one evidence group, captions, full-size links, lazy loading, and the one/two/three-image grid.
- `ResumeEvidencePair`: preserves source-authored copy as the first column and conditionally adds `EvidenceGallery` as the second column.
- `PhotoPanel`: renders both approved header Profile assets in the opening right rail; its empty state continues to render no gap.
- `EducationSummary`: pairs the paragraph containing `毕业设计研究方向` with its evidence group while leaving the school/program summary unchanged.
- `NestedList`: receives an optional evidence resolver and wraps only exact matching list items in `ResumeEvidencePair`; ordinary recursive rendering remains unchanged.
- `CampusCapabilityRadar` / `CampusDetail`: resolves evidence for the currently visible campus items and renders it inside the existing hover/focus detail layer.
- `ResumeDocument`: passes the appropriate location-scoped evidence resolver without embedding asset paths in generated resume content.

## 7. Loading, Failure, And Accessibility

- Non-header evidence uses `loading="lazy"` and `decoding="async"`; header Profile images may load eagerly because they are above the fold.
- Source width and height attributes reserve the correct aspect ratio before decoding.
- Alternative text follows the supplied label, for example `OUTPUT 产品统筹截图` or `校园 AIPO 比赛合影`; it does not identify people or infer private details.
- Captions remain real text and links remain keyboard accessible with a visible focus outline.
- If an image fails, its alt text and source copy remain readable, and the text column does not collapse.
- Campus detail is reachable with keyboard focus and tap, not hover alone.
- `prefers-reduced-motion` disables any existing transition used when the campus detail state changes.

## 8. Verification

### 8.1 Data And Fidelity Tests

- Assert exactly 19 unique evidence assets and exactly 15 evidence groups.
- Assert group counts: header 2, education 1, campus 7, OUTPUT 9.
- Assert every anchor is found exactly where intended in the current generated resume structure.
- Assert the rendered resume text remains equal to the frozen source fixture after captions are excluded from the fidelity container.
- Assert the original six article links and all existing resume links remain unchanged.

### 8.2 Component Tests

- Header renders Codex Profile before GitHub Profile.
- Each education and OUTPUT anchor receives only its mapped evidence group.
- The YourGen group renders three images in user-supplied order; automation renders two in user-supplied order.
- Campus hover, focus, and tap reveal the correct mapped evidence and pointer exit restores the radar without a close button.
- Empty evidence data renders no image column or placeholder.
- Evidence links point to local original assets and use safe external-tab attributes.

### 8.3 Browser And Print Tests

- Verify wide desktop layout at `1440px`: copy on the left, relevant evidence on the right, no horizontal overflow.
- Verify narrow desktop/tablet around `900px` and mobile at `390px`: copy first, images below, no clipped campus detail.
- Verify all 19 assets load successfully in the production build, including under a nested GitHub Pages-style base path.
- Verify opening each evidence image reaches the full local original.
- Verify print media hides every evidence image and returns the sheet to clean A4 text flow.
- Run TypeScript checks, unit tests, production build, and Playwright checks before completion.

## 9. Non-Goals

- No rewriting, shortening, or embellishment of resume content.
- No screenshot OCR used to create new claims or metrics.
- No global gallery, carousel, lightbox, slideshow, masonry wall, or sticky sidebar.
- No image editing, generated replacements, face identification, or person annotations.
- No permanent deployment or remote repository mutation until explicitly requested.

## 10. Acceptance Criteria

1. All 19 supplied images appear once in the intended semantic location and in the approved order.
2. Desktop consistently shows resume copy on the left and corresponding evidence on the right; mobile consistently stacks copy before evidence.
3. The opening personal section shows Codex Profile followed by this year's GitHub Profile.
4. Campus evidence participates in the existing radar hover/focus/tap detail experience and exits automatically when the pointer leaves.
5. Resume wording, links, nesting, and ordering remain unchanged.
6. Print output contains the clean text resume without evidence media or empty image space.
7. Production build and responsive/browser checks pass with no missing local assets or horizontal overflow.
