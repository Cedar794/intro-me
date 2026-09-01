# External Resume Evidence Callouts Design

**Date:** 2026-09-01

## Status

Approved in conversation. This document supersedes the inline evidence-placement portions of `2026-09-01-resume-evidence-gallery-design.md`; the existing evidence registry, source-fidelity rules, asset requirements, and print constraints remain valid.

## Objective

Keep the resume sheet visually equivalent to a normal text-first A4 resume while presenting all 19 supplied evidence images outside the sheet. On wide screens, evidence appears in balanced left and right rails connected to exact source anchors with restrained leader lines. On narrow screens, the sheet keeps only numbered anchor controls and opens a simple full-screen evidence viewer on demand.

## Confirmed Decisions

- Desktop evidence uses two exterior rails with automatic left/right alternation.
- The resume sheet contains no evidence images.
- Each evidence group is connected to its source with a numbered anchor and a leader line.
- Mobile and other narrow layouts show numbered anchors only.
- Activating a narrow-layout anchor opens a full-screen white viewer.
- Multi-image groups are stacked vertically in the full-screen viewer; there is no carousel.
- Print hides anchors, callouts, lines, and the viewer and produces the clean A4 resume.
- No resume wording, link, punctuation, emphasis, ordering, or source-of-truth file changes are permitted.

## Non-Goals

- No animated line drawing, parallax, floating cards, masonry motion, or decorative transitions.
- No image editing, generated thumbnails, remote storage, backend, database, or routing.
- No manual per-image coordinate maintenance.
- No horizontal scrolling canvas on mobile.
- No change to the established AI-tool chips, role capsules, education tag, or campus star-map visual language.

## Layout Architecture

The screen layout becomes an evidence canvas with three visual zones:

```text
left evidence rail  <---  pure A4 resume sheet  --->  right evidence rail
```

`ResumeEvidenceCanvas` owns the exterior layout. It renders:

1. a centered `ResumeDocument` sheet;
2. a sibling left evidence rail;
3. a sibling right evidence rail;
4. a sibling SVG leader-line overlay;
5. a conditionally rendered narrow-layout evidence viewer.

`ResumeDocument` continues to render the exact resume structure. Evidence-aware renderers may add small numbered anchor controls beside matching source text, but `EvidenceGallery`, `PhotoPanel`, and all evidence `<img>` elements move outside `.resume-sheet`.

The canvas, not the sheet, expands if an exterior rail extends beyond the resume bottom. Exterior callouts never add grid rows, margins, or height to source paragraphs and list items.

## Wide-Screen Geometry

The full canvas centers an A4-like sheet and reserves one rail on each side. The sheet returns to its clean resume width rather than retaining the wider inline-gallery width. Each exterior rail receives enough width for a readable 240–280 px evidence preview at the accepted desktop viewport.

Wide-screen mode is enabled only when both rails fit without shrinking the sheet below its intended reading width. The initial implementation target is approximately 1200 px and above; the final breakpoint must be validated from actual rendered geometry rather than chosen solely from a device label.

Evidence groups are sorted by source-anchor vertical position. The first group starts on the right, the second on the left, and subsequent groups alternate sides. Within each rail, groups preserve document order.

For each rail, a placement pass computes:

```text
desiredTop = anchorCenterY - calloutLeadOffset
placedTop  = max(desiredTop, previousCalloutBottom + railGap)
```

This monotonic placement prevents same-side overlap and line crossing. The canvas height is the maximum of the sheet height and the final callout bottom plus outer padding.

## Leader Lines and Markers

Every evidence group receives one stable, document-order number. The same number appears:

- beside the matching source text;
- at the inner edge of the exterior callout;
- in the narrow-layout viewer heading.

Leader lines are thin neutral-gray orthogonal polylines. A line begins at the numbered source anchor, exits through the nearest sheet edge, and terminates at the numbered callout marker. Numbering remains the primary mapping signal so the interface does not rely on color alone.

The SVG overlay uses measured canvas coordinates and `pointer-events: none`. Lines sit behind anchor controls and callout links. There is no line-drawing animation; hover and focus may increase contrast only if the effect is instantaneous and restrained.

## Exterior Callouts

An `EvidenceCallout` contains:

- one group number;
- the existing evidence caption;
- one or more linked local images.

Callouts do not use a raised card shell. The page background remains visible around each image. Images keep a subtle border, render with `object-fit: contain`, and link to the original local asset in a new tab. Preview size is bounded so unusually tall screenshots do not dominate the rail; the original remains available through the link.

Multi-image desktop groups use a compact internal grid or stack inside one callout and share one leader line. Asset order remains exactly the order in `evidence.ts`.

## Source Anchors

The existing exact-text resolver remains the binding authority.

- Header profiles anchor to the opening personal-information region.
- Education evidence anchors to `毕业设计研究方向`.
- OUTPUT evidence anchors to the existing labeled list item.
- Ordinary source anchors appear at the end of their matched source line without changing the frozen resume text container.

Anchor controls use accessible labels such as `查看证据 4：双语评审规模化交付`. They are keyboard focusable. Their visible number is excluded from the frozen source-text fidelity selection.

## Campus Radar Mapping

Campus evidence must remain available while the radar is in its default state, so wide-screen leader lines do not originate from hidden hover-detail content.

