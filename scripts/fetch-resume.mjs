import { spawnSync } from 'node:child_process'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  collectLinks,
  flattenResume,
  transformResumeXml,
} from './transform-lark-xml.mjs'

const documentToken = 'COijd5MBUo2bbbxAeavchDDWnGp'
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const dataDirectory = path.join(projectRoot, 'src', 'data')

function fetchDocument() {
  const result = spawnSync(
    'lark-cli',
    [
      'docs',
      '+fetch',
      '--doc',
      documentToken,
      '--detail',
      'simple',
      '--doc-format',
      'xml',
      '--as',
      'user',
      '--format',
      'json',
    ],
    {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    },
  )

  if (result.status !== 0) {
    throw new Error(
      `lark-cli failed with status ${result.status ?? 'unknown'}: ${result.stderr.trim()}`,
    )
  }

  let payload
  try {
    payload = JSON.parse(result.stdout)
  } catch (error) {
    throw new Error(`lark-cli returned invalid JSON: ${error.message}`)
  }

  if (payload.ok !== true) {
    throw new Error('lark-cli did not report a successful fetch')
  }

  const document = payload.data?.document
  if (!document || document.document_id !== documentToken) {
    throw new Error(
      `Fetched document token ${document?.document_id ?? 'missing'} does not match ${documentToken}`,
    )
  }

  if (typeof document.content !== 'string' || document.content.length === 0) {
    throw new Error('Fetched resume content is empty')
  }

  if (!Number.isInteger(document.revision_id)) {
    throw new Error('Fetched resume revision is not a number')
  }

  return document
}

async function writeAtomic(filename, content) {
  const destination = path.join(dataDirectory, filename)
  const temporary = `${destination}.tmp-${process.pid}`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, destination)
}

async function main() {
  const source = fetchDocument()
  const resume = transformResumeXml(source.content)
  const flattened = flattenResume(resume)
  const links = collectLinks(resume)

  await mkdir(dataDirectory, { recursive: true })
  await Promise.all([
    writeAtomic('resume-source.xml', source.content),
    writeAtomic(
      'resume.generated.ts',
      `import type { ResumeDocumentData } from './resumeTypes'\n\nexport const resume: ResumeDocumentData = ${JSON.stringify(resume, null, 2)}\n`,
    ),
    writeAtomic('resume-text.txt', `${flattened}\n`),
    writeAtomic('resume-links.json', `${JSON.stringify(links, null, 2)}\n`),
    writeAtomic(
      'sourceMetadata.ts',
      `export const sourceMetadata = {\n  documentToken: '${documentToken}',\n  revisionId: ${source.revision_id},\n} as const\n`,
    ),
  ])

  console.log(
    `Captured Feishu revision ${source.revision_id}: ${resume.blocks.length} blocks, ${flattened.length} characters, ${links.length} links.`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
