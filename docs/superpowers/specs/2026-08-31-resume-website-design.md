# Static Resume Website Design

Date: 2026-08-31

## 1. Objective

Build a static, GitHub Pages-ready resume website from the user's current Feishu resume. The site must reproduce the resume content without rewriting, summarizing, embellishing, or omitting text. Its visual treatment should resemble a conventional PDF resume: restrained typography, a white paper surface, clear section hierarchy, and no decorative animation.

The layout must also reserve an extensible photo area matching the approved reference: an optional photo block at the upper-right of the resume header on desktop. When no photo is configured, the photo block must not render or reserve empty space. On narrow screens, configured photos move below the identity/contact area.

## 2. Source of Truth and Content Fidelity

- The Feishu document `COijd5MBUo2bbbxAeavchDDWnGp` is the source of truth.
- The design review used document revision `1026`; implementation must fetch the latest revision again immediately before transcription.
- The website must preserve all visible resume text, punctuation, capitalization, dates, nesting, bold spans, list order, and external article URLs from that implementation-time revision.
- The Feishu document title `Intro Me` becomes the HTML document title. The visible resume begins with `张悦`; `Intro Me` is not added as an extra on-page heading.
- No new claims, descriptions, labels, summaries, technologies, achievements, or metrics may be introduced.
- Empty Feishu paragraphs may be represented as layout spacing rather than visible empty text nodes, provided the section order and reading flow remain unchanged.

## 3. Selected Technical Approach

Use:

- React
- TypeScript
- Vite
- Plain CSS with CSS custom properties
- Vitest and React Testing Library for content/component checks
- Playwright for responsive and print verification
- GitHub Actions for GitHub Pages deployment

Do not use:

- A backend, database, CMS, runtime Feishu API call, or authentication
- React Router or client-side routing
- Animation libraries
- UI component libraries
- Markdown as the canonical resume representation
- `dangerouslySetInnerHTML`

Vite will use relative asset paths so the build remains deployable under an arbitrary GitHub Pages repository path.

## 4. Information Architecture

The on-page order mirrors Feishu exactly:

1. Identity and contact information
2. Personal keywords
3. AI tool stack
4. Personal evaluation
5. Education
6. Campus experience
7. Work and internship experience

Work entries and nested lists remain in their existing order, including OUTPUT, AI科技评论 and its six article links, 范彻斯库科技, 时空壶, 乐云, and 晨读.

## 5. Content Model

Resume content is stored separately from rendering logic in `src/data/resume.ts`.

The data model supports:

- headings
- paragraphs
- bold inline segments
- external links
- unordered and ordered lists
- arbitrarily nested list items
- intentional section spacing

Inline content is represented as typed segments such as plain text, strong text, and links. Block content is represented as typed headings, paragraphs, and lists. This mirrors the Feishu structure while preventing string-built HTML and preserving exact link destinations.

Photo configuration is stored separately in `src/data/photos.ts`. It starts as an empty array. The photo model contains a stable ID, local asset path, alternative text, optional caption, and display priority. Resume content never imports photo assets directly.

## 6. Component Boundaries

Proposed component tree:

```text
App
└── ResumePhotoLayout
    ├── ResumeDocument
    │   ├── ResumeHeader
    │   ├── ResumeSection
    │   ├── ResumeBlockRenderer
    │   ├── RichText
    │   └── NestedList
    └── PhotoPanel (conditional)
```

Responsibilities:

- `ResumePhotoLayout`: selects resume-only or resume-with-photo layout based on photo data.
- `ResumeDocument`: renders the paper-like resume surface and its ordered sections.
- `ResumeHeader`: renders the name, contact line, personal keywords, AI tool stack, and personal evaluation; exposes the desktop photo slot.
- `ResumeSection`: renders a semantic section heading and its blocks.
- `ResumeBlockRenderer`: maps typed content blocks to semantic React elements.
- `RichText`: renders exact text, strong spans, and external links without HTML injection.
- `NestedList`: recursively renders existing ordered/unordered nested lists.
- `PhotoPanel`: renders zero, one, or multiple configured photos without changing resume data.

## 7. Layout and Visual Design

### Desktop

