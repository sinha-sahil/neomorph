<script lang="ts">
  import { ColorPicker } from '@juspay/svelte-ui-components';
  import type { ColorRowProps } from '../../types';

  let { label, value, token = null, onChange }: ColorRowProps = $props();

  let swatch = $derived(value);
</script>

<div class="prop-row">
  <span class="prop-label">{label}</span>
  <div class="prop-value">
    <ColorPicker
      value={swatch}
      showValue={false}
      oninput={(next: string) => onChange(next)}
      classes="colorpicker-swatch"
    />
    <span class="prop-text" title={value}>{value}</span>
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
    grid-template-columns: 88px 1fr;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding: 0 12px;
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
    gap: 7px;
    min-width: 0;
  }

  .prop-text {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
