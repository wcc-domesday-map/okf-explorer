# OKF Explorer — Warwickshire same-origin profile

This is the Warwickshire County Council organisation fork/build profile of
[the upstream OKF Explorer](https://github.com/chris-page-gov/okf-explorer).
Profile version `0.4.3-warwickshire.1` derives from upstream `0.4.2` at commit
`c4ecb7e1`. Warwickshire-specific security, provenance and deployment choices
are intentionally documented as a divergence rather than attributed upstream.

The application is a **served-only fragment assembled by the private parent
repository**. That parent publishes the Explorer at `/knowledge/` and a
separately reviewed public bundle at
`/okf/warwickshire-public/okf-bundle.json`. The default application-relative
bundle path is therefore `../okf/warwickshire-public/okf-bundle.json`.

Warwickshire's network boundary is deliberately narrow:

- network bundles, descriptors, redirects and on-demand data resources must
  resolve on the Explorer's own origin;
- safe explicit HTTP(S) provenance and official-source links remain ordinary
  user-navigable links, but Explorer does not fetch external targets;
- local JSON file upload remains available and stays in the browser;
- the build must be served over HTTP(S); opening `build/index.html` with
  `file://` is unsupported because browser fetch and CSP rules require an
  origin; and
- the public and internal applications/bundles are separate deployment
  surfaces. No internal record may be shipped in a public browser bundle.

See [the Warwickshire profile contract](docs/warwickshire-same-origin-profile.md)
for the route layout, security boundary, validation and promotion process.
The inherited standalone Pages workflow is fail-closed; only the restricted
parent repository may assemble and deploy this profile.

## Build For Parent Assembly Or A Matching Standalone Host

```sh
cd apps/okf-explorer
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm test:e2e
pnpm build
```

`apps/okf-explorer/build/` contains only the Explorer application. A review
server or standalone host must reproduce the parent layout: serve that build
at `/knowledge/` and place the reviewed bundle at sibling URL
`/okf/warwickshire-public/okf-bundle.json`. Equivalently, when reviewing the
build directory as a unit, the default `../okf/warwickshire-public/` reference
must resolve to the sibling public bundle. The parent repository's existing
Pages assembly—Explorer under `/knowledge/`, bundle under `/okf/`—is the
authoritative and supported deployment.

## Upstream Hosted Examples (Reference Only)

The upstream generic Explorer can load public cross-origin HTTPS bundles. That
capability and the hosted examples below are **not enabled in this Warwickshire
same-origin profile**; they remain here solely as upstream product reference:

| Example | What it demonstrates | Open |
|---|---|---|
| UK Legislation OKF | Complete legislation.gov.uk work catalogue with ELI/Schema.org normalization and live CLML provision discovery | [Open Explorer][legislation-example] · [Documentation spine][legislation-docs] |
| UK Government APIs OKF | Multi-source API/data catalogue with standards and provenance metadata | [Open Explorer][uk-government-apis-example] |
| GOV.UK CKAN | Large external CKAN corpus loaded by the same hosted Explorer | [Open Explorer][ckan-example] |

Each example now has explicit persona, user-story and question traceability:

| Example | Personas and stories | Evaluation questions |
|---|---|---|
| UK Legislation OKF | [Six legislation personas and critical journeys][legislation-personas] · [`journeys.json`](evaluation/legislation/journeys.json) | [`questions.json`](evaluation/legislation/questions.json), 100 legal-answer questions |
| UK Government APIs OKF | [Seven shared Explorer personas and nineteen stories][geospatial-personas] · [`journeys.json`](evaluation/okf-explorer/journeys.json) | [`questions.json`](evaluation/okf-explorer/questions.json), 100 retrieval and inspection questions plus focused Map UI tests |
| GOV.UK CKAN | [Six CKAN-specific personas and user stories][ckan-personas] · [`journeys.json`](evaluation/gov-ckan/journeys.json) | [`questions.json`](evaluation/gov-ckan/questions.json), 100 catalogue questions |

The journey manifests also define opt-in browser interactions for facets,
sorting, URL Back/Forward restoration, graph edges, relationship-drawer
resizing, Map reductions, folded record sections, full-record loading and
source-data/new-tab behaviour. A normal 100-question harness run remains
unchanged.

The focused geospatial suite runs 18 Playwright scenarios against deterministic
small- and large-bundle fixtures. It covers every Map control and visible
state, including successful GeoJSON/OGC/ArcGIS previews, failure recovery,
keyboard and responsive use, URL history, empty/loading states and display
bounds. Run it with `pnpm test:e2e` from `apps/okf-explorer/`.

- [Start with the OKF Explorer documentation guide][docs-index]
- [Read the illustrated OKF Explorer persona manual][persona-manual]
- [Explore the geospatial Map personas, stories and illustrated manual][geospatial-personas]
- [Use the static search and filtering manual][search-filtering-manual]
- [Use the illustrated UK Legislation persona manual][legislation-manual]
- [Use an AI with an OKF pack][ai-okf-usage]
- [Create an OKF bundle that uses the Explorer well][bundle-authoring]

The CKAN example demonstrates the main no-install workflow: the Explorer is
hosted by this repository, while the bundle descriptor and generated data live
in the separate
[`ai-engineering-lab-hackathon-london-2026`](https://github.com/chris-page-gov/ai-engineering-lab-hackathon-london-2026)
repository.

The UK Government APIs exemplar is published as a large-corpus OKF descriptor:

```text
https://chris-page-gov.github.io/okf-uk-government-apis/okf-explorer.json
```

The UK Legislation pack publishes the complete legislation.gov.uk work catalogue and resolves every official CLML subdivision only when selected:

```text
https://chris-page-gov.github.io/okf-uk-legislation/okf-explorer.json
```

To open your own public bundle, use this URL pattern:

```text
https://chris-page-gov.github.io/okf-explorer/?bundle=ENCODED_BUNDLE_OR_DESCRIPTOR_URL
```

For example, a small bundle published at
`https://example.github.io/my-okf/okf-bundle.json` opens as:

```text
https://chris-page-gov.github.io/okf-explorer/?bundle=https%3A%2F%2Fexample.github.io%2Fmy-okf%2Fokf-bundle.json
```

This repository now plays two roles:

- `apps/okf-explorer/` is the canonical SvelteKit OKF Explorer source.
- `explorer/` is the dependency-free static OKF Explorer PWA and compatibility
  surface, published explicitly under `legacy/`.
- The existing AI infrastructure Markdown corpus is the bundled sample/default
  OKF dataset used to exercise the explorer.

The repository contains:

- `explorer/` - source for the hosted legacy compatibility Explorer app.
- `apps/okf-explorer/` - Svelte 5 / SvelteKit 2 / Vite 8 source for the
  definitive OKF Explorer implementation.
- `okf.config.json` - local corpus configuration.
- `okf-bundle.json` - generated bundle consumed by the explorer.
- `okf-registry.json` - starter registry for discoverable bundles and Bundle
  URL suggestions.
- `uk-government-apis/` - generated large-corpus OKF exemplar sourced from the
  GOV.UK API Catalogue, data.gov.uk, Ordnance Survey and ONS public API
  metadata.
- `legislation/` - generated complete work-level catalogue for legislation.gov.uk, normalized with ELI, Schema.org Legislation and CLML and equipped with live provision-level progressive discovery.
- `evaluation/legislation/` - 100-question legal-answer suite, 100-point rubric and provenance-complete answer contract.
- `docs/uk-legislation/` - maintained UK Legislation documentation spine with getting-started guidance, personas, user journeys, an illustrated manual, agent research rules, evaluation and refresh instructions.
- `docs/explorer-overview-context.md` - design specification for generated
  overview contexts, facet analysis, hierarchy support, and Explorer analysis
  extensions.
- `docs/geospatial-map-exploration.md` - prototype contract for deterministic
  spatial discovery, Map reductions and bounded on-demand external previews.
- `docs/geospatial-map-personas-and-user-stories.md` - role-based Map needs,
  risks, acceptance criteria and browser-test traceability.
- `docs/geospatial-map-manual.md` - screenshot-led Map walkthrough from spatial
  evidence and area reduction to previews and recovery.
- `docs/index.md` - documentation landing page for browsing, AI usage,
  authoring, evaluation and review records.
- `docs/okf-explorer-persona-manual.md` - screenshot-led UI manual using
  personas and user stories.
- `docs/ai-okf-usage.md` - prompts and pack access rules for using an AI to
  answer questions from OKF bundles.
- `docs/okf-bundle-authoring.md` - bundle-authoring guide for Explorer-ready
  facets, search, graph, timeline, resources and provenance.
- `docs/demo-script-2026-07-09.md` - 20 minute demonstration script.
- `docs/use-okf-explorer.md` - novice-friendly manual for generating,
  publishing, and browsing OKF bundles with the hosted Svelte Explorer.
- `docs/okf-explorer-evaluation.md` - 100-question browser evaluation harness
  and additive rubric for retrieval, display clarity, accessibility, GOV.UK
  publication quality, and visual-regression evidence.
- `docs/okf-pack-parity.md` - parity contract for evaluating the UK Government
  APIs and GOV.UK CKAN OKF packs with the same Explorer behaviours and rubric.
- `docs/okf-conformance.md` - OKF v0.1 conformance scope and intentional
  deviations.
- `docs/code-review-2026-07-07.md` - Fable 5 code review: findings, fixes,
  and completion plan.
- `CHANGELOG.md` - publication-quality change history with validation notes.
- `viewer.html` - legacy self-contained interactive graph and reader.
- `view.html` - compatibility alias for the legacy viewer.
- `index.md`, `document/`, `stack/`, `standards/`, `federated/`, `frameworks/`,
  `research/`, `uk-government/`, `organisations/`, and `glossary/` - the OKF
  Markdown corpus.
- `sources-index.md` and `log.md` - source and provenance indexes.

## Upstream Local Assembly Reference

The following describes the retained upstream sample-corpus assembly, not the
Warwickshire parent deployment. Run `python3 scripts/build_site.py`, serve `_site/` as the local web root, and
open `http://127.0.0.1:8002/next/` to review the canonical Svelte Explorer.
The root Pages URL redirects to `next/`, while the dependency-free
compatibility Explorer remains available at `legacy/`. The legacy single-file
viewer remains available at `viewer.html`.

The Explorer reads `okf-registry.json` for example bundle destinations and keeps
recently loaded Bundle URLs in browser local storage, then offers matching
suggestions while typing in the Bundle URL field.

The Explorer product/data-contract direction is documented in
[docs/explorer-overview-context.md](docs/explorer-overview-context.md). It
defines the generated overview context expected by Reader, Graph, Links,
Timeline, Type, Resources, Map, and Narrative views, including how small
bundles can embed analysis inline while large bundles reference chunked
analysis artifacts. [Geospatial Map exploration](docs/geospatial-map-exploration.md)
defines the Map evidence levels and progressive recovery model.

## Upstream Relationship To The CKAN Fixture (Reference Only)

In the upstream generic project, this repository owns the Svelte
Explorer, bundle conventions, reusable viewer behaviour, registry examples, and
the AI infrastructure sample bundle. The GOV.UK CKAN large-corpus fixture lives
in
[`ai-engineering-lab-hackathon-london-2026`](https://github.com/chris-page-gov/ai-engineering-lab-hackathon-london-2026)
because that repository preserves the historical path from the original dark
data challenge to the generalized OKF large-corpus builder. The CKAN descriptor
is listed in the upstream registry. This Warwickshire profile does not load
that external bundle; the history is retained to explain the inherited corpus
tooling and evaluation fixtures.

Direct CKAN example:
[GOV.UK CKAN in the hosted Svelte Explorer][ckan-example]

Pack parity expectations are documented in
[docs/okf-pack-parity.md](docs/okf-pack-parity.md). The shared browser harness
now carries a separate 100-question CKAN suite so changes to the Explorer can be
scored against both the multi-source UK Government APIs exemplar and the broad
CKAN data-catalogue exemplar.

## Svelte Explorer

The Svelte implementation is built as a static app. In this fork it is the
Warwickshire same-origin application source and is deployed only through the
parent assembly contract described above. Upstream support for generic
monolithic bundles and large-corpus descriptors remains in the codebase, but
network loading is constrained to the serving origin.

```sh
cd apps/okf-explorer
pnpm install
pnpm check
pnpm test
pnpm test:e2e
pnpm build
```

The upstream `python3 scripts/build_site.py` assembly into `_site/next/` is not
the Warwickshire publication path. For this profile, copy the generated build
to the parent site's `/knowledge/` route and co-publish only the reviewed public
bundle at `/okf/warwickshire-public/`. A standalone review host must reproduce
those sibling routes; the application build is not complete on its own.

## Upstream Sample-Corpus Validation (Reference Only)

```sh
python3 scripts/build_uk_government_api_okf.py --check
python3 scripts/check_legislation_okf.py
python3 scripts/build_legislation_evaluation.py
python3 scripts/check_documentation_lockstep.py
python3 scripts/build_okf_bundle.py --check
python3 scripts/update_viewer.py --check
python3 scripts/check_okf.py
python3 scripts/build_site.py
node scripts/evaluate_okf_explorer.mjs --base-url http://127.0.0.1:8002/next/ --bundle /uk-government-apis/okf-explorer.json --limit 100
node scripts/evaluate_okf_explorer.mjs --base-url http://127.0.0.1:8002/next/ --suite evaluation/gov-ckan/questions.json --limit 100
```

The retained upstream assembly writes a generic Pages-ready static site to
`_site/`; it is not a Warwickshire deployment artifact. The upstream site uses a
root redirect into the Svelte Explorer, publishes the Svelte Explorer under
`next/`, publishes the compatibility Explorer under `legacy/`, preserves
`viewer.html` and `view.html`, publishes the UK Government APIs large-corpus
descriptor, and copies the public OKF Markdown corpus beside it.
The legislation work catalogue, ontology documentation and legal-answer evaluation suite are also published.

To regenerate the explorer bundle after Markdown changes:

```sh
python3 scripts/build_okf_bundle.py
```

To regenerate the UK Government APIs exemplar from the official catalogue CSV:

```sh
python3 scripts/build_uk_government_api_okf.py
```

To refresh the complete legislation work catalogue from the official Atom API:

```sh
python3 scripts/build_legislation_okf.py --refresh
python3 scripts/check_legislation_okf.py
```

Publication-affecting changes to `scripts/`, `sources/`, `uk-government-apis/`,
Explorer source, tests, or workflows must keep documentation and
`CHANGELOG.md` in lockstep. CI enforces this for human pull requests with
`scripts/check_documentation_lockstep.py`.

## License

The OKF corpus and documentation are licensed under
[CC BY-NC 4.0](LICENSE.md): free non-commercial reuse with attribution.

The viewer and build/validation scripts are licensed under the
[MIT License](LICENSE-CODE.md).

## GitHub Pages

Standalone GitHub Pages publication is disabled for this fork. The included
workflow is a manual fail-closed guard with read-only repository permission and
no Pages deployment action. Configure and deploy the organisation-restricted
site only in the parent repository after its visibility, merged-ref, review and
public-bundle checks pass.

[ckan-example]: https://chris-page-gov.github.io/okf-explorer/?bundle=https%3A%2F%2Fchris-page-gov.github.io%2Fai-engineering-lab-hackathon-london-2026%2Fgov-ckan%2Fokf-explorer.json&view=reader#overview
[uk-government-apis-example]: https://chris-page-gov.github.io/okf-explorer/?bundle=https%3A%2F%2Fchris-page-gov.github.io%2Fai-infrastructure-wiki%2Fuk-government-apis%2Fokf-explorer.json&view=reader#overview
[legislation-example]: https://chris-page-gov.github.io/okf-explorer/?bundle=https%3A%2F%2Fchris-page-gov.github.io%2Fai-infrastructure-wiki%2Flegislation%2Fokf-explorer.json&view=reader#overview
[legislation-docs]: docs/uk-legislation/index.md
[legislation-manual]: docs/uk-legislation/illustrated-manual.md
[legislation-personas]: docs/uk-legislation/personas-and-user-journeys.md
[ckan-personas]: docs/gov-ckan-personas-and-user-journeys.md
[docs-index]: docs/index.md
[persona-manual]: docs/okf-explorer-persona-manual.md
[geospatial-personas]: docs/geospatial-map-personas-and-user-stories.md
[search-filtering-manual]: docs/static-search-filtering-manual.md
[ai-okf-usage]: docs/ai-okf-usage.md
[bundle-authoring]: docs/okf-bundle-authoring.md
