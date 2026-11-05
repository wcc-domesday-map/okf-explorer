# Warwickshire same-origin Explorer profile

Status: Explorer demonstration profile, served and deployed only by the
restricted parent repository.

Candidate version: `0.8.1-warwickshire.1`, merging upstream OKF Explorer
`0.8.1` at commit `dcd0c43e29593436b13c59271c75d37d06e2b754`.

## Assembly contract

The parent repository owns the release surface and assembles two sibling
routes on one origin:

- `/knowledge/` — the static Explorer application from
  `apps/okf-explorer/build/`, with the Reader at `/knowledge/explore/`;
- `/okf/warwickshire-public/` — the reviewed public OKF bundle and its
  bundle-relative resources.

Explorer's default `/okf/warwickshire-public/explorer/okf-explorer.json`
reference is resolved on the same origin from `/knowledge/explore/`. The compact
`okf-bundle.json` remains a separately generated compatibility projection.
The Svelte build directory is not a complete standalone
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
- Cross-origin source-JSON inspection and geospatial previews are refused.
  External official CLML is offered as a navigational link; remote full-text
  search cannot connect under the same-origin CSP.
- Bundle fetches reject redirects; a same-origin redirect cannot be used to
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

Small-bundle Reader data detail exposes supplied FOI-oriented fields directly:
source and upstream record identifiers, retrieval/publication times,
attribution, rights and reuse basis, confidence, method, facts, cautions and the
source body. Absent optional values are omitted from the selected metadata
list and remain inspectable as absent in the node JSON. Relationship
evidence, method, predicate and confidence are also visible, and safe source
links are retained for human verification.

## Validation

From `apps/okf-explorer/` run:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
pnpm test:e2e:warwickshire:terminal
```

Post-deployment browser tests require an explicitly reviewed URL; no public
upstream URL is embedded in the package script:

```sh
PLAYWRIGHT_BASE_URL=https://reviewed-restricted-site.example/knowledge/ pnpm test:e2e:pages
```

The inherited upstream browser suites use cross-origin fixture bundles and
cannot exercise this same-origin profile as written. The fork CI runs the
Warwickshire security journey in Chrome, Firefox and WebKit on full browser
changes, alongside app, contract, Foundry and Site checks. This leaves a
browser-level regression coverage gap for upstream features. Adapt those
fixtures to same-origin paths before treating the full upstream browser suite
as fork assurance. The source upstream CI remains useful evidence for the
upstream commit, not for the merged Warwickshire runtime.

Also inspect the generated `build/index.html` CSP, verify that no standalone
Pages deployment action remains active, and test the assembled parent routes
with the public bundle present. Promotion into the organisation should pin the
reviewed Explorer commit in the parent repository, use a feature branch and
pull request, and complete the full-diff self-review and required CI before
merge. An independent human review is encouraged where available.

## Upstream relationship

The upstream project remains the source of generic Explorer features and is
credited in the root README and `CITATION.cff`. Warwickshire divergence is
limited to the WCC build/deployment profile, security boundary, public-bundle
defaults and provenance presentation. Upstream changes should be reviewed and
merged deliberately; do not silently replace this profile's
same-origin or parent-assembly safeguards.
