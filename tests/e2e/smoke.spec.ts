import { test, expect } from '@playwright/test'
test('SyncSpace shell is available', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/SyncSpace/i)
})
