<script lang="ts">
  import { Input } from '@juspay/svelte-ui-components';
  import type { ValueRowProps } from '../../types';

  let { label, value, token = null, onChange }: ValueRowProps = $props();

  // Writable derived: mirrors the prop, but can be overridden locally while typing
  // and re-syncs whenever the underlying value changes (new selection / external edit).
  let draft = $derived(value);

  function onInput(next: string): void {
    draft = next;
  }

  function commit(): void {
    const next = draft.trim();
    if (next.length > 0 && next !== value) {
      onChange(next);
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.target instanceof HTMLElement) {
      commit();
      event.target.blur();
    }
  }
</script>

<div class="prop-row">
  <span class="prop-label">{label}</span>
  <div class="prop-value">
    <Input
      value={draft}
      {onInput}
      onFocusout={commit}
      {onKeyDown}
      classes="input-token input-inspector"
    />
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
    min-height: 28px;
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

  .prop-value :global(.input-inspector) {
    --input-text-align: left;
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
