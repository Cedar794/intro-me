import { expect, test } from '@playwright/test'

const defaultViewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of defaultViewports) {
  test(`renders the complete default resume at ${viewport.name} width`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    await expect(page.locator('main[data-resume-root="true"]')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: '张悦' })).toBeVisible()
    await expect(page.getByTestId('photo-panel')).toHaveCount(0)
    await expect(page.locator('a[href^="https://mp.weixin.qq.com/"]')).toHaveCount(6)
    await expect(page.getByTestId('keyword-list').getByRole('listitem')).toHaveCount(8)
    await expect(page.getByTestId('tool-stack').getByRole('listitem')).toHaveCount(13)
    await expect(page.locator('[data-education-tag="true"]')).toBeVisible()
    await expect(page.getByTestId('campus-radar')).toBeVisible()
    await expect(page.locator('[data-campus-dimension]')).toHaveCount(4)

    const dimensions = await page.evaluate(() => ({
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }))
    expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
  })
}

test('places the optional photo to the right of desktop header content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?photoPreview=1')

  await expect(page.getByTestId('photo-panel')).toBeVisible()
  await expect(page.getByTestId('resume-sheet')).toHaveAttribute('data-has-photos', 'true')

  const contentBox = await page.getByTestId('resume-header-content').boundingBox()
  const asideBox = await page.getByTestId('resume-header-aside').boundingBox()
  expect(contentBox).not.toBeNull()
  expect(asideBox).not.toBeNull()
  expect(asideBox!.x).toBeGreaterThanOrEqual(contentBox!.x + contentBox!.width)
})

test('stacks the optional photo below header content on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?photoPreview=1')

  const contentBox = await page.getByTestId('resume-header-content').boundingBox()
  const asideBox = await page.getByTestId('resume-header-aside').boundingBox()
  expect(contentBox).not.toBeNull()
  expect(asideBox).not.toBeNull()
  expect(asideBox!.y).toBeGreaterThanOrEqual(contentBox!.y + contentBox!.height)

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasOverflow).toBe(false)
})

test('gives profile tags the full content width on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const contentBox = await page.getByTestId('resume-header-content').boundingBox()
  const keywordBox = await page.getByTestId('keyword-list').boundingBox()
  const toolBox = await page.getByTestId('tool-stack').boundingBox()

  expect(contentBox).not.toBeNull()
  expect(keywordBox).not.toBeNull()
  expect(toolBox).not.toBeNull()
  expect(keywordBox!.x).toBeLessThanOrEqual(contentBox!.x + 1)
  expect(toolBox!.x).toBeLessThanOrEqual(contentBox!.x + 1)
})

test('reveals the matching campus detail on desktop hover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const radar = page.getByTestId('campus-radar')
  const innovationDimension = page.getByRole('button', {
    name: '创新创业赛事能力',
  })
  const innovationDetail = page.getByTestId('campus-detail-0')

  await expect(innovationDetail).toBeHidden()
  await innovationDimension.hover()
  await expect(radar).toHaveAttribute('data-active-dimension', '0')
  await expect(innovationDetail).toBeVisible()
  await expect(innovationDetail).toContainText('打造"AI+"一站式智慧文旅平台')

  await page.getByRole('heading', { level: 2, name: '实习与工作经历' }).hover()
  await expect(innovationDetail).toBeHidden()
})

test('opens and closes campus detail by tap on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const organizationDetail = page.getByTestId('campus-detail-1')
  await page.getByRole('button', { name: '校企活动组织力' }).click()

  await expect(organizationDetail).toBeVisible()
  await expect(organizationDetail).toContainText('上海七校')
  await page.getByRole('button', { name: '关闭校园经历详情' }).click()
  await expect(organizationDetail).toBeHidden()

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasOverflow).toBe(false)
})

test('removes screen framing while preserving resume content for print', async ({ page }) => {
  await page.emulateMedia({ media: 'print' })
  await page.goto('/')

  const printStyles = await page.getByTestId('resume-sheet').evaluate((sheet) => {
    const styles = window.getComputedStyle(sheet)
    return {
      borderTopWidth: styles.borderTopWidth,
      boxShadow: styles.boxShadow,
      text: sheet.textContent,
    }
  })

  expect(printStyles.borderTopWidth).toBe('0px')
  expect(printStyles.boxShadow).toBe('none')
  expect(printStyles.text).toContain('【增长突破】')

  const campusDetails = page.locator('[data-campus-detail]')
  await expect(campusDetails).toHaveCount(4)
  for (const detail of await campusDetails.all()) {
    await expect(detail).toBeVisible()
  }
})
