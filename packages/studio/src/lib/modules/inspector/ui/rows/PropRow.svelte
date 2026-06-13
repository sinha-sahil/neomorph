<script lang="ts">
  import type { PropRowProps } from '../../types';

  let { label, value, swatch = false }: PropRowProps = $props();

  function isColorish(v: string): boolean {
    const s = v.trim().toLowerCase();
    return (
      s.startsWith('#') ||
      s.startsWith('rgb') ||
      s.startsWith('hsl') ||
      s.startsWith('oklch') ||
      s.startsWith('oklab') ||
      s.startsWith('color(')
    );
  }
</script>

<div class="prop-row">
  <span class="prop-label">{label}</span>
  <span class="prop-value">
    {#if swatch && isColorish(value)}
      <span class="swatch" style="background: {value};"></span>
    {/if}
    <span class="prop-text" title={value}>{value}</span>
  </span>
</div>

<style>
  .prop-row {
    display: grid;
    grid-template-columns: 88px 1fr;
    align-items: center;
    gap: 8px;
    min-height: 26px;
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

  .swatch {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.16);
  }

  .prop-text {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
