<script lang="ts">
  import { Select } from '@juspay/svelte-ui-components';
  import type { SelectRowProps } from '../../types';

  let { label, value, options, token = null, onChange }: SelectRowProps = $props();

  // Ensure the element's current value is always selectable even if it isn't a preset option.
  let items = $derived(
    (options.includes(value) ? options : [value, ...options])
      .filter((option) => option.length > 0)
      .map((option) => ({ id: option, label: option }))
  );
  let current = $derived(value.length > 0 ? [value] : []);

  function handle(values: string[]): void {
    const next = values.at(0);
    if (typeof next === 'string' && next !== value) {
      onChange(next);
    }
  }
</script>

<div class="prop-row">
  <span class="prop-label">{label}</span>
  <div class="prop-value">
    <Select {items} value={current} onchange={handle} classes="select-scope select-inspector" />
    {#if token !== null}
      <span class="scope-chip" title={`Driven by ${token} — edits change this token everywhere`}>
        token
      </span>
    {/if}
  </div>
</div>

<style>
  .prop-row {
    display: grid;
    grid-template-columns: 84px 1fr;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    padding: 1px 12px;
  }

  .prop-label {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .prop-value {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .prop-value :global(.select-inspector) {
    --select-trigger-min-height: 26px;
    --select-trigger-padding: 3px 8px;
    --select-font-size: 11px;
    flex: 1;
    min-width: 0;
  }

  .scope-chip {
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-soft);
    border-radius: 4px;
    padding: 1px 5px;
  }
</style>
