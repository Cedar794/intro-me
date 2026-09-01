import { useLayoutEffect, useState, type RefObject } from 'react'
import type { EvidencePresentationItem } from '../data/evidencePresentation'
import {
  computeEvidenceLayout,
  type EvidenceLayoutResult,
} from '../lib/computeEvidenceLayout'

type UseEvidenceLayoutOptions = {
  canvasRef: RefObject<HTMLDivElement | null>
  sheetRef: RefObject<HTMLElement | null>
  presentationItems: EvidencePresentationItem[]
  wide: boolean
}

type MeasuredEvidenceLayoutResult = EvidenceLayoutResult & {
  canvasWidth: number
}

const RAIL_GAP = 24
const ITEM_GAP = 24
const LEAD_OFFSET = 24
const OUTER_PADDING = 24

export function useEvidenceLayout({
  canvasRef,
  sheetRef,
  presentationItems,
  wide,
}: UseEvidenceLayoutOptions): MeasuredEvidenceLayoutResult | null {
  const [layout, setLayout] = useState<MeasuredEvidenceLayoutResult | null>(null)

  useLayoutEffect(() => {
    if (!wide) {
      setLayout(null)
      return undefined
    }

    const canvas = canvasRef.current
    const sheet = sheetRef.current
    if (!canvas || !sheet) {
      setLayout(null)
      return undefined
    }
    const canvasElement: HTMLDivElement = canvas
    const sheetElement: HTMLElement = sheet

    let disposed = false
    let frame: number | null = null
    const warnedMissing = new Set<string>()
    const observedElements = new Set<Element>([canvasElement, sheetElement])

    const callouts = new Map(
      Array.from(
        canvasElement.querySelectorAll<HTMLElement>('[data-evidence-callout-id]'),
      ).map((element) => [element.dataset.evidenceCalloutId ?? '', element]),
    )
    const anchors = new Map(
      Array.from(
        canvasElement.querySelectorAll<HTMLElement>(
          '[data-evidence-anchor-primary="true"][data-evidence-anchor-id]',
        ),
      ).map((element) => [element.dataset.evidenceAnchorId ?? '', element]),
    )

    for (const element of [...anchors.values(), ...callouts.values()]) {
      observedElements.add(element)
    }

    function warnMissing(
      item: EvidencePresentationItem,
      kind: 'primary anchor' | 'callout',
    ) {
      const warningKey = `${kind}:${item.group.id}`
      if (!import.meta.env.DEV || warnedMissing.has(warningKey)) {
        return
      }

      warnedMissing.add(warningKey)
      console.warn(
        `[evidence-layout] Missing ${kind} for ${item.group.id} (${item.group.anchor})`,
      )
    }

    function hideCallouts() {
      for (const callout of callouts.values()) {
        callout.style.visibility = 'hidden'
      }
    }

    function measure() {
      if (disposed) {
        return
      }

      const canvasRect = canvasElement.getBoundingClientRect()
      const sheetRect = sheetElement.getBoundingClientRect()
      const entries = []

      for (const item of presentationItems) {
        const anchor = anchors.get(item.group.id)
        const callout = callouts.get(item.group.id)

        if (!anchor) {
          warnMissing(item, 'primary anchor')
        }
        if (!callout) {
          warnMissing(item, 'callout')
        }
        if (!anchor || !callout) {
          hideCallouts()
          setLayout(null)
          return
        }

        const anchorRect = anchor.getBoundingClientRect()
        const calloutRect = callout.getBoundingClientRect()
        entries.push({
          groupId: item.group.id,
          number: item.number,
          side: item.side,
          anchor: {
            x: (
              item.side === 'left'
                ? anchorRect.left
                : anchorRect.right
            ) - canvasRect.left,
            y: anchorRect.top + anchorRect.height / 2 - canvasRect.top,
          },
          callout: {
            width: calloutRect.width,
            height: calloutRect.height,
          },
        })
      }

      const result = computeEvidenceLayout({
        canvasWidth: canvasRect.width,
        sheet: {
          left: sheetRect.left - canvasRect.left,
          top: sheetRect.top - canvasRect.top,
          width: sheetRect.width,
          height: sheetRect.height,
        },
        entries,
        railGap: RAIL_GAP,
        itemGap: ITEM_GAP,
        leadOffset: LEAD_OFFSET,
        outerPadding: OUTER_PADDING,
      })

      for (const item of result.items) {
        const callout = callouts.get(item.groupId)
        if (!callout) {
          continue
        }
        callout.style.top = `${item.top}px`
        callout.style.left = `${item.left}px`
        callout.style.visibility = 'visible'
      }

      setLayout({ ...result, canvasWidth: canvasRect.width })
    }

    function scheduleMeasurement() {
      if (disposed || frame !== null) {
        return
      }

      if (typeof window.requestAnimationFrame !== 'function') {
        measure()
        return
      }

      frame = window.requestAnimationFrame(() => {
        frame = null
        measure()
      })
    }

    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(scheduleMeasurement)
      : null
    for (const element of observedElements) {
      observer?.observe(element)
    }

    const fonts = 'fonts' in document ? document.fonts : undefined
    void fonts?.ready.then(() => {
      if (!disposed) {
        scheduleMeasurement()
      }
    })
    scheduleMeasurement()

    return () => {
      disposed = true
      observer?.disconnect()
      if (frame !== null && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(frame)
      }
      for (const callout of callouts.values()) {
        callout.style.removeProperty('top')
        callout.style.removeProperty('left')
        callout.style.removeProperty('visibility')
      }
    }
  }, [canvasRef, presentationItems, sheetRef, wide])

  return layout
}
