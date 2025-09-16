import { test, expect } from '@playwright/test';

test('homepage laadt en toont titel', async ({ page }) => {
  // Zet hier je lokale URL of de online URL van Stratalia
  await page.goto('http://localhost:3000');

  // Check dat een stukje tekst zichtbaar is (pas aan aan jouw site)
  await expect(page.getByText('Welkom bij Stratalia')).toBeVisible();
});
