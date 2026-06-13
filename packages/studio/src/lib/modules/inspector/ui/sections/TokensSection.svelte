<script lang="ts">
  import type { TokensSectionProps } from '../../types';
  import InspectorSection from '../InspectorSection.svelte';
  import PropRow from '../rows/PropRow.svelte';

  let { selected }: TokensSectionProps = $props();
</script>

<InspectorSection title={`Tokens · ${selected.relevantVariables.length}`}>
  {#each selected.relevantVariables as rel (rel.property + rel.varName)}
    <PropRow label={rel.property} value={`${rel.varName}`} swatch={false} />
    <div class="token-resolved">
      <span class="token-swatch" style="background: {rel.resolvedValue};"></span>
      <span class="token-val" title={rel.resolvedValue}>{rel.resolvedValue}</span>
    </div>
  {/each}
</InspectorSection>

<style>
  .token-resolved {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px 4px 96px;
  }

  .token-swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.16);
  }

  .token-val {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
