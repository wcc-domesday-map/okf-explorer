const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const EXPLICIT_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function parsedHttpUrl(value: unknown, baseUrl: string): URL | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim(), baseUrl);
    if (!HTTP_PROTOCOLS.has(url.protocol) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Resolve a bundle, registry, redirect or descriptor resource URL. Warwickshire's
 * static deployment deliberately treats the site origin as its network trust
 * boundary: local file uploads remain available, but network bundles cannot turn
 * Explorer into a cross-origin fetch client.
 */
export function sameOriginHttpUrl(value: unknown, baseUrl: string): string | null {
  const base = parsedHttpUrl(baseUrl, baseUrl);
  const url = parsedHttpUrl(value, baseUrl);
  if (!base || !url || url.origin !== base.origin) return null;
  return url.toString();
}

export function requireSameOriginHttpUrl(value: unknown, baseUrl: string, label = 'Bundle URL'): string {
  const url = sameOriginHttpUrl(value, baseUrl);
  if (!url) {
    throw new Error(`${label} must be an http(s) URL on this Explorer origin or a safe relative path.`);
  }
  return url;
}

/**
 * Sanitize an href supplied by bundle data. Explicit http(s) links may point to
 * an external authoritative source. Relative values are accepted only when they
 * resolve on the Explorer origin; protocol-relative cross-origin values are not
 * treated as approved relatives.
 */
export function publicHttpHref(value: unknown, baseUrl: string): string | null {
  return publicHttpHrefForBundle(value, baseUrl, baseUrl);
}

/**
 * Resolve a bundle-controlled link against the bundle that declared it while
 * retaining the Explorer origin as the trust boundary for relative links.
 * Explicit http(s) source links may point to authoritative external sites;
 * protocol-relative and ordinary relative values must remain on the Explorer
 * origin.
 */
export function publicHttpHrefForBundle(value: unknown, bundleUrl: string, explorerUrl: string): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim();
  const explorer = parsedHttpUrl(explorerUrl, explorerUrl);
  if (!explorer) return null;

  // An explicit http(s) URL is a navigational link, not an approval to fetch.
  // Parse it without depending on the bundle base so uploaded bundles can still
  // cite authoritative public sources.
  if (EXPLICIT_SCHEME.test(raw)) {
    const explicit = parsedHttpUrl(raw, explorerUrl);
    return explicit?.toString() || null;
  }

  const bundle = parsedHttpUrl(bundleUrl, explorerUrl);
  const url = bundle ? parsedHttpUrl(raw, bundle.toString()) : null;
  if (!bundle || !url) return null;
  return url.origin === explorer.origin ? url.toString() : null;
}

/**
 * Resolve an on-demand network resource relative to its bundle and require the
 * final request URL to stay on the Explorer origin. Callers should also use
 * `redirect: 'error'` so a same-origin endpoint cannot redirect the browser to
 * a different network trust domain.
 */
export function sameOriginResourceUrl(value: unknown, bundleUrl: string, explorerUrl: string): string | null {
  const explorer = parsedHttpUrl(explorerUrl, explorerUrl);
  const bundle = parsedHttpUrl(bundleUrl, explorerUrl);
  const url = bundle ? parsedHttpUrl(value, bundle.toString()) : null;
  if (!explorer || !bundle || !url || url.origin !== explorer.origin) return null;
  return url.toString();
}

export function isPublicHttpHref(value: unknown, baseUrl: string): value is string {
  return publicHttpHref(value, baseUrl) !== null;
}
