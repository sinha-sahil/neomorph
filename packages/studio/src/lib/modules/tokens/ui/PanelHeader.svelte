<script lang="ts">
  import { Img, Input, Pill } from '@juspay/svelte-ui-components';
  import { filteredCount, setSearch, search } from '../store';
  import searchIcon from '$lib/assets/icons/search.svg?url';
</script>

<header class="panel-header">
  <div class="panel-title-row">
    <h2 class="panel-title">Tokens</h2>
    {#if $filteredCount > 0}
      <Pill text={`${$filteredCount}`} classes="pill-count" />
    {/if}
  </div>
  <div class="panel-search">
    <Img src={searchIcon} alt="" classes="studio-icon icon-xs search-icon" />
    <Input
      value={$search}
      dataType="text"
      placeholder="Search tokens"
      onInput={(val: string) => setSearch(val)}
      classes="input-search"
    />
  </div>
</header>

<style>
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 14px 14px;
    border-bottom: 1px solid var(--border-soft);
    background: var(--bg-panel);
  }

  .panel-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--text);
  }

  .panel-search {
    position: relative;
    display: flex;
    align-items: center;
  }

  /* Applied to the <Img> top-level element via its `classes` prop, so it must be
     reached with :global (anchored to the local search wrapper). */
  .panel-search :global(.search-icon) {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
  }
</style>
