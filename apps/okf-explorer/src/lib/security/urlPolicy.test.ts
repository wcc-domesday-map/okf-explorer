import { describe, expect, it } from 'vitest';
import {
  publicHttpHref,
  publicHttpHrefForBundle,
  requireSameOriginHttpUrl,
  sameOriginHttpUrl,
  sameOriginResourceUrl
} from './urlPolicy';

const EXPLORER = 'https://maps.warwickshire.gov.uk/knowledge/';

describe('Warwickshire Explorer URL policy', () => {
  it('loads the default bundle and other descriptors only from the Explorer origin', () => {
    expect(sameOriginHttpUrl('../okf/warwickshire-public/okf-bundle.json', EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/warwickshire-public/okf-bundle.json'
    );
    expect(sameOriginHttpUrl('/okf/warwickshire-public/descriptor.json', EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/warwickshire-public/descriptor.json'
    );
    expect(sameOriginHttpUrl('https://maps.warwickshire.gov.uk/okf/bundle.json', EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/bundle.json'
    );
  });

  it.each([
    'javascript:alert(1)',
    'data:application/json,%7B%7D',
    'https://attacker.example/bundle.json',
    'http://attacker.example/bundle.json',
    '//attacker.example/bundle.json',
    'https://user:password@maps.warwickshire.gov.uk/bundle.json'
  ])('rejects an untrusted network bundle or descriptor URL: %s', (value) => {
    expect(sameOriginHttpUrl(value, EXPLORER)).toBeNull();
    expect(() => requireSameOriginHttpUrl(value, EXPLORER)).toThrow('on this Explorer origin');
  });

  it('allows only http(s) absolute links or approved same-origin relatives in bundle-controlled anchors', () => {
    expect(publicHttpHref('https://www.legislation.gov.uk/ukpga/2026/1', EXPLORER)).toBe(
      'https://www.legislation.gov.uk/ukpga/2026/1'
    );
    expect(publicHttpHref('../okf/warwickshire-public/graph.yamlld', EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/warwickshire-public/graph.yamlld'
    );
    expect(publicHttpHref('javascript:alert(1)', EXPLORER)).toBeNull();
    expect(publicHttpHref('data:text/html,unsafe', EXPLORER)).toBeNull();
    expect(publicHttpHref('//attacker.example/phish', EXPLORER)).toBeNull();
  });

  it('resolves provenance links against the loaded bundle rather than the Explorer route', () => {
    const bundle = 'https://maps.warwickshire.gov.uk/okf/warwickshire-public/okf-bundle.json';
    expect(publicHttpHrefForBundle('services/school-admissions.md', bundle, EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/warwickshire-public/services/school-admissions.md'
    );
    expect(publicHttpHrefForBundle('../rights/ogl.html', bundle, EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/rights/ogl.html'
    );
    expect(publicHttpHrefForBundle('https://www.warwickshire.gov.uk/schools', bundle, EXPLORER)).toBe(
      'https://www.warwickshire.gov.uk/schools'
    );
    expect(publicHttpHrefForBundle('//attacker.example/phish', bundle, EXPLORER)).toBeNull();
  });

  it('keeps on-demand resource requests on the Explorer origin', () => {
    const bundle = 'https://maps.warwickshire.gov.uk/okf/warwickshire-public/okf-bundle.json';
    expect(sameOriginResourceUrl('resources/schools.geojson', bundle, EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/okf/warwickshire-public/resources/schools.geojson'
    );
    expect(sameOriginResourceUrl('https://maps.warwickshire.gov.uk/data/schools.json', bundle, EXPLORER)).toBe(
      'https://maps.warwickshire.gov.uk/data/schools.json'
    );
    expect(sameOriginResourceUrl('https://attacker.example/redirect-target.json', bundle, EXPLORER)).toBeNull();
  });
});
