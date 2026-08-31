# Static Resume Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React resume website that reproduces the latest Feishu resume exactly, supports a conditional upper-right photo area, prints cleanly, and is ready for GitHub Pages.

**Architecture:** A Vite/React/TypeScript single-page application renders typed resume data generated from a frozen Feishu XML snapshot. Content, rendering, layout, and photo configuration remain separate; the default build has no photo, while a development-only preview exercises the future photo layout. Plain CSS provides A4-like screen styling, responsive behavior, and print rules.

**Tech Stack:** React, TypeScript, Vite, plain CSS, htmlparser2, Vitest, React Testing Library, Playwright, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-08-31-resume-website-design.md`

## Global Constraints

- Fetch document `COijd5MBUo2bbbxAeavchDDWnGp` again immediately before generating resume data and record that revision in generated metadata.
- Preserve all visible text, punctuation, capitalization, dates, nesting, bold spans, list order, and external article URLs from the captured revision.
- Render `Intro Me` only as the HTML document title; the visible page begins with `张悦`.
- Do not add, rewrite, summarize, embellish, translate, or omit resume claims.
- Use React + TypeScript + Vite with no backend, database, CMS, router, UI library, animation library, or `dangerouslySetInnerHTML`.
- Keep resume content, photo data, rendering components, and CSS independently editable.
- Default photo data is empty; no placeholder or empty column appears in the production build.
- A configured photo appears at the upper-right of the header on desktop and stacks below identity/contact information on narrow screens.
- Use relative asset paths and a static `dist/` build suitable for an arbitrary GitHub Pages repository path.
- Use Node.js 22 in local documentation and GitHub Actions; commit the generated lockfile.
- Apply changes with `apply_patch`; use generators only for intentional bulk-mechanical output.

---

## Planned File Structure

```text
.
├── .github/workflows/deploy-pages.yml       # GitHub Pages build/deploy workflow
├── .gitignore                               # Node, build, test, and scratch ignores
├── index.html                               # Vite HTML shell; title is Intro Me
├── package.json                             # Development/build/test scripts
├── package-lock.json                        # Locked dependencies
├── playwright.config.ts                     # Browser verification configuration
├── tsconfig.app.json                        # Browser TypeScript configuration
├── tsconfig.json                            # TypeScript project references
├── tsconfig.node.json                       # Vite/config TypeScript configuration
├── vite.config.ts                           # React plugin, relative base, Vitest config
├── public/.nojekyll                         # GitHub Pages static marker
├── scripts/fetch-resume.mjs                 # Manual Feishu snapshot/generation entrypoint
├── scripts/transform-lark-xml.mjs           # XML-to-typed-data transformer
├── src/App.test.tsx                         # Application smoke test
├── src/App.tsx                              # Composes data and top-level layout
├── src/main.tsx                             # React root
├── src/styles.css                           # Screen, responsive, and print styles
├── src/components/NestedList.tsx            # Recursive ordered/unordered lists
├── src/components/PhotoPanel.tsx             # Optional photo rendering
├── src/components/ResumeBlockRenderer.tsx   # Typed block dispatcher
├── src/components/ResumeDocument.tsx        # Semantic resume document
├── src/components/ResumeHeader.tsx          # Header and optional photo slot
├── src/components/ResumePhotoLayout.tsx     # Resume-only versus photo layout
├── src/components/ResumeSection.tsx         # Section wrapper and heading
├── src/components/RichText.tsx              # Safe inline text/strong/link renderer
├── src/data/photos.ts                       # Empty production photo configuration
├── src/data/resume-source.xml               # Frozen Feishu XML snapshot
├── src/data/resume-text.txt                 # Canonical normalized text fixture
├── src/data/resume-links.json               # Canonical link label/URL fixture
├── src/data/resume.generated.ts             # Generated typed resume data
├── src/data/resume.ts                       # Stable typed export used by the app
├── src/data/resumeTypes.ts                  # Shared data contracts
├── src/data/sourceMetadata.ts               # Feishu token and captured revision
├── src/test/setup.ts                        # jest-dom setup
├── src/test/transform-lark-xml.test.ts       # XML transformation tests
├── src/test/resume-render.test.tsx           # Full content/link fidelity tests
├── src/test/photo-layout.test.tsx            # Conditional photo layout tests
└── e2e/resume.spec.ts                       # Desktop/mobile/print browser checks
```

---

### Task 1: Establish the Vite/React/Test Foundation

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.gitignore`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `playwright.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.test.tsx`
- Create: `src/App.tsx`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: `App(): JSX.Element`, the root component later tasks will replace with the full resume composition.
- Produces: npm scripts `dev`, `build`, `preview`, `test`, `test:watch`, `test:e2e`, and `sync:resume`.

