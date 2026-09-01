import { useId, useState } from 'react'
import type { InlineNode, ListBlock, ListItem } from '../data/resumeTypes'
import { inlineText } from '../data/inlineText'
import { NestedList } from './NestedList'
import { RichText } from './RichText'

type CampusCapabilityRadarProps = {
  heading: InlineNode[]
  list: ListBlock
}

const DIMENSION_POSITIONS = ['top', 'right', 'bottom', 'left'] as const

function CampusDetail({
  active,
  index,
  item,
  panelId,
  onClose,
}: {
  active: boolean
  index: number
  item: ListItem
  panelId: string
  onClose: () => void
}) {
  return (
    <section
      aria-hidden={!active}
      className="campus-radar-detail"
      data-active={String(active)}
      data-campus-detail="true"
      data-testid={`campus-detail-${index}`}
      id={panelId}
    >
      <button
        aria-label="关闭校园经历详情"
        className="campus-radar-close"
        onClick={onClose}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="m5 5 10 10M15 5 5 15" />
        </svg>
      </button>
      <h3 className="campus-radar-detail-title" data-resume-line="true">
        <RichText nodes={item.content} />
      </h3>
      {item.children.map((child, childIndex) => (
        <NestedList
          block={child}
          key={`campus-${index}-detail-${childIndex}`}
          path={`campus-${index}-detail-${childIndex}`}
        />
      ))}
    </section>
  )
}

export function CampusCapabilityRadar({
  heading,
  list,
}: CampusCapabilityRadarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const panelPrefix = useId()
  const headingText = inlineText(heading)
  const abilityStart = headingText.indexOf('【')
  const sectionLabel = abilityStart === -1
    ? headingText
    : headingText.slice(0, abilityStart)
  const abilityLabel = abilityStart === -1
    ? ''
    : headingText.slice(abilityStart)
  const dimensions = list.items.slice(0, DIMENSION_POSITIONS.length)

  function dismissDetails() {
    setActiveIndex(null)
  }

  return (
    <section className="campus-capability-section">
      <h2
        className="resume-heading resume-heading-section campus-experience-heading"
        data-resume-line="true"
      >
        <span>{sectionLabel}</span>
        {abilityLabel ? (
          <span className="visually-hidden">{abilityLabel}</span>
        ) : null}
      </h2>
      <div
        className="campus-radar"
        data-active-dimension={activeIndex ?? ''}
        data-testid="campus-radar"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            dismissDetails()
          }
        }}
        onMouseLeave={dismissDetails}
      >
        <div className="campus-radar-map">
          <div className="campus-radar-visual" aria-hidden="true">
            <svg className="campus-radar-svg" viewBox="0 0 600 360">
              <defs>
                <linearGradient id={`${panelPrefix}-field`} x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#4285f4" />
                  <stop offset="0.34" stopColor="#ea4335" />
                  <stop offset="0.68" stopColor="#fbbc04" />
                  <stop offset="1" stopColor="#34a853" />
                </linearGradient>
              </defs>
              <g className="campus-radar-grid">
                <polygon points="300,44 464,180 300,316 136,180" />
                <polygon points="300,88 412,180 300,272 188,180" />
                <polygon points="300,132 356,180 300,228 244,180" />
                <path d="M300 44v272M136 180h328" />
              </g>
              <polygon
                className="campus-radar-field"
                fill={`url(#${panelPrefix}-field)`}
                points="300,56 450,180 300,304 150,180"
              />
              <g className="campus-radar-points">
                <circle className="campus-radar-point campus-radar-point--blue" cx="300" cy="44" r="6" />
                <circle className="campus-radar-point campus-radar-point--red" cx="464" cy="180" r="6" />
                <circle className="campus-radar-point campus-radar-point--yellow" cx="300" cy="316" r="6" />
                <circle className="campus-radar-point campus-radar-point--green" cx="136" cy="180" r="6" />
              </g>
              <text className="campus-radar-center" textAnchor="middle" x="300" y="174">
                全领域
              </text>
              <text className="campus-radar-center" textAnchor="middle" x="300" y="196">
                创造能力
              </text>
            </svg>
          </div>
          <div aria-label="校园能力维度" className="campus-radar-dimensions" role="group">
            {dimensions.map((item, index) => {
              const panelId = `${panelPrefix}-campus-detail-${index}`
              const active = activeIndex === index

              return (
                <button
                  aria-controls={panelId}
                  aria-expanded={active}
                  className={`campus-radar-dimension campus-radar-dimension--${DIMENSION_POSITIONS[index]}`}
                  data-active={String(active)}
                  data-campus-dimension="true"
                  key={inlineText(item.content)}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  type="button"
                >
                  <span className="campus-radar-dimension-marker" aria-hidden="true" />
                  <RichText nodes={item.content} />
                </button>
              )
            })}
          </div>
        </div>
        <div aria-live="polite" className="campus-radar-detail-layer">
          {dimensions.map((item, index) => (
            <CampusDetail
              active={activeIndex === index}
              index={index}
              item={item}
              key={`campus-detail-${inlineText(item.content)}`}
              onClose={dismissDetails}
              panelId={`${panelPrefix}-campus-detail-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
