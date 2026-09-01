import { Fragment } from 'react'
import type { InlineNode } from '../data/resumeTypes'
import { RichText } from './RichText'

const KEYWORD_PREFIX = '个人关键词：'
const KEYWORD_SEPARATOR = '｜'

export function KeywordList({ text }: { text: string }) {
  const keywordText = text.startsWith(KEYWORD_PREFIX)
    ? text.slice(KEYWORD_PREFIX.length)
    : text
  const keywords = keywordText.split(KEYWORD_SEPARATOR).filter(Boolean)

  return (
    <p className="resume-paragraph keyword-line" data-resume-line="true">
      <strong className="profile-highlight-label">{KEYWORD_PREFIX}</strong>
      <span className="keyword-list" data-testid="keyword-list" role="list">
        {keywords.map((keyword, index) => (
          <Fragment key={keyword}>
            <span
              className={`keyword-chip keyword-chip--tone-${(index % 4) + 1}`}
              role="listitem"
            >
              {keyword}
            </span>
            {index < keywords.length - 1 ? (
              <span aria-hidden="true" className="source-punctuation">
                {KEYWORD_SEPARATOR}
              </span>
            ) : null}
          </Fragment>
        ))}
      </span>
    </p>
  )
}

type EducationSummaryProps = {
  school: InlineNode[]
  major: InlineNode[]
}

export function EducationSummary({ school, major }: EducationSummaryProps) {
  return (
    <div className="education-summary" data-testid="education-summary">
      <p
        className="resume-paragraph education-school-line"
        data-resume-line="true"
      >
        <RichText nodes={school} />
      </p>
      <p className="resume-paragraph education-tag-line" data-resume-line="true">
        <span className="education-tag" data-education-tag="true">
          <RichText nodes={major} />
        </span>
      </p>
    </div>
  )
}

export function CampusExperienceHeading({ text }: { text: string }) {
  const abilityStart = text.indexOf('【')
  const sectionLabel = abilityStart === -1 ? text : text.slice(0, abilityStart)
  const abilityLabel = abilityStart === -1 ? '' : text.slice(abilityStart)

  return (
    <h2
      className="resume-heading resume-heading-section campus-experience-heading"
      data-resume-line="true"
    >
      <span>{sectionLabel}</span>
      {abilityLabel ? (
        <span className="campus-ability-badge" data-testid="campus-ability">
          {abilityLabel}
        </span>
      ) : null}
    </h2>
  )
}