- [ ] **Step 1: Add dependency and script definitions**

Create `package.json` with these scripts and install current stable packages so `package-lock.json` records exact versions:

```json
{
  "name": "zhang-yue-resume",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "sync:resume": "node scripts/fetch-resume.mjs"
  }
}
```

Run:

```bash
npm install react@latest react-dom@latest htmlparser2@latest
npm install -D typescript@latest vite@latest @vitejs/plugin-react@latest vitest@latest jsdom@latest @testing-library/react@latest @testing-library/jest-dom@latest @types/react@latest @types/react-dom@latest @playwright/test@latest
```

Expected: `package-lock.json` is created and `npm ls --depth=0` exits 0.

- [ ] **Step 2: Add TypeScript, Vite, Vitest, HTML, and ignore configuration**

Use a relative Vite base and jsdom tests:

```ts
// vite.config.ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

Set `index.html` to `<html lang="zh-CN">`, use `<title>Intro Me</title>`, and mount `<div id="root"></div>`. Configure `tsconfig.app.json` for strict TypeScript, React JSX, JSON imports, DOM libraries, and no emit. Configure `tsconfig.node.json` for Vite and Playwright config files. Ignore `node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `test-results/`, `tmp/`, and `work/`.

Create the initial Playwright configuration so TypeScript compilation succeeds before browser tests are added:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { ...devices['Desktop Chrome'] },
})
```

- [ ] **Step 3: Write the failing application smoke test**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { App } from './App'

test('renders a semantic resume main element', () => {
  render(<App />)
  expect(screen.getByRole('main')).toHaveAttribute('data-resume-root', 'true')
})
```

- [ ] **Step 4: Run the smoke test and verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `src/App.tsx` and the semantic main element do not exist.

- [ ] **Step 5: Add the minimal React root**

```tsx
// src/App.tsx
export function App() {
  return <main data-resume-root="true" />
}
```

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/test/setup.ts` imports `@testing-library/jest-dom/vitest`.

- [ ] **Step 6: Run foundation checks**

Run:

```bash
npm test -- src/App.test.tsx
npm run build
```

Expected: one passing test and a successful `dist/` build.

- [ ] **Step 7: Commit the foundation**

```bash
git add package.json package-lock.json .gitignore index.html tsconfig*.json vite.config.ts playwright.config.ts src
git commit -m "build: scaffold static resume app"
```

---

### Task 2: Define Resume Types and Transform Feishu XML

**Files:**
- Create: `src/data/resumeTypes.ts`
- Create: `scripts/transform-lark-xml.mjs`
- Create: `src/test/transform-lark-xml.test.ts`

**Interfaces:**
- Produces: `InlineNode`, `ResumeBlock`, `ListItem`, `ResumeDocumentData`, and `PhotoItem` TypeScript types.
- Produces: `transformResumeXml(xml: string): ResumeDocumentData`.
- Produces: `flattenResume(document: ResumeDocumentData): string` and `collectLinks(document: ResumeDocumentData): Array<{label: string; href: string}>`.

- [ ] **Step 1: Define the typed content contracts**

Use these exact discriminated unions:

```ts
export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }

export type ListItem = {
  content: InlineNode[]
  children: ListBlock[]
}

export type ListBlock = {
  type: 'list'
  ordered: boolean
  items: ListItem[]
}

export type ResumeBlock =
  | { type: 'heading'; level: 1 | 2; content: InlineNode[] }
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'spacer' }
  | ListBlock

export type ResumeDocumentData = {
  documentTitle: string
  blocks: ResumeBlock[]
}