Each campus evidence group maps to its relevant radar dimension label:

- innovation and entrepreneurship: YourGen;
- school-enterprise organization: campus event and AIPO;
- diplomatic academics: Model United Nations;
- art and multimedia: Waarzegger.

If a dimension owns more than one evidence group, its label shows adjacent numbered anchors. The same numbers also appear beside the exact matching lines when the hover/focus/tap detail is revealed. Wide-screen leader geometry stays attached to the always-visible dimension label to prevent reflow or line jumps during radar interaction.

Campus detail retains the existing white light-field presentation and text behavior but contains no images.

## Narrow-Screen Viewer

When the exterior rails cannot fit, callouts and leader lines are removed from layout. The resume shows only the numbered anchor controls.

Activating an anchor opens an accessible full-screen white evidence viewer that contains:

- a compact top bar with `返回简历`;
- the stable group number and caption;
- all group images in registry order, stacked vertically;
- original-image links where useful.

The viewer scrolls vertically and has no carousel or decorative transition. It closes through `返回简历`, backdrop activation where applicable, or `Escape`. Closing restores focus to the anchor that opened it. Background document scrolling is disabled only while the viewer is open.

## Measurement and Reflow

`useEvidenceLayout` measures anchors, sheet bounds, callout sizes, and canvas bounds after render. It recalculates when any relevant geometry can change:

- viewport size;
- web-font completion;
- local image load;
- resume or callout resize observed through `ResizeObserver`;
- campus anchor visibility or layout changes that affect measured labels.

Measurements are scheduled in one animation frame and committed as a single layout result to avoid repeated synchronous read/write loops. The hook removes observers and scheduled frames on cleanup.

If an evidence group cannot resolve its source anchor, development builds emit a clear warning naming the group and anchor. The system must not silently connect it to unrelated copy. Automated tests require all production groups to resolve, so this fallback is diagnostic rather than a normal user-visible state.

## Data and Component Boundaries

The evidence registry remains separate from generated resume data. It may gain presentation-neutral stable numbering derived from document order, but source content remains immutable.

Planned responsibilities:

- `ResumeEvidenceCanvas`: composes the sheet, exterior rails, line layer, and viewer.
- `EvidenceAnchor`: accessible numbered control registered against one evidence group.
- `EvidenceCallout`: exterior desktop rendering for one group.
- `EvidenceLeaderLines`: SVG projection of measured source and callout endpoints.
- `EvidenceViewer`: narrow-layout full-screen rendering for one group.
- `useEvidenceLayout`: measurement, alternating-side assignment, collision avoidance, and resize updates.
- `EvidenceGallery`: reusable image list used only by callouts and the viewer, never inside the sheet.

The layout result is derived data. It is not persisted and does not modify the registry.

## Accessibility

- Anchor controls are real buttons with group-specific accessible names.
- Desktop callout images remain links to originals.
- Number markers provide a non-color association between text and evidence.
- The full-screen viewer has dialog semantics, an accessible name, focus entry, focus containment, Escape support, and focus restoration.
- Reduced-motion preferences are respected; no required state depends on animation.
- Lines are supplementary and ignored by assistive technology.

## Print

Print media hides:

- exterior rails and callouts;
- SVG leader lines;
- numbered evidence anchors;
- the full-screen viewer.

The canvas collapses to the existing clean A4 sheet. No empty evidence columns or callout spacing remain in print flow.

## Testing and Acceptance

### Unit and component tests

- All 15 evidence groups and 19 assets still resolve.
- Every non-header evidence group finds the intended frozen source anchor.
- `.resume-sheet img` returns zero in the default production render.
- Each group creates one correctly labeled anchor; campus dimension mappings create the expected grouped anchors.
- Opening and closing the viewer shows the correct group, stacks assets in registry order, handles Escape, and restores focus.
- Frozen resume text and the four source-of-truth files remain unchanged.

### Browser tests

- At a validated wide desktop viewport, every evidence image lies fully outside the sheet bounding box.
- Callouts alternate right/left in document order and do not overlap within either rail.
- Each rendered leader line references the correct group number and terminates at the matching side.
- Resizing from wide to narrow removes exterior callouts without horizontal overflow.
- At 390 px, images are absent until an anchor is activated; the viewer then renders only the selected group.
- Campus radar hover/focus/tap and outside-dismiss behaviors remain intact.
- All 19 local asset requests succeed.
- Print produces a one-column A4 resume with no evidence UI.

### Visual QA

Browser verification covers at least:

- wide desktop default state with both rails;
- wide desktop campus hover state;
- a representative OUTPUT anchor and callout line;
- 390 px default resume state;
- 390 px full-screen multi-image viewer;
- print preview.

Visual review checks line crossings, callout overlap, clipping, unreadable markers, excessive gaps, z-index errors, scroll traps, and console warnings.

## Migration

The current inline evidence implementation is refactored rather than duplicated:

1. keep the evidence assets and registry;
2. replace inline `ResumeEvidencePair` image rendering with source anchors;
3. move header Profile images from `ResumeHeader` into the exterior callout system;
4. remove images from campus detail while retaining its text and anchor numbers;
5. compose the new canvas around `ResumeDocument`;
6. delete obsolete inline evidence CSS after the new tests are green.

No deployment, remote push, branch merge, or GitHub Pages publication is part of this design change.
