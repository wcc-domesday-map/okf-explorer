# Warwickshire publication profile

Status: standalone publication disabled. The restricted parent repository owns
assembly, review and deployment of the Warwickshire demonstration.

## Authoritative surfaces

- Parent repository: pins the reviewed Explorer revision and owns the feature
  branch, pull request, approval and visibility checks.
- `/knowledge/`: parent-assembled static Explorer application.
- `/okf/warwickshire-public/`: physically separate, reviewed public OKF bundle
  and bundle-relative public resources.
- Internal application and bundle: a separate protected surface; never copied
  into, proxied by, or hidden inside the public browser artifact.

This repository's application build is a served-only fragment. It must not be
published at a standalone Pages root because it does not contain the sibling
Warwickshire bundle. The inherited Pages workflow is manual and intentionally
fails with an explanatory error. It has no Pages write or identity-token
permission and runs no deployment action.

## Parent release gate

Before the parent repository publishes a revision:

1. Confirm the ref is merged and approved by at least one independent human.
2. Confirm repository and Pages visibility match the organisation-restricted
   delivery requirement.
3. Build and validate Explorer from the pinned submodule revision.
4. Copy the application only to `/knowledge/`.
5. Copy only the reviewed public bundle to `/okf/warwickshire-public/`.
6. Scan the assembled site for credentials, internal hosts and internal data.
7. Verify CSP and same-origin network behavior in the served artifact.
8. Exercise the default bundle, provenance links, disabled external previews,
   local file upload and the core Reader/Graph/Links/Type views.

Validation commands and the complete route/security contract are maintained in
[`docs/warwickshire-same-origin-profile.md`](docs/warwickshire-same-origin-profile.md).

## Upstream publication history

Upstream OKF Explorer public Pages and release instructions are historical
reference only for this fork. They are not authority to enable a standalone
public deployment, external bundle loading or cross-origin previews in the
Warwickshire profile.