export type PhotoItem = {
  id: string
  src: string
  alt: string
  caption?: string
  priority?: number
}
```

- [ ] **Step 2: Write failing mixed-content transformation tests**

Test this XML exactly:

```xml
<title>Intro Me</title><h1>张悦</h1><p>前缀<b>重点</b><a href="https://example.com?a=1&amp;b=2">链接</a></p><ul><li>一级<ul><li><b>二级</b></li></ul></li></ul><p></p>
```

Assert:

- `documentTitle === 'Intro Me'`
- the h1 is a heading level 1
- paragraph inline order is text → strong → link
- decoded link URL is `https://example.com?a=1&b=2`
- nested unordered lists remain nested
- the empty paragraph becomes `{type: 'spacer'}`
- `flattenResume(...)` yields `张悦\n前缀重点链接\n一级\n二级`
- `collectLinks(...)` yields one exact label/URL pair

- [ ] **Step 3: Run the transformer test and verify failure**

Run: `npm test -- src/test/transform-lark-xml.test.ts`

Expected: FAIL because the transformer module does not exist.

- [ ] **Step 4: Implement the XML transformer**

Use `htmlparser2.parseDocument(xml, { xmlMode: true, decodeEntities: true })`. Transform only documented source tags:

```text
title → documentTitle
h1/h2 → heading block with level 1/2
p → paragraph, or spacer when it has no visible inline content
ul/ol → list block with ordered false/true
li → inline content plus nested ul/ol children
b → strong inline node
a → link inline node using its exact decoded href
text → text inline node, preserving characters exactly
br → text node containing a newline
```

Ignore indentation-only text nodes introduced by formatted XML. Throw an error naming the unsupported tag if a visible source tag is not in this mapping; do not silently drop content.

Export all three functions from `scripts/transform-lark-xml.mjs`. `flattenResume` must join visible blocks/list items with `\n`, remove blank spacer lines, normalize line-ending style, and preserve all non-whitespace characters. `collectLinks` must walk every inline and nested list node in document order.

- [ ] **Step 5: Run transformer checks**

Run: `npm test -- src/test/transform-lark-xml.test.ts`

Expected: all transformation, nesting, text, and link assertions pass.

- [ ] **Step 6: Commit the transformer**

```bash
git add src/data/resumeTypes.ts scripts/transform-lark-xml.mjs src/test/transform-lark-xml.test.ts
git commit -m "feat: add typed Feishu resume transformer"
```

---

### Task 3: Capture the Latest Feishu Revision and Generate Static Resume Data

**Files:**
- Create: `scripts/fetch-resume.mjs`
- Create mechanically: `src/data/resume-source.xml`
- Create mechanically: `src/data/resume.generated.ts`
- Create mechanically: `src/data/resume-text.txt`
- Create mechanically: `src/data/resume-links.json`
- Create mechanically: `src/data/sourceMetadata.ts`
- Create: `src/data/resume.ts`

**Interfaces:**
- Consumes: `transformResumeXml`, `flattenResume`, and `collectLinks` from Task 2.
- Produces: `resume: ResumeDocumentData` from `src/data/resume.ts`.
- Produces: `sourceMetadata = { documentToken: string; revisionId: number }`.

- [ ] **Step 1: Implement the manual sync command**

`scripts/fetch-resume.mjs` must:

1. Execute `lark-cli docs +fetch --doc COijd5MBUo2bbbxAeavchDDWnGp --detail simple --doc-format xml --as user --format json` using `spawnSync` with argument arrays, not a shell string.
2. Fail if the process exits nonzero, `ok !== true`, the document token differs, or content is empty.
3. Transform the returned XML using Task 2.
4. Write the exact XML snapshot to `src/data/resume-source.xml`.
5. Write `resume.generated.ts` as a typed exported object using `JSON.stringify(data, null, 2)` and an `import type` for `ResumeDocumentData`.
6. Write `resume-text.txt` from `flattenResume(data)` with one trailing newline.
7. Write `resume-links.json` from `collectLinks(data)`.
8. Write `sourceMetadata.ts` containing the token and numeric revision ID.
9. Print a summary containing revision, block count, flattened character count, and link count.

Use atomic temporary-file-then-rename writes so an interrupted sync cannot leave partial generated data.

