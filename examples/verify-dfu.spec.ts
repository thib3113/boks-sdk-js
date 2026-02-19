import { test, expect } from '@playwright/test';
import path from 'path';

test('DFU Update Page Structure', async ({ page }) => {
  const filePath = path.resolve(__dirname, 'dfu_update.html');
  await page.goto(`file://${filePath}`);

  // Check title
  await expect(page).toHaveTitle('Boks Firmware Update');

  // Check key elements
  await expect(page.locator('#firmwareFile')).toBeVisible();
  await expect(page.locator('#scanBtn')).toBeVisible();
  await expect(page.locator('#log')).toBeVisible();

  // Check initial state
  await expect(page.locator('#deviceInfo')).toBeHidden();
  await expect(page.locator('#flashBtn')).toBeDisabled();
});
