import { expect, test, type Page, type Route } from '@playwright/test';

const APP_ORIGIN = 'http://127.0.0.1:4173';
const DEFAULT_BUNDLE_PATH = '/okf/warwickshire-public/okf-bundle.json';

const safeBundle = {
  meta: {
    title: 'Warwickshire Public Knowledge',
    description: 'Same-origin public knowledge fixture'
  },
  nodes: {
    service: {
      id: 'service',
      type: 'Service',
      title: 'School admissions',
      description: 'Council service',
      source: 'services/school-admissions.md',
      resource: 'resources/school-admissions.html',
      source_url: 'https://www.warwickshire.gov.uk/school-admissions',
      source_id: 'SOURCE-WCC-WEB-2026-07-16',
      source_record_id: 'wcc:/school-admissions',
      retrieved_at: '2026-07-16T14:15:00Z',
      published_at: '2026-07-01',
      attribution: 'Warwickshire County Council',
      rights_url: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
      reuse_basis: 'Open Government Licence v3.0',
      confidence: 'high',
      method: 'source-record-normalization',
      facts: [{ label: 'Service area', value: 'Education' }],
      notes: ['Check the current admissions timetable before relying on this record.'],
      body: '# School admissions\n\nReviewed public source.'
    },
    dataset: { id: 'dataset', type: 'Dataset', title: 'School locations', description: 'Open-data record' },
    unsafe: {
      id: 'unsafe',
      type: 'Test record',
      title: 'Unsafe link fixture',
      resource: 'javascript:alert(1)',
      source_url: 'data:text/html,unsafe',
      rights_url: '//attacker.example/rights'
    }
  },
  relationships: [{
    id: 'relationship-1',
    source: 'service',
    target: 'dataset',
    kind: 'uses',
    predicate: 'dcterms:references',
    method: 'curated-crosslink',
    confidence: 'high',
    evidence: 'services/school-admissions.md'
  }]
};

async function json(route: Route, body: unknown) {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
}

async function openDefaultBundle(page: Page) {
  let bundleRequests = 0;
  await page.route(`${APP_ORIGIN}${DEFAULT_BUNDLE_PATH}`, async (route) => {
    bundleRequests += 1;
    await json(route, safeBundle);
  });
  const response = await page.goto('/explore/?bundle=../okf/warwickshire-public/okf-bundle.json');
  await expect(page.getByText('Warwickshire Public Knowledge', { exact: true }).first()).toBeVisible();
  expect(bundleRequests).toBe(1);
  return response;
}

test('loads the Warwickshire same-origin default and preserves the core small-bundle views', async ({ page }) => {
  await openDefaultBundle(page);

  const views = page.getByRole('navigation', { name: 'Views' });
  await expect(page.getByRole('heading', { name: 'School admissions' }).first()).toBeVisible();

  await views.getByRole('button', { name: 'Graph', exact: true }).click();
  await expect(page.getByRole('button', { name: /School admissions → uses → School locations/ }).first()).toHaveCount(1);

  await views.getByRole('button', { name: 'Links', exact: true }).click();
  await expect(page.getByRole('button', { name: /School admissions.*uses.*School locations/ })).toBeVisible();

  await views.getByRole('button', { name: 'Type', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Service', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dataset', exact: true })).toBeVisible();

  await views.getByRole('button', { name: 'Reader', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'School locations' })).toBeVisible();
});

test('rejects cross-origin, javascript and data bundle query values before any attacker fetch', async ({ page }) => {
  let attackerRequests = 0;
  await page.route('https://attacker.example/**', async (route) => {
    attackerRequests += 1;
    await json(route, safeBundle);
  });

  for (const value of [
    'https://attacker.example/bundle.json',
    'javascript:alert(1)',
    'data:application/json,%7B%7D'
  ]) {
    await page.goto(`/explore/?bundle=${encodeURIComponent(value)}`);
    await expect(page.getByRole('alert')).toContainText(/same-origin paths|on this Explorer origin/);
  }
  expect(attackerRequests).toBe(0);
});