- [ ] **Step 2: Run the live Feishu sync**

Run: `npm run sync:resume`

Expected:

- command exits 0
- output reports the current revision
- `resume-source.xml` begins with `<title>Intro Me</title><h1>张悦</h1>`
- `resume-links.json` contains six WeChat article URLs in source order
- generated data contains every top-level block from the snapshot

- [ ] **Step 3: Add the stable data export**

```ts
// src/data/resume.ts
export { resume } from './resume.generated'
export { sourceMetadata } from './sourceMetadata'
```

- [ ] **Step 4: Validate generated content mechanically**

Run:

```bash
npm test -- src/test/transform-lark-xml.test.ts
rg -n "张悦|个人关键词|OUTPUT|深圳英鹏图灵科技|范彻斯库|时空壶|乐云|晨读" src/data/resume-source.xml
node -e "const links=require('./src/data/resume-links.json'); if(links.length!==6) process.exit(1); console.log(links.length)"
```

Expected: transformer tests pass, all named sections are found, and link count prints `6`.

- [ ] **Step 5: Commit the captured revision and generator**

```bash
git add scripts/fetch-resume.mjs src/data
git commit -m "data: capture Feishu resume source"
```

---

### Task 4: Render Exact Rich Text, Blocks, and Nested Lists

**Files:**
- Create: `src/components/RichText.tsx`
- Create: `src/components/NestedList.tsx`
- Create: `src/components/ResumeBlockRenderer.tsx`
- Create: `src/components/ResumeSection.tsx`
- Create: `src/test/resume-render.test.tsx`

**Interfaces:**
- Consumes: `InlineNode`, `ListBlock`, and `ResumeBlock` from Task 2.
- Produces: `RichText({nodes}: {nodes: InlineNode[]}): JSX.Element`.
- Produces: `NestedList({block}: {block: ListBlock}): JSX.Element`.
- Produces: `ResumeBlockRenderer({block}: {block: ResumeBlock}): JSX.Element`.
- Produces: `ResumeSection({children}: PropsWithChildren): JSX.Element`.

- [ ] **Step 1: Write failing semantic renderer tests**

Create representative typed data containing plain and strong inline text, one external link, an unordered list containing an ordered nested list, an h2 heading, and a spacer.

Assert that:

- strong text renders inside `<strong>`
- links retain exact `href`, use `target="_blank"`, and use `rel="noreferrer noopener"`
- list types render as `<ul>` and `<ol>` without flattening
- h2 renders as `<h2>`
- spacer renders an `aria-hidden="true"` spacing element with no visible text

- [ ] **Step 2: Run renderer tests and verify failure**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: FAIL because the renderer components do not exist.

- [ ] **Step 3: Implement the safe renderers**

Use recursive React mapping and stable path keys. Never concatenate HTML strings. `RichText` recurses through strong/link children, `NestedList` recurses through nested list blocks, and `ResumeBlockRenderer` exhaustively switches on the block discriminant. Add a `never` exhaustiveness helper so a future unsupported block fails TypeScript.

`ResumeSection` renders a semantic `<section>` and forwards an optional class name; it does not introduce content.

- [ ] **Step 4: Run renderer tests**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: all semantic, URL, bold, spacer, and nested-list assertions pass.

- [ ] **Step 5: Commit the renderer layer**

```bash
git add src/components src/test/resume-render.test.tsx
git commit -m "feat: render typed resume content"
```

---

### Task 5: Compose the Resume Document and Prove Full Content Fidelity

**Files:**
- Create: `src/components/ResumeDocument.tsx`
- Create: `src/components/ResumeHeader.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/test/resume-render.test.tsx`

**Interfaces:**
- Consumes: `resume: ResumeDocumentData` from Task 3.
- Produces: `ResumeDocument({document, headerAside, hasHeaderAside}: {document: ResumeDocumentData; headerAside?: ReactNode; hasHeaderAside?: boolean}): JSX.Element`.
- Produces: `ResumeHeader({blocks, aside, hasAside}: {blocks: ResumeBlock[]; aside?: ReactNode; hasAside: boolean}): JSX.Element` for the leading profile blocks and a later photo slot.

