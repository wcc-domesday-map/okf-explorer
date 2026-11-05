#!/usr/bin/env node
import { chromium } from '@playwright/test';

const supplied = process.env.PLAYWRIGHT_BASE_URL;
if (!supplied) throw new Error('Set PLAYWRIGHT_BASE_URL to the reviewed /knowledge/ assembly.');
const base = new URL(supplied);
if (!['https:', 'http:'].includes(base.protocol) || !base.pathname.endsWith('/knowledge/')) {
  throw new Error('PLAYWRIGHT_BASE_URL must be an HTTP(S) /knowledge/ assembly URL.');
}
if (base.protocol === 'http:' && !['127.0.0.1', 'localhost'].includes(base.hostname)) {
  throw new Error('Remote assemblies must use HTTPS.');
}

const descriptor = new URL('/okf/warwickshire-public/explorer/okf-explorer.json', base);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  const requested = new Set();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('request', (request) => requested.add(request.url()));

  const landing = await page.goto(base.href, { waitUntil: 'networkidle' });
  if (!landing?.ok() || !await page.getByRole('heading', { name: 'Use knowledge you can inspect with your AI' }).isVisible()) {
    throw new Error('The /knowledge/ landing route did not load.');
  }
  const reader = await page.goto(new URL('explore/', base).href, { waitUntil: 'networkidle' });
  await page.getByText('Warwickshire Public Knowledge', { exact: true }).first().waitFor();
  if (!reader?.ok()) throw new Error('The /knowledge/explore/ Reader route did not load.');
  if (!requested.has(descriptor.href)) throw new Error(`The default descriptor was not requested: ${descriptor.href}`);
  const crossOrigin = [...requested].filter((url) => new URL(url).origin !== base.origin);
  if (crossOrigin.length) errors.push(`Unexpected cross-origin browser requests: ${crossOrigin.join(', ')}`);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Verified ${base.href} and ${new URL('explore/', base).href} with the same-origin Warwickshire descriptor.`);
} finally {
  await browser.close();
}
