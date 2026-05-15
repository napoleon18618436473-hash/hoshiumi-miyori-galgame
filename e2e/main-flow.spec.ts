import { expect, test } from '@playwright/test'

async function advanceDialogue(page: import('@playwright/test').Page) {
  const dialogue = page.getByTestId('dialogue-card')
  for (let index = 0; index < 8; index += 1) {
    if (!(await dialogue.isVisible())) {
      return
    }
    await dialogue.click()
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('plays first chapter into Mio route with video trigger', async ({ page }) => {
  await expect(page.getByText('星海未寄')).toBeVisible()
  await page.getByTestId('start-game').click()

  await expect(page.getByTestId('dialogue-card')).toContainText('鞋柜里躺着')
  await expect(page.getByTestId('vn-sprite-haruka')).toBeVisible()
  await advanceDialogue(page)
  await expect(page.getByTestId('video-event')).toBeVisible()
  await expect(page.getByTestId('video-event-player')).toHaveAttribute(
    'src',
    '/assets/video/letter-first-rain.mp4',
  )
  await page.getByTestId('close-video-event').click()
  await page.getByTestId('choice-ask-haruka').click()

  await expect(page.getByText('二年 B 班')).toBeVisible()
  await expect(page.getByTestId('vn-sprite-mio')).toBeVisible()
  await advanceDialogue(page)
  await page.getByTestId('choice-sit-near-mio').click()

  await expect(page.getByText('放学后的音乐教室')).toBeVisible()
  await advanceDialogue(page)
  await expect(page.getByTestId('video-event')).toBeVisible()
  await expect(page.getByTestId('video-event-player')).toHaveAttribute(
    'src',
    '/assets/video/mio-first-song.mp4',
  )
  await page.getByTestId('close-video-event').click()
  await page.getByTestId('choice-listen-mio-song').click()

  await expect(page.getByText('夜晚的空教室')).toBeVisible()
  await advanceDialogue(page)
  await expect(page.getByTestId('video-event-player')).toHaveAttribute(
    'src',
    '/assets/video/seventh-letter-classroom.mp4',
  )
  await page.getByTestId('close-video-event').click()
  await page.getByTestId('choice-route-mio').click()

  await expect(page.getByText('第一章：雨后的空教室 完')).toBeVisible()
  await expect(page.getByText('第二章开局路线：澪')).toBeVisible()
})

test('keeps the galgame UI usable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByTestId('start-game').click()
  await expect(page.getByTestId('dialogue-card')).toBeVisible()
  await expect(page.getByTestId('status-message')).toBeVisible()
  await advanceDialogue(page)
  await expect(page.getByTestId('choice-panel')).toBeVisible()
})