- [ ] **Step 1: Write the failing full-fidelity test**

Render `<ResumeDocument document={resume} />`, then normalize DOM text using the same rule as `resume-text.txt`: collapse each whitespace run to a single space and trim. Compare it with the normalized fixture.

Load `resume-links.json` and, for every fixture item, assert exactly one anchor has both the exact visible label and exact URL. Assert the top-level visible order using first-index comparisons for:

```text
张悦
教育经历【外国语言 - AI 交叉领域】
校园经历【全领域创造能力】
实习与工作经历
OUTPUT【跨国数字内容科技头部企业】
深圳英鹏图灵科技-雷锋网-AI科技评论
（香港）范彻斯库科技有限公司
深圳时空壶技术有限公司【北美穿戴式AI翻译设备龙头企业】
泉州市乐云网络科技有限公司
上海晨读信息科技有限公司【字节跳动生态企业】
```

- [ ] **Step 2: Run the fidelity test and verify failure**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: FAIL because `ResumeDocument` does not exist.

- [ ] **Step 3: Implement document composition without changing content**

`ResumeDocument` renders all source blocks in source order. `ResumeHeader` may group the leading h1/contact/profile blocks for layout, but it must pass the original typed nodes directly to existing renderers. Detect the first h2 as the end of the header region; do not identify boundaries by rewritten labels. `ResumeDocument` accepts an optional generic `headerAside` React node and forwards it to `ResumeHeader`; Task 5 calls it without an aside, while Task 6 supplies `PhotoPanel`. Set `data-has-photos` on both the resume sheet and header from `hasHeaderAside` so tests and CSS share one source of truth.

Update `App` to render the document inside `<main data-resume-root="true">`.

- [ ] **Step 4: Run content and application tests**

Run:

```bash
npm test -- src/test/resume-render.test.tsx src/App.test.tsx
npm run build
```

Expected: exact text/link/order checks pass and the production build succeeds.

- [ ] **Step 5: Commit the full document composition**

```bash
git add src/App.tsx src/App.test.tsx src/components/ResumeDocument.tsx src/components/ResumeHeader.tsx src/test/resume-render.test.tsx
git commit -m "feat: compose exact resume document"
```

---

### Task 6: Add the Optional Photo Layout and Responsive Styling

**Files:**
- Create: `src/data/photos.ts`
- Create: `src/components/PhotoPanel.tsx`
- Create: `src/components/ResumePhotoLayout.tsx`
- Create: `src/test/photo-layout.test.tsx`
- Create: `src/styles.css`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `PhotoItem` from Task 2 and `ResumeDocument` from Task 5.
- Produces: `photos: PhotoItem[]`, empty in production.
- Produces: `PhotoPanel({photos}: {photos: PhotoItem[]}): JSX.Element | null`.
- Produces: `ResumePhotoLayout({document, photos}: {document: ResumeDocumentData; photos: PhotoItem[]}): JSX.Element`.

- [ ] **Step 1: Write failing conditional-layout tests**

Test two modes:

```tsx
render(<ResumePhotoLayout document={resume} photos={[]} />)
expect(screen.queryByTestId('photo-panel')).not.toBeInTheDocument()
expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'false')

render(<ResumePhotoLayout document={resume} photos={[{
  id: 'portrait', src: '/photo.jpg', alt: '个人照片'
}]} />)
expect(screen.getByTestId('photo-panel')).toBeInTheDocument()
expect(screen.getByAltText('个人照片')).toHaveAttribute('src', '/photo.jpg')
expect(screen.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'true')
```

- [ ] **Step 2: Run photo tests and verify failure**

Run: `npm test -- src/test/photo-layout.test.tsx`

Expected: FAIL because photo components do not exist.

- [ ] **Step 3: Implement empty production photo data and conditional components**

`src/data/photos.ts` exports `const photos: PhotoItem[] = []`. `PhotoPanel` returns `null` for an empty array. `ResumePhotoLayout` creates `const panel = photos.length > 0 ? <PhotoPanel photos={photos} /> : undefined`, then calls `ResumeDocument` with `headerAside={panel}` and `hasHeaderAside={photos.length > 0}`. `ResumeDocument` and `ResumeHeader` set matching `data-has-photos` values for deterministic CSS and tests.

