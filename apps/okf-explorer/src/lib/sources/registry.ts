import type { BundleRegistryEntry } from '$lib/types';
import { requireSameOriginHttpUrl, sameOriginHttpUrl } from '$lib/security/urlPolicy';
import { fetchJson } from './fetch';

const HISTORY_KEY = 'okfExplorerBundleHistory:v3';

function safeEntry(entry: BundleRegistryEntry, baseUrl: string): BundleRegistryEntry | null {
  const url = sameOriginHttpUrl(entry?.url, baseUrl);
  return url ? { ...entry, url } : null;
}

export function loadHistory(baseUrl = globalThis.location?.href || 'https://example.test/'): BundleRegistryEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as BundleRegistryEntry[];
    return Array.isArray(parsed)
      ? parsed.map((entry) => safeEntry(entry, baseUrl)).filter((entry): entry is BundleRegistryEntry => Boolean(entry)).slice(0, 20)
      : [];
  } catch {
    return [];
  }
}

export function rememberHistory(entry: BundleRegistryEntry, baseUrl = globalThis.location?.href || 'https://example.test/'): BundleRegistryEntry[] {
  const safe = safeEntry(entry, baseUrl);
  const history = loadHistory(baseUrl);
  if (!safe) return history;
  const next = [{ ...safe, kind: safe.kind || 'history' }, ...history.filter((item) => item.url !== safe.url)].slice(0, 20);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures (quota, private browsing); history is best-effort.
  }
  return next;
}

export async function loadRegistry(url: string, baseUrl = globalThis.location?.href || 'https://example.test/'): Promise<BundleRegistryEntry[]> {
  try {
    const registryUrl = requireSameOriginHttpUrl(url, baseUrl, 'Bundle registry URL');
    const registry = await fetchJson<{ bundles?: BundleRegistryEntry[]; entries?: BundleRegistryEntry[] }>(registryUrl);
    return [...(registry.bundles || []), ...(registry.entries || [])]
      .map((entry) => safeEntry(entry, registryUrl))
      .filter((entry): entry is BundleRegistryEntry => Boolean(entry));
  } catch {
    return [];
  }
}
