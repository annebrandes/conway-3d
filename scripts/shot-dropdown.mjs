// Dev helper: screenshot the app with the lattice dropdown open
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001');
await page.waitForTimeout(6000);
await page.getByRole('button', { name: /cells/i }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/conway-dropdown-open.png' });
await browser.close();
