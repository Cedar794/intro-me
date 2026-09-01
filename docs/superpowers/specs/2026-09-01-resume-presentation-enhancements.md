# Resume Presentation Enhancements Design

## Goal

Enhance five explicitly selected areas of the existing A-style static resume while preserving every source character, link, section order, responsive rule, and print behavior.

## Approved Direction

- Keep the true-white A4 resume surface, black/gray editorial typography, open document layout, and absence of decorative animation.
- Render the personal keywords as compact, wrapping tags using a restrained Google-inspired blue/red/yellow/green palette. Keep the `个人关键词：` label black.
- Render each AI tool as a wrapping capsule containing a local logo and its original name. Use a product or parent-brand mark when the named CLI/API has no independent mark, and a restrained monogram or utility glyph when no public mark is appropriate.
- Render `荷兰语（英语）专业 （A+专业）` as a capsule immediately after the school/date line on desktop and allow it to wrap naturally below on narrow screens.
- Render `校园经历【全领域创造能力】` as one semantic heading whose ability phrase receives a dedicated badge treatment and a small four-color accent.
- In the work section, retain all source-authored bold spans and add emphasis to role/date metadata and objective result evidence such as quantities, percentages, durations, performance values, and delivery counts.

## Content Fidelity

- `src/data/resume.generated.ts`, `resume-source.xml`, `resume-text.txt`, and `resume-links.json` remain unchanged.
- Presentation components may split source strings into visible chips, but their combined DOM text must still equal the frozen source fixture exactly.
- No new resume claim, label, metric, section, tool name, or link may be introduced.
- Hidden source punctuation may preserve exact copy around chip layouts, but visible names must remain selectable and readable.

## Component Boundaries

- `ProfileHighlights` owns keyword chips, the education summary row, and the campus ability heading.
- `ToolStack` owns the exact tool-name inventory, tool-to-logo mapping, and fallback marks.
- `RichText` optionally emphasizes measurable results without altering link or existing strong-node behavior.
- `ResumeDocument` supplies section context and groups only the two education summary paragraphs.
- `ResumeBlockRenderer` dispatches approved special presentations while remaining the default renderer for all other generated blocks.

## Design Tokens

- Background: existing true white resume surface and `#f3f4f6` screen canvas.
- Body text: existing `#202020`; headings and strong content: existing `#111`.
- Keyword palette: Google-inspired blue, red, yellow, and green with pale backgrounds and accessible dark text.
- Capsule geometry: 999px radius, 1px neutral or tinted border, compact horizontal padding, no shadow.
- Tool icon size: approximately 15–16px inside a 24–28px-high capsule.
- Campus ability accent: the same four-color palette, used only in a narrow rail or dot sequence.
- Print: preserve borders and readable icon silhouettes, reduce unnecessary background saturation, and prevent capsule clipping.

## Responsive And Print Behavior

- Keyword and tool capsules wrap within the available header width and never create horizontal overflow.
- The education summary is a flex row on desktop and wraps into a natural vertical flow on narrow screens.
- The campus heading badge can wrap below the section label without separating the semantic `h2`.
- Work emphasis does not change paragraph order or introduce fixed heights.
- A4 print remains frameless and readable; headings and summary rows avoid awkward breaks where possible.

## Verification

- Unit tests cover chip counts, exact visible names, education grouping, semantic campus heading, measurable-result emphasis, and complete source-text fidelity.
- Browser checks cover 1440px, 768px, and 390px widths plus print media with no horizontal overflow.
- Visual review compares the accepted browser-comment screenshots with fresh desktop and mobile renders, including at least five concrete fidelity points.

