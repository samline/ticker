import { test, expect } from '@playwright/test'
import { readdir, readFile } from 'node:fs/promises'

async function articlePaths(
  directory = new URL('../src/content/docs/', import.meta.url),
  prefix = ''
): Promise<string[]> {
  const paths: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory())
      paths.push(
        ...(await articlePaths(new URL(`${entry.name}/`, directory), `${prefix}${entry.name}/`))
      )
    else if (/\.mdx?$/.test(entry.name))
      paths.push(
        `${prefix}${entry.name.replace(/\.mdx?$/, '')}`
          .replace(/(^|\/)index$/, '$1')
          .replace(/\/$/, '')
      )
  }
  return paths
}

test('every article has unique route metadata, meaningful breadcrumbs and valid structured data', async ({
  page,
}) => {
  const paths = await articlePaths()
  expect(paths).toHaveLength(23)
  const titles = new Set<string>(),
    descriptions = new Set<string>()
  for (const path of paths) {
    await page.goto(path ? `${path}/` : './')
    const canonical = `https://samline.github.io/ticker/docs/${path ? `${path}/` : ''}`
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', canonical)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)
    await expect(page.locator('meta[name=robots]')).toHaveAttribute(
      'content',
      /index, follow, max-image-preview:large/
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://samline.github.io/ticker/social.png'
    )
    const title = await page.title(),
      description = await page.locator('meta[name=description]').getAttribute('content')
    expect(titles.has(title)).toBe(false)
    expect(descriptions.has(description!)).toBe(false)
    titles.add(title)
    descriptions.add(description!)
    await expect(page.locator('main')).toHaveAccessibleName(await page.locator('h1').innerText())
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb', exact: true })
    await expect(breadcrumb.locator('[aria-current=page]')).toHaveCount(1)
    const schema = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!
    )
    const article = schema['@graph'].find(
      (item: { '@type': string }) => item['@type'] === 'TechArticle'
    )
    expect(article.url).toBe(canonical)
    expect(article.headline).toBe(await page.locator('h1').innerText())
    expect(article.author.name).toBeTruthy()
    const trail = schema['@graph'].find(
      (item: { '@type': string }) => item['@type'] === 'BreadcrumbList'
    )
    expect(trail.itemListElement.at(-1).item).toBe(canonical)
  }
})

test('all articles pass automated accessibility checks in both themes', async ({ page }) => {
  test.setTimeout(180000)
  const axe = await readFile(
    new URL('../node_modules/axe-core/axe.min.js', import.meta.url),
    'utf8'
  )
  for (const path of await articlePaths()) {
    await page.goto(path ? `${path}/` : './')
    await page.addScriptTag({ content: axe })
    for (const theme of ['dark', 'light']) {
      await page.evaluate(theme => {
        document.documentElement.dataset.theme = theme
      }, theme)
      // Inspect the settled theme, not the brief color interpolation between themes.
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          document.getAnimations().map(animation => animation.finished.catch(() => {}))
        )
      })
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
        })
        return result.violations.map((item: any) => ({
          id: item.id,
          targets: item.nodes.map((node: any) => node.target),
        }))
      })
      expect(violations, `${path || 'index'} (${theme})`).toEqual([])
    }
  }
})
