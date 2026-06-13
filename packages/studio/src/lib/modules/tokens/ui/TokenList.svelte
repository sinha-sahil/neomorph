<script lang="ts">
  import { filteredCount, groupedVariables } from '../store';
  import { activeHostName, totalTokenCount } from '$lib/modules/connection';
  import EmptyState from './EmptyState.svelte';
  import TokenGroup from './TokenGroup.svelte';
</script>

<div class="token-list">
  {#if typeof $activeHostName !== 'string'}
    <EmptyState
      title="Waiting for tokens"
      body="Studio is listening for CSS variables from the target app."
    />
  {:else if $filteredCount === 0 && $totalTokenCount === 0}
    <EmptyState
      title="No CSS variables found"
      body="The target app didn't expose any custom properties."
      hint="Make sure the Weaver script is loaded inside the iframe."
    />
  {:else if $filteredCount === 0}
    <EmptyState
      title="No matches"
      body="Try a different search term or clear it to see all tokens."
    />
  {:else}
    {#each $groupedVariables as group (group.name)}
      <TokenGroup {group} host={$activeHostName} />
    {/each}
  {/if}
</div>

<style>
  .token-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0 16px;
    scrollbar-color: transparent transparent;
    scrollbar-width: thin;
  }

  .token-list:hover {
    scrollbar-color: var(--border-strong) transparent;
  }

  .token-list::-webkit-scrollbar {
    width: 8px;
  }

  .token-list::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
  }

  .token-list:hover::-webkit-scrollbar-thumb {
    background: var(--border-strong);
  }
</style>
