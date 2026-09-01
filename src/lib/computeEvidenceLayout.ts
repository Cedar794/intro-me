import type { EvidenceSide } from '../data/evidencePresentation'
type Point = { x: number; y: number }; type Size = { width: number; height: number }; type Rect = Size & { left: number; top: number }
export type EvidenceLayoutEntry = { groupId: string; number: number; side: EvidenceSide; anchor: Point; callout: Size }
export type EvidenceLayoutItem = EvidenceLayoutEntry & { top: number; left: number; width: number; height: number; points: Point[] }
export type EvidenceLayoutInput = { canvasWidth: number; sheet: Rect; entries: EvidenceLayoutEntry[]; railGap: number; itemGap: number; leadOffset: number; outerPadding: number }
export type EvidenceLayoutResult = { canvasHeight: number; items: EvidenceLayoutItem[] }
export function computeEvidenceLayout(input: EvidenceLayoutInput): EvidenceLayoutResult {
  const sheetRight = input.sheet.left + input.sheet.width; const placed = new Map<string, EvidenceLayoutItem>(); let canvasHeight = input.sheet.top + input.sheet.height
  for (const side of ['left','right'] as const) { let previousBottom = input.sheet.top
    for (const entry of input.entries.filter((candidate) => candidate.side === side)) {
      const top = Math.max(input.sheet.top, entry.anchor.y - input.leadOffset, previousBottom === input.sheet.top ? input.sheet.top : previousBottom + input.itemGap)
      const left = side === 'left' ? input.sheet.left - input.railGap - entry.callout.width : sheetRight + input.railGap; const endX = side === 'left' ? left + entry.callout.width : left; const edge = side === 'left' ? input.sheet.left : sheetRight; const y = top + Math.min(entry.callout.height / 2, 32); const midX = (edge + endX) / 2
      placed.set(entry.groupId, { ...entry, top, left, width: entry.callout.width, height: entry.callout.height, points: [entry.anchor,{x:edge,y:entry.anchor.y},{x:midX,y:entry.anchor.y},{x:midX,y},{x:endX,y}] }); previousBottom = top + entry.callout.height; canvasHeight = Math.max(canvasHeight, previousBottom + input.outerPadding)
    }
  }
  return { canvasHeight, items: input.entries.map((entry) => placed.get(entry.groupId)!) }
}
