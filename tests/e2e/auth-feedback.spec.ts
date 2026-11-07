import { expect, test } from '@playwright/test'

test('signup shows submission feedback within 100 ms', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest('#btn-signup-submit')
      if (!button) return

      const startedAt = performance.now()
      const observer = new MutationObserver(() => {
        if (button.textContent?.includes('Creating workspace')) {
          const metrics = window as Window & { __signupFeedbackMs?: number }
          metrics.__signupFeedbackMs = performance.now() - startedAt
          observer.disconnect()
        }
      })
      observer.observe(button, { childList: true, subtree: true, characterData: true })
    }, true)
  })

  let releaseRegistration!: () => void
  const registrationGate = new Promise<void>((resolve) => {
    releaseRegistration = resolve
  })
  await page.route('**/api/auth/register', async (route) => {
    await registrationGate
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'test-user', name: 'Test User', email: 'test@example.com' },
        workspace: { id: 'test-workspace', name: 'Test Workspace' },
        accessToken: 'ci-access-token',
        refreshToken: 'ci-refresh-token',
      }),
    })
  })
  await page.route('**/api/dashboard/summary', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '{}',
  }))

  await page.goto('/signup')
  await page.locator('#fullName').fill('Test User')
  await page.locator('#email').fill('test@example.com')
  await page.locator('#password').fill('test-password-123')
  await page.locator('#confirmPassword').fill('test-password-123')
  await page.locator('#signup-terms').check()

  const submit = page.locator('#btn-signup-submit')
  await submit.click()
  await expect(submit).toContainText('Creating workspace')
  await expect(submit).toBeDisabled()

  const feedbackMs = await page.evaluate(
    () => (window as Window & { __signupFeedbackMs?: number }).__signupFeedbackMs,
  )
  if (feedbackMs === undefined) throw new Error('Signup feedback timing was not recorded')
  expect(feedbackMs).toBeLessThan(100)
  console.log(`Signup click-to-feedback: ${feedbackMs.toFixed(1)} ms`)

  releaseRegistration()
  await expect(page).toHaveURL(/\/dashboard$/)
})