For visual testing only, export `getPreviewPhotos()` that returns a data-URI SVG fixture only when both `import.meta.env.DEV` is true and `?photoPreview=1` is present. The production `photos` export remains empty and the default page never calls the preview function unless that development query is present.

- [ ] **Step 4: Implement restrained screen, responsive, and print CSS**

Use concrete layout rules based on this skeleton:

```css
:root {
  color: #171717;
  background: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.resume-shell { padding: 32px 16px; }
.resume-sheet {
  width: min(210mm, 100%);
  margin: 0 auto;
  padding: 16mm 18mm;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 32px rgb(15 23 42 / 8%);
}
.resume-header[data-has-photos="true"] {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(150px, 28%);
  gap: 24px;
  align-items: start;
}
.photo-panel img { width: 100%; height: auto; object-fit: cover; }
@media (max-width: 720px) {
  .resume-shell { padding: 0; }
  .resume-sheet { width: 100%; padding: 24px 18px; border: 0; box-shadow: none; }
  .resume-header[data-has-photos="true"] { grid-template-columns: 1fr; }
  .photo-panel { max-width: 240px; }
}
@page { size: A4; margin: 12mm; }
@media print {
  :root { background: #fff; }
  .resume-shell { padding: 0; }
  .resume-sheet { width: auto; padding: 0; border: 0; box-shadow: none; }
}
```

Add typography, list indentation, dividers, link wrapping, and break rules without changing DOM text. Long OUTPUT content must be allowed to split across printed pages.

- [ ] **Step 5: Wire the layout and styles**

`main.tsx` imports `styles.css`. `App` selects development preview photos only for the explicit preview query; otherwise it passes the empty `photos` array. No controls or placeholder labels appear on the page.

- [ ] **Step 6: Run component, fidelity, and build checks**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass; default output contains no photo panel; build succeeds.

- [ ] **Step 7: Commit layout and styling**

```bash
git add src/App.tsx src/main.tsx src/styles.css src/data/photos.ts src/components/PhotoPanel.tsx src/components/ResumePhotoLayout.tsx src/test/photo-layout.test.tsx
git commit -m "feat: add responsive optional photo layout"
```

---

### Task 7: Add Browser, Mobile, and Print Verification

**Files:**
- Modify: `playwright.config.ts`
- Create: `e2e/resume.spec.ts`

**Interfaces:**
- Consumes: the Vite development server and development-only `?photoPreview=1` mode from Task 6.
- Produces: reproducible desktop, tablet, mobile, photo-preview, and print-media checks.

- [ ] **Step 1: Configure Playwright web server**

Use Chromium, `baseURL: 'http://127.0.0.1:4173'`, and this server command:

```text
npm run dev -- --host 127.0.0.1 --port 4173
```

Set `reuseExistingServer: !process.env.CI`, keep screenshots only on failure, and use `test-results/` for generated artifacts.

- [ ] **Step 2: Write failing browser checks**

For widths 1440, 768, and 390:

- load `/`
- assert `main[data-resume-root="true"]` is visible
- assert the page name is `张悦`
- assert `document.documentElement.scrollWidth <= window.innerWidth`
- assert no photo panel exists
- assert six WeChat article links exist

For desktop `/?photoPreview=1`:

- assert photo panel is visible
- assert `data-has-photos="true"`
- assert its bounding box begins to the right of the header content

For 390px `/?photoPreview=1`:

- assert the photo panel top coordinate is below the identity/contact content bottom coordinate
- assert no horizontal overflow

For print media:

- call `page.emulateMedia({ media: 'print' })`
- assert computed sheet box shadow is `none`
- assert computed sheet border width is `0px`
- assert all resume text remains visible

- [ ] **Step 3: Run browser checks and verify initial failures**

Run:

```bash
npx playwright install chromium
npm run test:e2e
```

Expected: any selector/layout mismatch fails with a precise assertion before CSS or test hooks are corrected.

- [ ] **Step 4: Make the minimum layout/test-hook corrections**

Add only semantic `data-testid`/`data-*` attributes required by the approved tests. Do not add visible controls, labels, or production fixture photos.

- [ ] **Step 5: Run browser and production checks**

