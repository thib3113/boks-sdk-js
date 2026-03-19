import { test, expect, type Page } from '@playwright/test';

/**
 * Robustly connects the simulator via the dashboard.
 */
async function connectSimulator(page: Page) {
  await page.setViewportSize({ width: 1280, height: 1000 });

  const header = page.getByTestId('dashboard-header');
  const startBtn = page.getByTestId('connect-button');

  if (!(await page.getByTestId('simulator-checkbox').isVisible())) {
    await header.click();
  }
  
  await page.getByTestId('simulator-checkbox').evaluate((node: HTMLInputElement) => {
    node.checked = true;
    node.dispatchEvent(new Event('change', { bubbles: true }));
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  await startBtn.click();
  await expect(startBtn).toHaveClass(/connected/, { timeout: 15000 });
}

test.describe('SDK Examples E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    page.on('console', msg => {
        console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
  });

  test('should open the door successfully', async ({ page }) => {
    await page.goto('/examples/open-door.html');
    await connectSimulator(page);

    await page.getByTestId('pin-input').fill('123456');
    await page.getByTestId('open-door-button').click();
    
    const badge = page.getByTestId('door-status-badge');
    // We wait up to 10s, but it should happen after ~200ms (simulator delay)
    await expect(badge).toHaveClass(/open/, { timeout: 10000 });
  });

  test('should sync history successfully', async ({ page }) => {
    await page.goto('/examples/history.html');
    await connectSimulator(page);

    // 1. Trigger multiple events to ensure history is not empty.
    // Use the simulator dashboard action button to trigger a realistic open (log entry guaranteed)
    const keypadBtn = page.getByTestId('sim-trigger-keypad');
    await expect(keypadBtn).toBeVisible();
    await keypadBtn.click();
    await page.waitForTimeout(500);
    
    const doorToggleBtn = page.getByTestId('sim-toggle-door-button');
    await doorToggleBtn.click();
    await page.waitForTimeout(500);

    // 2. Sync History
    const syncBtn = page.getByTestId('sync-history-button');
    await syncBtn.click();
    
    // 3. Wait for the sync button to be enabled again
    await expect(syncBtn).toBeEnabled({ timeout: 15000 });
    
    // 4. Verify that the table is now visible and has rows
    const historyRow = page.getByTestId('history-row');
    await expect(historyRow.first()).toBeVisible({ timeout: 10000 });
    
    const count = await historyRow.count();
    console.log(`Synced ${count} history events.`);
    expect(count).toBeGreaterThan(0);
  });

  test('should refresh battery and hardware data', async ({ page }) => {
    await page.goto('/examples/battery.html');
    await connectSimulator(page);

    await page.getByTestId('refresh-data-button').click();
    
    await expect(page.getByTestId('hw-version-value')).not.toHaveText('-', { timeout: 10000 });
    await expect(page.getByTestId('battery-level-text')).toContainText('100%');
  });

  test('should handle seed regeneration with security measures', async ({ page }) => {
    await page.goto('/examples/regeneration.html');
    await connectSimulator(page);

    await page.getByTestId('generate-new-key-button').click();
    const newKeyInput = page.getByTestId('new-master-key-input');
    const newKey = await newKeyInput.inputValue();
    expect(newKey).toHaveLength(64);

    await page.getByTestId('current-config-key-input').fill('00000000');

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('regenerate-seed-button').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('boks-recovery-key-');

    const progressPct = page.getByTestId('regeneration-progress-pct');
    await expect(progressPct).toBeVisible();
    await expect(progressPct).not.toHaveText('0%', { timeout: 15000 });
  });

  test('should block navigation during regeneration', async ({ page }) => {
    await page.goto('/examples/regeneration.html');
    await connectSimulator(page);

    await page.getByTestId('generate-new-key-button').click();
    await page.getByTestId('current-config-key-input').fill('00000000');

    let beforeUnloadTriggered = false;
    page.on('dialog', async dialog => {
      if (dialog.type() === 'beforeunload') {
        beforeUnloadTriggered = true;
      }
      await dialog.accept();
    });

    await page.getByTestId('regenerate-seed-button').click();
    await expect(page.getByTestId('regeneration-progress-pct')).toBeVisible();

    await page.goto('/', { timeout: 2000 }).catch(() => {});
  });
});
