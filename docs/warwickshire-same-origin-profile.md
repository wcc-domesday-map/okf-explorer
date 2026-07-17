# Warwickshire same-origin Explorer profile

Status: Explorer demonstration profile, served and deployed only by the
restricted parent repository.

Version: `0.4.3-warwickshire.1`, derived from upstream OKF Explorer `0.4.2`
at commit `c4ecb7e1`.

## Assembly contract

The parent repository owns the release surface and assembles two sibling
routes on one origin:

- `/knowledge/` — the static Explorer application from
  `apps/okf-explorer/build/`;
- `/okf/warwickshire-public/` — the reviewed public OKF bundle and its
  bundle-relative resources.

Explorer's default `../okf/warwickshire-public/okf-bundle.json` reference is
defined by that layout. The Svelte build directory is not a complete standalone
site. A local or independent review host must reproduce both sibling routes and
serve them over HTTP(S); `file://` is unsupported.

The inherited public Pages deployment is intentionally fail-closed. The parent
repository must verify its repository and Pages visibility, refuse unmerged
refs, copy only the reviewed public bundle, and apply the organisation's review
and approval controls before deployment.

## Network and content boundary

- Bundles, registries, moved-bundle redirects, descriptor resources and
  on-demand data resources are restricted to same-origin HTTP(S) URLs.
- Relative provenance, evidence and resource links resolve against the loaded
  bundle URL. This keeps `services/item.md` beside the bundle rather than
  incorrectly resolving it under `/knowledge/`.
- Explicit safe HTTP(S) links to authoritative external sources remain visible
  and navigable. They do not grant Explorer permission to fetch those sites.
- Cross-origin source-JSON inspection, geospatial previews, official CLML
  loading and remote full-text search are disabled or relabelled in the UI.
- Fetches use `redirect: 'error'`; a same-origin redirect cannot be used to
  bypass the network boundary.
- The production content security policy restricts scripts and connections to
  the serving origin and does not enable unsafe script execution.
- JSON file upload remains available. Uploaded content stays in the browser;
  its relative links are shown as text because there is no trustworthy network
  base URL.

Public and internal Explorer deployments are distinct security surfaces. The
public bundle must never contain internal records, credentials, internal
GeoServer URLs or hidden browser data that is merely suppressed by CSS or
JavaScript. An internal build must use a separately assembled internal bundle
and access policy.

## Provenance presentation

Small-bundle record detail exposes the reviewed FOI-oriented fields directly:
source and upstream record identifiers, retrieval/publication times,
attribution, rights and reuse basis, confidence, method, facts, cautions and the
source body. Missing values remain visible as metadata gaps. Relationship
evidence, method, predicate and confidence are also visible, and safe source
links are retained for human verification.

## Validation

From `apps/okf-explorer/` run:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
pnpm test:e2e
```

Post-deployment browser tests require an explicitly reviewed URL; no public
upstream URL is embedded in the package script:

```sh
PLAYWRIGHT_BASE_URL=https://reviewed-restricted-site.example/knowledge/ pnpm test:e2e:pages
```

Also inspect the generated `build/index.html` CSP, verify that no standalone
Pages deployment action remains active, and test the assembled parent routes
with the public bundle present. Promotion into the organisation should pin the
reviewed Explorer commit in the parent repository, use a feature branch and
pull request, and require one independent human approval before merge.

## Upstream relationship

The upstream project remains the source of generic Explorer features and is
credited in the root README and `CITATION.cff`. Warwickshire divergence is
limited to the WCC build/deployment profile, security boundary, public-bundle
defaults and provenance presentation. Upstream changes should be reviewed and
cherry-picked or rebased deliberately; do not silently replace this profile's
same-origin or parent-assembly safeguards.
