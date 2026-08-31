import type { PropsWithChildren } from 'react'

type ResumeSectionProps = PropsWithChildren<{
  className?: string
}>

export function ResumeSection({ children, className }: ResumeSectionProps) {
  const classes = ['resume-section', className].filter(Boolean).join(' ')
  return <section className={classes}>{children}</section>
}
