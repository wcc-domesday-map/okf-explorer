import { describe, expect, it } from 'vitest';
import mapViewSource from '../geospatial/MapView.svelte?raw';
import legislationDetailSource from '../legislation/LegislationDetail.svelte?raw';
import legislationSearchSource from '../legislation/search.ts?raw';
import sourceFetchSource from '../sources/fetch.ts?raw';
import pagesWorkflow from '../../../../../.github/workflows/pages.yml?raw';

describe('Warwickshire same-origin UI profile', () => {
  it('keeps external map sources navigable but disables their on-demand previews', () => {
    expect(mapViewSource).toContain('sameOriginResourceUrl(value, bundleUrl, location.href)');
    expect(mapViewSource).toContain('External preview disabled');
    expect(mapViewSource).toContain('Open source ↗');
  });

  it('keeps official legislation links while disabling external live-text fetches', () => {
    expect(legislationDetailSource).toContain('External live text disabled');
    expect(legislationDetailSource).toContain('Open the official CLML source ↗');
    expect(legislationDetailSource).toContain("redirect: 'error'");
  });

  it('refuses fetch redirects for source JSON and official search', () => {
    expect(sourceFetchSource).toContain("redirect: 'error'");
    expect(legislationSearchSource).toContain("redirect: 'error'");
  });

  it('keeps the inherited standalone Pages workflow manual and fail-closed', () => {
    expect(pagesWorkflow).toContain('workflow_dispatch:');
    expect(pagesWorkflow).toContain('standalone-pages-disabled:');
    expect(pagesWorkflow).toContain('exit 1');
    expect(pagesWorkflow).not.toContain('push:');
    expect(pagesWorkflow).not.toContain('deploy-pages');
    expect(pagesWorkflow).not.toContain('pages: write');
    expect(pagesWorkflow).not.toContain('id-token: write');
  });
});