test('renders FOI provenance and resolves bundle-relative evidence against the bundle URL', async ({ page }) => {
  await openDefaultBundle(page);
  await expect(page.getByText('Reviewed public source.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Data', exact: true }).click();

  for (const value of [
    'Source URL',
    'Source ID',
    'Source record ID',
    'Retrieved at',
    'Published at',
    'Attribution',
    'Rights URL',
    'Reuse basis',
    'Confidence',
    'Method',
    'Facts',
    'Notes'
  ]) {
    await expect(page.getByText(value, { exact: true }).last()).toBeVisible();
  }
  await expect(page.getByText('SOURCE-WCC-WEB-2026-07-16', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('wcc:/school-admissions', { exact: true })).toBeVisible();
  await expect(page.getByText('2026-07-16T14:15:00Z', { exact: true }).last()).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Education' })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Check the current admissions timetable before relying on this record.' })).toBeVisible();
  await page.getByRole('tab', { name: 'Evidence', exact: true }).click();

  const relativeResource = page.getByRole('link', { name: 'Resource ↗' });
  await expect(relativeResource).toHaveAttribute('href', `${APP_ORIGIN}/okf/warwickshire-public/resources/school-admissions.html`);
  const relativeSource = page.getByRole('link', { name: 'Source ↗', exact: true });
  await expect(relativeSource).toHaveAttribute('href', `${APP_ORIGIN}/okf/warwickshire-public/services/school-admissions.md`);
  await expect(page.getByRole('link', { name: 'Source URL ↗' })).toHaveAttribute(
    'href',
    'https://www.warwickshire.gov.uk/school-admissions'
  );

  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Links', exact: true }).click();
  await page.getByRole('button', { name: /School admissions.*uses.*School locations/ }).click();
  await expect(page.getByText('dcterms:references', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /services\/school-admissions\.md/ })).toHaveAttribute(
    'href',
    `${APP_ORIGIN}/okf/warwickshire-public/services/school-admissions.md`
  );

  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Reader', exact: true }).click();
  await page.getByRole('button', { name: /Test record Unsafe link fixture/ }).click();
  await page.getByRole('tab', { name: 'Data', exact: true }).click();
  await page.getByText('Node JSON and provenance').click();
  await expect(page.getByText(/javascript:alert\(1\)/).last()).toBeVisible();
  await expect(page.getByText(/data:text\/html,unsafe/).last()).toBeVisible();
  await expect(page.getByText(/\/\/attacker\.example\/rights/).last()).toBeVisible();
  await expect(page.locator('a[href^="javascript:"], a[href^="data:"], a[href^="//attacker.example"]')).toHaveCount(0);
});

test('keeps safe external map links but disables external on-demand previews', async ({ page }) => {
  let attackerRequests = 0;
  await page.route('https://attacker.example/**', async (route) => {
    attackerRequests += 1;
    await json(route, { type: 'FeatureCollection', features: [] });
  });
  await page.route(`${APP_ORIGIN}${DEFAULT_BUNDLE_PATH}`, async (route) => {
    await json(route, {
      meta: { title: 'External preview policy' },
      nodes: {
        map: {
          id: 'map',
          title: 'External school locations',
          type: 'Dataset',
          area_served: 'Warwickshire',
          resources: [{ title: 'School locations GeoJSON', format: 'GeoJSON', url: 'https://attacker.example/schools.geojson' }]
        }
      },
      relationships: []
    });
  });

  await page.goto('/explore/?bundle=../okf/warwickshire-public/okf-bundle.json&view=map');
  await expect(page.getByRole('heading', { name: 'Map & geography' })).toBeVisible();
  const disabled = page.getByRole('button', { name: 'External preview disabled' });
  await expect(disabled).toBeVisible();
  await expect(disabled).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Open source ↗' })).toHaveAttribute('href', 'https://attacker.example/schools.geojson');
  expect(attackerRequests).toBe(0);
});

test('ships a CSP limited to same-origin connections and scripts without unsafe execution', async ({ page }) => {
  const response = await openDefaultBundle(page);
  const headerPolicy = response?.headers()['content-security-policy'] || '';
  const meta = page.locator('meta[http-equiv="Content-Security-Policy"]');
  const metaPolicy = (await meta.count()) ? (await meta.getAttribute('content')) || '' : '';
  const policy = headerPolicy || metaPolicy || '';
  expect(policy).toContain("connect-src 'self'");
  expect(policy).toContain("script-src 'self'");
  expect(policy).not.toContain("'unsafe-eval'");
  expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);
});
