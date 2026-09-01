import { expect, test } from 'vitest'
import { computeEvidenceLayout } from '../lib/computeEvidenceLayout'

const base = { canvasWidth: 1400, sheet: { left: 303, top: 0, width: 794, height: 1000 }, railGap: 24, itemGap: 24, leadOffset: 24, outerPadding: 24 }
test('keeps same-side callouts ordered and separated by the requested gap', () => {
  const result = computeEvidenceLayout({ ...base, entries: [
    { groupId: 'one', number: 1, side: 'right', anchor: { x: 1020, y: 100 }, callout: { width: 240, height: 100 } },
    { groupId: 'three', number: 3, side: 'right', anchor: { x: 1030, y: 70 }, callout: { width: 240, height: 120 } },
  ] })
  expect(result.items.map((item) => item.top)).toEqual([76, 200])
  expect(result.items[1].top).toBeGreaterThanOrEqual(result.items[0].top + result.items[0].height + 24)
})
test('places alternating sides outside the sheet and emits orthogonal points', () => {
  const result = computeEvidenceLayout({ ...base, entries: [
    { groupId: 'right', number: 1, side: 'right', anchor: { x: 1060, y: 100 }, callout: { width: 240, height: 80 } },
    { groupId: 'left', number: 2, side: 'left', anchor: { x: 330, y: 200 }, callout: { width: 240, height: 80 } },
  ] })
  const right = result.items[0]; const left = result.items[1]
  expect(right.left).toBeGreaterThanOrEqual(1121); expect(left.left + left.width).toBeLessThanOrEqual(279)
  expect(right.points[0]).toEqual({ x: 1060, y: 100 }); expect(right.points.at(-1)?.x).toBe(right.left)
  expect(left.points.at(-1)?.x).toBe(left.left + left.width); expect(result.canvasHeight).toBe(1000)
})