- A light neutral page background surrounds one centered white resume sheet.
- The resume sheet uses an A4-like reading width but is not assigned a fixed height or page count.
- The sheet uses restrained padding, a very subtle border/shadow on screen, and black/gray text.
- The top header is a responsive grid:
  - Without photo data: a single full-width resume column.
  - With photo data: resume identity/content on the left and the approved photo block at the upper-right.
- The photo block is local to the header area; it is not a permanently fixed, full-height sidebar.
- Section headings use a clear weight and a thin divider. No color gradients, decorative icons, glass effects, cards, or motion are used.
- The typography uses a Chinese system-font stack and a PDF-resume-like density.

### Mobile and Narrow Screens

- The white sheet becomes edge-to-edge with reduced padding and no unnecessary shadow.
- Text and nested lists remain readable without horizontal scrolling.
- When photos exist, the photo block moves below the identity/contact area and before the remaining resume sections.
- No fixed widths, fixed heights, or absolute positioning are used for primary layout.

### Print

- `@page` uses A4 sizing and controlled margins.
- Screen background, shadow, and decorative borders are removed.
- Text remains black and links remain printable/clickable.
- Small entries and headings avoid awkward page breaks where possible, while long sections such as OUTPUT are allowed to flow across pages naturally.
- The page does not force a preselected number of printed pages.

## 8. Future Photo Comparison Behavior

The initial release contains no photo assets and therefore renders a full-width resume.

Future photo support requires only adding items to `src/data/photos.ts` and placing corresponding files under `public/photos/` or `src/assets/photos/`. The layout component already supports:

- one upper-right portrait/photo on desktop
- multiple photo items in a vertically flowing panel if later required
- mobile stacking
- captions and accessible alternative text

No empty placeholder, `photo` label, or reserved white rectangle is visible in the initial release.

## 9. GitHub Pages Delivery

- `npm run build` outputs a fully static `dist/` directory.
- The Vite base configuration uses relative asset paths and does not assume a repository name.
- A GitHub Actions workflow builds and deploys `dist/` to GitHub Pages.
- The site uses a single document with no router, so deep-link fallback and custom `404.html` handling are unnecessary.
- A `.nojekyll` file is included where needed to prevent Jekyll processing.

## 10. Verification Strategy

### Content Fidelity

- Store a canonical flattened text fixture captured from the same Feishu revision used for implementation.
- Render the React resume in a test environment and compare normalized rendered text against the canonical fixture.
- Assert that all six article labels and URLs are present exactly once.
- Assert the order of top-level sections and work entries.
- Assert that bold/link segment boundaries defined in the data model render as expected.

### Layout and Behavior

- Test resume-only mode: no `PhotoPanel` element and no empty photo column.
- Test photo-enabled mode: photo appears in the upper-right header area on desktop.
- Test narrow viewport mode: photo stacks below identity/contact content and the resume has no horizontal overflow.
- Verify at representative viewport widths such as 1440px, 768px, and 390px.
- Verify print media using browser print emulation and generate a PDF for visual inspection.

### Build and Deployment

- Run TypeScript checks, unit tests, production build, and Playwright checks.
- Open the production build rather than relying only on the development server.
- Confirm that relative assets and all external links work from a nested GitHub Pages-style path.

## 11. Error and Edge Handling

- An empty photo array renders no photo DOM and leaves no layout gap.
- A failed future image load preserves readable resume layout and accessible alternative text.
- Long URLs never overflow the page.
- Nested list indentation compresses on small screens without flattening hierarchy.
- External links use safe attributes while preserving their exact destinations.

## 12. Non-Goals

- No content editing interface
- No automatic synchronization from Feishu after build time
- No analytics, tracking, contact form, theme switcher, or language switcher
- No animation or portfolio-style interaction
- No invented profile photo or placeholder graphic
- No deployment to a remote GitHub repository until explicitly requested

## 13. Acceptance Criteria

The work is accepted when:

1. The visible resume text and article links match the latest implementation-time Feishu revision.
2. The website presents a restrained PDF-like resume on desktop, mobile, and print.
3. No photo placeholder is visible with empty photo data.
4. Supplying photo data activates the approved upper-right desktop photo area and mobile stacking without changing resume content.
5. The production build passes and is ready for GitHub Pages deployment.
6. The project structure keeps content, layout, and photo data independently editable.
