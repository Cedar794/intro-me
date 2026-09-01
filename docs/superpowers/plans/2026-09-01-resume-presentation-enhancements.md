# Resume Presentation Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the five approved resume-presentation enhancements without changing frozen resume content or GitHub Pages behavior.

**Architecture:** Add a small presentation layer above the generated resume blocks. Focused React components render keywords, tool capsules, the education summary, and the campus ability badge; existing renderers retain the generic path, while an optional work-section context adds measurable-result emphasis.

**Tech Stack:** React 19, TypeScript, Vite, plain CSS, Vitest, React Testing Library, Playwright, `@lobehub/icons-static-svg`

**Spec:** `docs/superpowers/specs/2026-09-01-resume-presentation-enhancements.md`

## Global Constraints

- Do not modify the frozen resume snapshot or generated content files.
- Preserve the exact normalized DOM text and all six article links.
- Keep the existing white A4/PDF visual system and relative GitHub Pages asset paths.
- Use local bundled SVG assets; do not load logos from runtime remote URLs.
- Add no animation, navigation, backend, CMS, or new resume claims.
- Write a failing behavior test and observe the expected failure before each production behavior.

---

### Task 1: Lock The Special-Presentation Contracts

**Files:**
- Modify: `src/test/resume-render.test.tsx`

**Interfaces:**
- Consumes: `ResumeDocument`, frozen `resume` data, and existing content fidelity fixture.
- Produces: behavior contracts for `keyword-list`, `tool-stack`, `education-summary`, `campus-ability`, and `data-result-highlight`.

- [ ] **Step 1: Add failing keyword and tool-stack tests**

Render the real resume and assert that eight keyword items and thirteen tool items are exposed through their named containers. Assert each tool item retains its exact original name and contains an icon marker.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: FAIL because the special containers and grouped items do not exist.

- [ ] **Step 3: Add failing education, campus, and result-emphasis tests**

Assert that the real school/date line and exact major text share one `education-summary`, the exact campus heading remains an `h2` with a dedicated ability element, and representative metrics such as `2,530 个文件` and `DAU提升200+` are contained by result emphasis.

- [ ] **Step 4: Run the focused test and verify the new assertions fail for the intended missing behaviors**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: FAIL only on the newly requested presentation behavior; the pre-existing source fidelity test remains green.

---

### Task 2: Add Local Tool-Logo Capsules

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/ToolStack.tsx`
- Modify: `src/components/ResumeBlockRenderer.tsx`
- Modify: `src/styles.css`
- Test: `src/test/resume-render.test.tsx`

**Interfaces:**
- Consumes: the exact AI tool-stack paragraph and static SVG imports.
- Produces: `ToolStack({ text }: { text: string }): JSX.Element`, `data-testid="tool-stack"`, and one `data-tool-name` capsule per listed item.

- [ ] **Step 1: Install the static SVG asset package**

Run: `npm install @lobehub/icons-static-svg@1.94.0`

Expected: the dependency and lockfile update without runtime peer dependencies.

- [ ] **Step 2: Implement the exact tool inventory and logo mapping**

Map ChatGPT Desktop to OpenAI, Deepseek Harness to DeepSeek, 即梦 to Jimeng, Suno to Suno, Gemini App to Gemini, Claude Code to Claude Code, Google AI Studio to Google, Cowork to Claude, OpenClaw to OpenClaw, Hermes Agent to Hermes, and Seedance 2.5 API to ByteDance. Render Lark CLI with a restrained local monogram and external plugins with a local utility glyph.

- [ ] **Step 3: Preserve source separators and punctuation in DOM text**

Keep every `、`, the final ` 及`, and `。` in source order while using visually hidden punctuation around the visible capsules.

- [ ] **Step 4: Add capsule styling and run the focused test**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: tool tests PASS; later special-presentation tests may remain RED.

---

### Task 3: Add Keyword, Education, And Campus Treatments

**Files:**
- Create: `src/components/ProfileHighlights.tsx`
- Modify: `src/components/ResumeBlockRenderer.tsx`
- Modify: `src/components/ResumeDocument.tsx`
- Modify: `src/styles.css`
- Test: `src/test/resume-render.test.tsx`

**Interfaces:**
- Produces: `KeywordList`, `EducationSummary`, and `CampusExperienceHeading` focused components.
- Consumes: exact inline-node content and preserves `data-resume-line` accounting.

- [ ] **Step 1: Implement the eight-keyword Google-palette list**

Keep `个人关键词：` as the black label, cycle blue/red/yellow/green variants across the exact eight keywords, and retain the source separators in DOM order.

- [ ] **Step 2: Group the two education paragraphs without reordering later blocks**

Detect the exact adjacent school/date and major paragraphs, render them through `EducationSummary`, and advance the body iterator by two blocks. Keep both source lines represented by `data-resume-line` descendants.

- [ ] **Step 3: Implement the semantic campus heading**

Render one `h2` whose accessible and DOM text remains `校园经历【全领域创造能力】`; wrap only the ability phrase in a badge with a four-color decorative rail marked `aria-hidden`.

- [ ] **Step 4: Add responsive and print styling**

Ensure all tags wrap naturally at 720px and print with legible low-saturation fills.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- src/test/resume-render.test.tsx`