Run:

```bash
npm run test:e2e
npm run build
```

Expected: all viewport, photo, print, link, and overflow checks pass; build exits 0.

- [ ] **Step 6: Commit browser verification**

```bash
git add playwright.config.ts e2e src
git commit -m "test: verify responsive resume layout"
```

---

### Task 8: Add GitHub Pages Deployment Configuration

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `public/.nojekyll`
- Create: `README.md`
- Create: `src/test/deploy-config.test.ts`

**Interfaces:**
- Consumes: `npm ci`, `npm test`, and `npm run build`.
- Produces: a Pages artifact from `dist/` on pushes to `main` or manual workflow dispatch.

- [ ] **Step 1: Add a failing deployment-configuration test**

Create a Vitest file beginning with `// @vitest-environment node` that reads the workflow and requires these exact concepts:

- `actions/checkout`
- `actions/setup-node`
- Node `22`
- `npm ci`
- `npm test`
- `npm run build`
- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`
- artifact path `./dist`

Run it before the workflow exists and verify failure.

- [ ] **Step 2: Add the GitHub Pages workflow**

Use `permissions: { contents: read, pages: write, id-token: write }`, `concurrency.group: pages`, and separate build/deploy jobs. Build uses `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, and deployment uses `actions/deploy-pages@v4` with environment `github-pages`.

- [ ] **Step 3: Add `.nojekyll` and concise project instructions**

`README.md` documents:

```text
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
npm run preview
npm run sync:resume
```

Explain that `sync:resume` requires an authenticated local `lark-cli`, generated data is committed, CI never contacts Feishu, and future photos are added only through `src/data/photos.ts` plus local assets.

- [ ] **Step 4: Run deployment checks**

Run:

```bash
npm test
npm run build
test -f dist/index.html
test -f dist/.nojekyll
```

Expected: tests pass and the static artifact contains both `index.html` and `.nojekyll`.

- [ ] **Step 5: Commit deployment readiness**

```bash
git add .github public README.md src/test package.json package-lock.json
git commit -m "ci: prepare resume for GitHub Pages"
```

---

### Task 9: Perform Final Source, Visual, and Production Verification

**Files:**
- Modify only files required to fix verified defects.

**Interfaces:**
- Consumes: every implementation artifact from Tasks 1–8.
- Produces: a clean, tested, production-ready local repository with no uncommitted implementation changes.

- [ ] **Step 1: Confirm the captured source revision and generated artifacts**

Run:

```bash
rg -n "revisionId" src/data/sourceMetadata.ts
git diff --check
```

Expected: a numeric Feishu revision is recorded and `git diff --check` emits no errors.

- [ ] **Step 2: Run the full automated verification suite**

Run:

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Expected: every command exits 0 with no failed tests.

- [ ] **Step 3: Inspect the production build at representative widths**

Serve `dist/` with `npm run preview -- --host 127.0.0.1 --port 4174`. Capture and inspect full-page screenshots at 1440px and 390px. Confirm:

- conventional PDF-resume appearance
- no animation or decorative effects
- no missing or rewritten text
- correct list hierarchy and section order
- no horizontal overflow
- no empty photo area in the default build
- six article links visibly remain links

- [ ] **Step 4: Inspect photo-preview and print presentation**

Run the development server with `?photoPreview=1` and inspect desktop/mobile screenshots. Then emulate print CSS and inspect a print-media screenshot. Confirm the photo occupies the approved upper-right header position on desktop, stacks on mobile, and print removes screen-only background/shadow.

- [ ] **Step 5: Fix only evidence-backed defects and rerun affected checks**

For every defect, write or tighten the smallest failing automated assertion first, apply the minimum code/CSS change, and rerun the targeted test followed by the full suite.

- [ ] **Step 6: Commit final verified corrections**

If verification required changes:

```bash
git add -A
git commit -m "fix: finalize resume fidelity and layout"
```

If no changes were required, do not create an empty commit.

- [ ] **Step 7: Record the final state**

Run:

```bash
git status --short --branch
git log --oneline --decorate -8
```

Expected: branch `main` is clean and the log shows the design, foundation, data, rendering, layout, verification, and deployment commits.
