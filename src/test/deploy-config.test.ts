// @vitest-environment node
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('GitHub Pages workflow tests, builds, and deploys the static artifact', () => {
  const workflow = readFileSync(
    resolve(process.cwd(), '.github/workflows/deploy-pages.yml'),
    'utf8',
  )

  for (const requiredText of [
    'actions/checkout',
    'actions/setup-node',
    'node-version: 22',
    'npm ci',
    'npm test',
    'npm run build',
    'actions/configure-pages',
    'actions/upload-pages-artifact',
    'actions/deploy-pages',
    'path: ./dist',
  ]) {
    expect(workflow).toContain(requiredText)
  }
})
