import type { EvidenceLayoutItem } from '../lib/computeEvidenceLayout'

type EvidenceLeaderLinesProps = {
  items: EvidenceLayoutItem[]
  width: number
  height: number
}

export function EvidenceLeaderLines({
  items,
  width,
  height,
}: EvidenceLeaderLinesProps) {
  return (
    <svg
      aria-hidden="true"
      className="evidence-leader-lines"
      height={height}
      pointerEvents="none"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {items.map((item) => (
        <polyline
          className="evidence-leader-line"
          data-evidence-line-id={item.groupId}
          data-evidence-number={item.number}
          key={item.groupId}
          points={item.points.map((point) => `${point.x},${point.y}`).join(' ')}
        />
      ))}
    </svg>
  )
}