Expected: keyword, education, campus, tool, and source fidelity tests PASS; result-emphasis test remains RED.

---

### Task 4: Emphasize Work Results Without Rewriting Copy

**Files:**
- Modify: `src/components/RichText.tsx`
- Modify: `src/components/NestedList.tsx`
- Modify: `src/components/ResumeBlockRenderer.tsx`
- Modify: `src/components/ResumeDocument.tsx`
- Modify: `src/styles.css`
- Test: `src/test/resume-render.test.tsx`

**Interfaces:**
- Extends: `RichText({ nodes, emphasizeResults? })`, `NestedList({ block, emphasizeResults? })`, and `ResumeBlockRenderer({ block, emphasizeResults? })`.
- Produces: semantic `strong[data-result-highlight="true"]` wrappers around hand-auditable result patterns outside existing strong nodes.

- [ ] **Step 1: Pass work-section context from the work heading onward**

Locate the exact `实习与工作经历` heading and pass `emphasizeResults` only to subsequent work blocks.

- [ ] **Step 2: Split text nodes with a hoisted metric-pattern matcher**

Emphasize quantities, percentages, durations, performance values, counts, data volumes, and `0→1` evidence. Never alter existing links or wrap content already inside a source-authored `strong` node.

- [ ] **Step 3: Give short role/date paragraphs a scan-friendly weight**

Apply a dedicated work metadata class to short work paragraphs containing the source date-range format.

- [ ] **Step 4: Run the focused test and the full unit suite**

Run:

```bash
npm test -- src/test/resume-render.test.tsx
npm test
```

Expected: all unit tests PASS and normalized source text remains byte-for-byte equivalent after whitespace normalization.

---

### Task 5: Verify Responsive, Print, And Visual Fidelity

**Files:**
- Modify: `e2e/resume.spec.ts`
- Modify: `src/styles.css` only if browser evidence reveals a mismatch

**Interfaces:**
- Extends: Playwright checks for grouped presentation elements and overflow.
- Produces: fresh desktop, tablet, mobile, and print evidence.

- [ ] **Step 1: Add browser assertions before changing production layout further**

Assert eight keyword items, thirteen tool items, no horizontal overflow at 1440/768/390 widths, and visible education/campus treatments. Assert print preserves exact resume content.

- [ ] **Step 2: Run browser tests and verify any missing browser contract fails**

Run: `npm run test:e2e`

Expected: the new checks expose any incomplete responsive or print behavior before CSS fixes.

- [ ] **Step 3: Fix only observed layout mismatches and rerun browser tests**

Run: `npm run test:e2e`

Expected: all browser tests PASS with no overflow.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: TypeScript and Vite build succeed with relative bundled logo assets.

- [ ] **Step 5: Capture and inspect fresh renders**

Use the built-in browser first. Capture desktop at the accepted reference width and mobile at 390px, then inspect the accepted screenshots and both fresh renders with `view_image`.

- [ ] **Step 6: Complete the fidelity ledger**

Record at least five comparison points: exact copy, tool/logo treatment, keyword palette, education placement, campus badge, work emphasis, responsive wrapping, and print behavior. Fix every material mismatch before handoff.

- [ ] **Step 7: Run final verification**

Run:

```bash
npm test
npm run test:e2e
npm run build
git diff --check
git status --short
```

Expected: all checks pass, no temporary QA artifacts are tracked, and only intentional source, test, dependency, and documentation files are modified.

