import { Fragment, type ReactNode } from 'react'
import byteDanceLogo from '@lobehub/icons-static-svg/icons/bytedance-color.svg'
import claudeLogo from '@lobehub/icons-static-svg/icons/claude-color.svg'
import claudeCodeLogo from '@lobehub/icons-static-svg/icons/claudecode-color.svg'
import deepSeekLogo from '@lobehub/icons-static-svg/icons/deepseek-color.svg'
import geminiLogo from '@lobehub/icons-static-svg/icons/gemini-color.svg'
import googleLogo from '@lobehub/icons-static-svg/icons/google-color.svg'
import hermesLogo from '@lobehub/icons-static-svg/icons/hermesagent.svg'
import jimengLogo from '@lobehub/icons-static-svg/icons/jimeng-color.svg'
import openAiLogo from '@lobehub/icons-static-svg/icons/openai.svg'
import openClawLogo from '@lobehub/icons-static-svg/icons/openclaw-color.svg'
import sunoLogo from '@lobehub/icons-static-svg/icons/suno.svg'

const TOOL_STACK_PREFIX = 'AI工具栈：'
const FINAL_JOINER = ' 及'
const SENTENCE_END = '。'

const logoByTool: Record<string, string> = {
  'ChatGPT Desktop': openAiLogo,
  'Deepseek Harness': deepSeekLogo,
  即梦: jimengLogo,
  Suno: sunoLogo,
  'Gemini App': geminiLogo,
  'Claude Code': claudeCodeLogo,
  'Google AI Studio': googleLogo,
  Cowork: claudeLogo,
  OpenClaw: openClawLogo,
  'Hermes Agent': hermesLogo,
  'Seedance 2.5 API': byteDanceLogo,
}

type ToolStackParts = {
  tools: string[]
  regularToolCount: number
}

function parseToolStack(text: string): ToolStackParts {
  const body = text.startsWith(TOOL_STACK_PREFIX)
    ? text.slice(TOOL_STACK_PREFIX.length)
    : text
  const sentence = body.endsWith(SENTENCE_END) ? body.slice(0, -1) : body
  const [regularTools = '', finalTool = ''] = sentence.split(FINAL_JOINER)
  const tools = regularTools.split('、').filter(Boolean)

  if (finalTool) {
    tools.push(finalTool)
  }

  return {
    tools,
    regularToolCount: finalTool ? tools.length - 1 : tools.length,
  }
}

function PluginIcon() {
  return (
    <svg
      aria-hidden="true"
      className="tool-chip-icon tool-chip-icon-svg"
      data-tool-icon="true"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.6 3.5a2.9 2.9 0 1 1 5.8 0v2.1h2.1a4 4 0 0 1 4 4v2.2h-2.1a2.9 2.9 0 1 0 0 5.8h2.1v2.9H12v-2.1a2.9 2.9 0 1 0-5.8 0v2.1H3.5V12h2.1a2.9 2.9 0 1 0 0-5.8H3.5V3.5h5.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ToolIcon({ tool }: { tool: string }) {
  const logo = logoByTool[tool]

  if (logo) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className="tool-chip-icon"
        data-tool-icon="true"
        src={logo}
      />
    )
  }

  if (tool === 'Lark CLI') {
    return (
      <span
        aria-hidden="true"
        className="tool-chip-icon tool-chip-monogram"
        data-tool-icon="true"
      />
    )
  }

  return <PluginIcon />
}

function sourcePunctuation(value: string, key: string): ReactNode {
  return (
    <span aria-hidden="true" className="source-punctuation" key={key}>
      {value}
    </span>
  )
}

export function ToolStack({ text }: { text: string }) {
  const { tools, regularToolCount } = parseToolStack(text)

  return (
    <p className="resume-paragraph tool-stack-line" data-resume-line="true">
      <strong className="profile-highlight-label">{TOOL_STACK_PREFIX}</strong>
      <span className="tool-stack-list" data-testid="tool-stack" role="list">
        {tools.map((tool, index) => {
          const isLast = index === tools.length - 1
          const separator = isLast
            ? SENTENCE_END
            : index === regularToolCount - 1
              ? FINAL_JOINER
              : '、'

          return (
            <Fragment key={tool}>
              <span className="tool-chip" data-tool-name={tool} role="listitem">
                <ToolIcon tool={tool} />
                <span>{tool}</span>
              </span>
              {sourcePunctuation(separator, `${tool}-separator`)}
            </Fragment>
          )
        })}
      </span>
    </p>
  )
}
