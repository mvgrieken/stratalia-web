import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display home page with features', async ({ page }) => {
    await page.goto('/')
    
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: 'Straatpraat' })).toBeVisible()
    
    // Check if all feature cards are present
    await expect(page.getByText('Vertalen')).toBeVisible()
    await expect(page.getByText('Woord van de Dag')).toBeVisible()
    await expect(page.getByText('Quiz')).toBeVisible()
    await expect(page.getByText('Kennisbank')).toBeVisible()
    await expect(page.getByText('Community')).toBeVisible()
    await expect(page.getByText('Download App')).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle('Straatpraat - Leer Straattaal')
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', 'Leer straattaal met onze interactieve app. Vertaal woorden, doe quizzen en draag bij aan de community.')
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check if content is still visible and properly laid out
    await expect(page.getByRole('heading', { name: 'Straatpraat' })).toBeVisible()
    
    // Check if the grid adapts to mobile
    const featureCards = page.locator('[class*="grid"] > div')
    await expect(featureCards.first()).toBeVisible()
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check if buttons are accessible
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
    
    // Check if buttons have proper text content
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      expect(text).toBeTruthy()
      expect(text!.trim().length).toBeGreaterThan(0)
    }
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Check for JavaScript errors
    expect(errors).toHaveLength(0)
  })
})
