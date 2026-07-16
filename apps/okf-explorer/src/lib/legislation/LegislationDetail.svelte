<script lang="ts">
  import type { LargeDataset, SearchResultDoc } from '$lib/types';
  import { publicHttpHrefForBundle, sameOriginResourceUrl } from '$lib/security/urlPolicy';
  import { parseClml, type LegislationProvision } from './structure';

  let { record, bundleUrl }: { record: Partial<LargeDataset & SearchResultDoc>; bundleUrl: string } = $props();
  let provisions = $state<LegislationProvision[]>([]);
  let loading = $state(false);
  let error = $state('');
  let filter = $state('');
  let limit = $state(120);

  function safeHref(value: unknown): string {
    return publicHttpHrefForBundle(value, bundleUrl, location.href) || '';
  }

  function safeFetchHref(value: unknown): string {
    return sameOriginResourceUrl(value, bundleUrl, location.href) || '';
  }

  const isLegislation = $derived(record.record_type === 'Legislation Work' || Boolean(record.legislation_id_uri));
  const rawDocumentUri = $derived(record.document_uri || record.url || '');
  const documentUri = $derived(safeHref(rawDocumentUri));
  const rawStructureUrl = $derived(record.structure_url || (documentUri ? `${documentUri.replace(/\/$/, '')}/data.xml` : ''));
  const structureUrl = $derived(safeHref(rawStructureUrl));
  const structureFetchUrl = $derived(safeFetchHref(rawStructureUrl));
  const manifestations = $derived(Object.entries(record.manifestations || {}));
  const visibleProvisions = $derived.by(() => {
    const query = filter.trim().toLowerCase();
    const rows = query
      ? provisions.filter((item) => [item.normalizedType, item.number, item.title, item.text, item.id].join(' ').toLowerCase().includes(query))
      : provisions;
    return rows.slice(0, limit);
  });

  async function loadStructure() {
    if (!structureFetchUrl || loading) return;
    loading = true;
    error = '';
    try {
      const response = await fetch(structureFetchUrl, {
        headers: { Accept: 'application/xml, text/xml;q=0.9' },
        redirect: 'error'
      });
      if (!response.ok) throw new Error(`Official CLML request failed (${response.status})`);
      provisions = parseClml(await response.text(), documentUri);
      if (!provisions.length) throw new Error('No normalized structural elements were found in the official CLML response.');
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  async function copyCitation(item: LegislationProvision) {
    const label = [record.title, `${item.normalizedType} ${item.number}`.trim()].filter(Boolean).join(', ');
    await navigator.clipboard.writeText(`${label} — ${item.officialUrl} (accessed ${new Date().toISOString().slice(0, 10)})`);
  }
</script>

{#if isLegislation}
  <section class="law-panel" aria-label="Official legislation detail">
    <h3>Legal work and official text</h3>
    <p class="warning"><strong>Research aid:</strong> verify current version, commencement, territorial extent and unapplied effects before relying on a provision.</p>
    <dl>
      <dt>ELI class</dt><dd><code>{record.eli_class || 'eli:LegalResource'}</code></dd>
      <dt>Schema.org class</dt><dd><code>{record.schema_org_type || 'schema:Legislation'}</code></dd>
      <dt>Official identifier</dt><dd>{#if record.legislation_id_uri}{#if safeHref(record.legislation_id_uri)}<a href={safeHref(record.legislation_id_uri)} target="_blank" rel="noopener noreferrer">{record.legislation_id_uri}</a>{:else}{record.legislation_id_uri}{/if}{:else}Not supplied{/if}</dd>
      <dt>Document type</dt><dd>{record.document_type || record.type_code || 'Not supplied'}</dd>
      <dt>Category</dt><dd>{record.category || 'Not supplied'}</dd>
      <dt>Year / number</dt><dd>{[record.year, record.number].filter(Boolean).join(' / ') || 'Not supplied'}</dd>
      <dt>Jurisdiction</dt><dd>{record.jurisdiction?.join(', ') || 'Not supplied'}</dd>
      <dt>Legal status note</dt><dd>{record.legal_status || 'Consult the official point-in-time view.'}</dd>
    </dl>

    <div class="law-actions">
      {#if rawDocumentUri}{#if documentUri}<a class="law-button" href={documentUri} target="_blank" rel="noopener noreferrer">Open official work</a>{:else}<span>{rawDocumentUri}</span>{/if}{/if}
      {#if record.table_of_contents_url}{#if safeHref(record.table_of_contents_url)}<a class="law-button" href={safeHref(record.table_of_contents_url)} target="_blank" rel="noopener noreferrer">Official contents</a>{:else}<span>{record.table_of_contents_url}</span>{/if}{/if}
      {#if record.effects_made_url}{#if safeHref(record.effects_made_url)}<a class="law-button" href={safeHref(record.effects_made_url)} target="_blank" rel="noopener noreferrer">Changes made</a>{:else}<span>{record.effects_made_url}</span>{/if}{/if}
      {#if record.effects_received_url}{#if safeHref(record.effects_received_url)}<a class="law-button" href={safeHref(record.effects_received_url)} target="_blank" rel="noopener noreferrer">Changes received</a>{:else}<span>{record.effects_received_url}</span>{/if}{/if}
    </div>

    {#if manifestations.length}
      <details>
        <summary>Official manifestations and data formats ({manifestations.length})</summary>
        <ul>
          {#each manifestations as [format, url]}
            <li>{#if safeHref(url)}<a href={safeHref(url)} target="_blank" rel="noopener noreferrer">{format.replaceAll('_', ' ')}</a>{:else}{format.replaceAll('_', ' ')}: {url}{/if}</li>
          {/each}
        </ul>
      </details>
    {/if}

    {#if !provisions.length}
      {#if structureFetchUrl}
        <button class="load-button" type="button" disabled={loading} onclick={() => void loadStructure()}>
          {loading ? 'Loading official CLML…' : 'Load every Part, Chapter, section, article and nested provision'}
        </button>
        <p class="progressive-note">Loaded only on demand from a same-origin published resource.</p>
      {:else if structureUrl}
        <button class="load-button" type="button" disabled title="Use the official link; this profile does not fetch external resources">External live text disabled</button>
        <p class="progressive-note">The Warwickshire profile does not fetch external legislation data. <a href={structureUrl} target="_blank" rel="noopener noreferrer">Open the official CLML source ↗</a></p>
      {/if}
    {/if}
    {#if error}<p class="error" role="alert">{error} {#if structureUrl}<a href={structureUrl} target="_blank" rel="noopener noreferrer">Open the official CLML directly</a>{:else if rawStructureUrl}{rawStructureUrl}{/if}.</p>{/if}

    {#if provisions.length}
      <div class="structure-tools">
        <label>Find within this instrument <input bind:value={filter} type="search" placeholder="section, phrase, article…" /></label>
        <span>{visibleProvisions.length.toLocaleString()} of {provisions.length.toLocaleString()} normalized concepts shown</span>
      </div>
      <ol class="provision-tree">
        {#each visibleProvisions as item}
          <li style={`--depth:${Math.min(item.depth, 8)}`}>
            <div class="provision-heading">
              <span class="provision-type">{item.normalizedType}</span>
              {#if item.number}<strong>{item.number}</strong>{/if}
              {#if item.title}<span>{item.title}</span>{/if}
            </div>
            {#if item.text}<p>{item.text}</p>{/if}
            <div class="provision-links">
              {#if safeHref(item.officialUrl)}<a href={safeHref(item.officialUrl)} target="_blank" rel="noopener noreferrer">Selected passage</a>{:else}<span>{item.officialUrl}</span>{/if}
              <button type="button" onclick={() => void copyCitation(item)}>Copy provenance citation</button>
              <code>{item.sourceElement} · {item.id}</code>
              {#if item.extent}<span>Extent {item.extent}</span>{/if}
              {#if item.status}<span>Status {item.status}</span>{/if}
            </div>
          </li>
        {/each}
      </ol>
      {#if visibleProvisions.length < provisions.length}
        <button type="button" onclick={() => limit += 250}>Show 250 more</button>
      {/if}
    {/if}
  </section>
{/if}

<style>
  .law-panel { margin: 1.25rem 0; padding: 1rem; border: 1px solid #b1b4b6; border-left: .35rem solid #1d70b8; background: #f8f8f8; }
  .law-panel h3 { margin-top: 0; }
  .warning { padding: .75rem; background: #fff7bf; border-left: .25rem solid #ffdd00; }
  .law-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin: .75rem 0; }
  .law-button, .load-button { display: inline-block; padding: .55rem .75rem; border: 0; background: #00703c; color: white; text-decoration: none; font: inherit; cursor: pointer; }
  .load-button { margin-top: .75rem; background: #1d70b8; }
  .progressive-note { color: #505a5f; font-size: .9rem; }
  .structure-tools { display: grid; gap: .35rem; margin: 1rem 0; }
  .structure-tools input { display: block; box-sizing: border-box; width: 100%; padding: .5rem; margin-top: .25rem; }
  .provision-tree { padding: 0; list-style: none; }
  .provision-tree li { margin: .55rem 0 .55rem calc(var(--depth) * .75rem); padding: .65rem; border-left: 2px solid #b1b4b6; background: white; }
  .provision-heading { display: flex; flex-wrap: wrap; gap: .4rem; align-items: baseline; }
  .provision-type { padding: .15rem .35rem; background: #e8f1f8; color: #003078; font-size: .78rem; text-transform: uppercase; }
  .provision-tree p { margin: .45rem 0; line-height: 1.45; }
  .provision-links { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; font-size: .78rem; color: #505a5f; }
  .provision-links button { border: 0; padding: 0; background: transparent; color: #1d70b8; text-decoration: underline; cursor: pointer; }
  .provision-links code { overflow-wrap: anywhere; }
  .error { color: #d4351c; }
</style>
