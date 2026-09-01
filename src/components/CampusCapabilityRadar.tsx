import { useEffect, useId, useRef, useState } from 'react'
import type { EvidenceResolver } from '../data/evidence'
import {
  findEvidencePresentation,
  type EvidencePresentationItem,
  campusEvidenceGroupIdsByDimension,
} from '../data/evidencePresentation'
import type { InlineNode, ListBlock, ListItem } from '../data/resumeTypes'
import { inlineText } from '../data/inlineText'
import { EvidenceAnchor, type EvidenceActivationHandler } from './EvidenceAnchor'
import { NestedList } from './NestedList'
import { RichText } from './RichText'

type CampusCapabilityRadarProps = {
  heading: InlineNode[]
  list: ListBlock
  evidencePresentation?: EvidencePresentationItem[]
  evidenceResolver?: EvidenceResolver
  onEvidenceActivate?: EvidenceActivationHandler
}

const DIMENSION_POSITIONS = ['top', 'right', 'bottom', 'left'] as const

function CampusDetail({
  active,
  evidencePresentation,
  evidenceResolver,
  index,
  item,
  onEvidenceActivate,
  panelId,
}: {
  active: boolean
  evidencePresentation: EvidencePresentationItem[]
  evidenceResolver?: EvidenceResolver
  index: number
  item: ListItem
  onEvidenceActivate?: EvidenceActivationHandler
  panelId: string
}) {
  const titleEvidence = evidenceResolver?.(inlineText(item.content))
  const titleEvidenceItem = titleEvidence && evidencePresentation.length > 0
    ? findEvidencePresentation(titleEvidence.id, evidencePresentation)
    : undefined

  return (
    <section
      aria-hidden={!active}
      className="campus-radar-detail"
      data-active={String(active)}
      data-campus-detail="true"
      data-testid={`campus-detail-${index}`}
      id={panelId}
    >
      <h3 className="campus-radar-detail-title" data-resume-line="true">
        <RichText nodes={item.content} />
        {titleEvidenceItem ? (
          <EvidenceAnchor
            item={titleEvidenceItem}
            onActivate={onEvidenceActivate}
            primary={false}
          />
        ) : null}
      </h3>
      {item.children.map((child, childIndex) => (
        <NestedList
          block={child}
          evidenceMode="secondary-anchor"
          evidencePresentation={evidencePresentation}
          evidenceResolver={evidenceResolver}
          key={`campus-${index}-detail-${childIndex}`}
          onEvidenceActivate={onEvidenceActivate}
          path={`campus-${index}-detail-${childIndex}`}
        />
      ))}
    </section>
  )
}

export function CampusCapabilityRadar({
  evidencePresentation = [],
  evidenceResolver,
  heading,
  list,
  onEvidenceActivate,
}: CampusCapabilityRadarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const radarRef = useRef<HTMLDivElement>(null)
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

  function showDetails(index: number) {
    setActiveIndex(index)
  }

  function dismissDetails() {
    setActiveIndex(null)
  }

  useEffect(() => {
    if (activeIndex === null) {
      return undefined
    }

    function dismissOnOutsidePointer(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && !radarRef.current?.contains(target)) {
        dismissDetails()
      }
    }

    document.addEventListener('pointerdown', dismissOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', dismissOnOutsidePointer)
  }, [activeIndex])

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
        onBlur={(event) => {
          const nextFocus = event.relatedTarget
          if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
            dismissDetails()
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            dismissDetails()
          }
        }}
        onMouseLeave={(event) => {
          const nextTarget = event.relatedTarget
          if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
            return
          }
          dismissDetails()
        }}
        ref={radarRef}
      >
        <div className="campus-radar-map">
          <div className="campus-radar-visual" aria-hidden="true">
            <div className="campus-star-map" data-testid="campus-star-map">
              <span className="campus-star-map-aurora" />
              <span className="campus-star-map-orbit campus-star-map-orbit--outer" />
              <span className="campus-star-map-orbit campus-star-map-orbit--inner" />
              {DIMENSION_POSITIONS.map((position, index) => (
                <span
                  className={`campus-star-map-axis campus-star-map-axis--${position}`}
                  data-axis={index}
                  data-campus-star-axis="true"
                  key={position}
                >
                  <span className="campus-star-map-axis-line" />
                  <span className="campus-star-map-node" />
                </span>
              ))}
              <span className="campus-star-map-core">
                <span>全领域</span>
                <strong>创造能力</strong>
              </span>
            </div>
          </div>
          <div aria-label="校园能力维度" className="campus-radar-dimensions" role="group">
            {dimensions.map((item, index) => {
              const panelId = `${panelPrefix}-campus-detail-${index}`
              const active = activeIndex === index
              const position = DIMENSION_POSITIONS[index]
              const dimensionItems = evidencePresentation.length > 0
                ? campusEvidenceGroupIdsByDimension[index].map((groupId) =>
                  findEvidencePresentation(groupId, evidencePresentation),
                )
                : []

              return (
                <div
                  className={`campus-radar-dimension-wrap campus-radar-dimension-wrap--${position}`}
                  data-active={String(active)}
                  key={inlineText(item.content)}
                  onMouseMove={() => showDetails(index)}
                >
                  <button
                    aria-controls={panelId}
                    aria-expanded={active}
                    className="campus-radar-dimension"
                    data-active={String(active)}
                    data-campus-dimension="true"
                    onClick={() => showDetails(index)}
                    onFocus={() => showDetails(index)}
                    type="button"
                  >
                    <span className="campus-radar-dimension-label">
                      <RichText nodes={item.content} />
                    </span>
                  </button>
                  <span className="campus-dimension-evidence-anchors">
                    {dimensionItems.map((evidenceItem) => (
                      <EvidenceAnchor
                        item={evidenceItem}
                        key={evidenceItem.group.id}
                        onActivate={onEvidenceActivate}
                      />
                    ))}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div aria-live="polite" className="campus-radar-detail-layer">
          {dimensions.map((item, index) => (
            <CampusDetail
              active={activeIndex === index}
              evidencePresentation={evidencePresentation}
              evidenceResolver={evidenceResolver}
              index={index}
              item={item}
              key={`campus-detail-${inlineText(item.content)}`}
              onEvidenceActivate={onEvidenceActivate}
              panelId={`${panelPrefix}-campus-detail-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
