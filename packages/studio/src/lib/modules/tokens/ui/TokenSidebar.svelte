<script lang="ts">
  import { Button, Img, Tooltip } from '@juspay/svelte-ui-components';
  import PanelHeader from './PanelHeader.svelte';
  import ScopeSwitcher from './ScopeSwitcher.svelte';
  import TokenList from './TokenList.svelte';
  import chevronLeftIcon from '$lib/assets/icons/chevron-left.svg?url';
  import chevronRightIcon from '$lib/assets/icons/chevron-right.svg?url';

  let collapsed = $state(false);

  function toggle(): void {
    collapsed = !collapsed;
  }
</script>

{#if collapsed}
  <aside class="sidebar sidebar-collapsed">
    <Tooltip text="Show tokens" position="right" classes="tooltip-studio">
      <Button ariaLabel="Show tokens panel" onclick={toggle} classes="btn-icon">
        <Img src={chevronRightIcon} alt="" classes="studio-icon icon-sm" />
      </Button>
    </Tooltip>
  </aside>
{:else}
  <aside class="sidebar">
    <div class="sidebar-toolbar">
      <Tooltip text="Hide tokens" position="right" classes="tooltip-studio">
        <Button ariaLabel="Hide tokens panel" onclick={toggle} classes="btn-icon">
          <Img src={chevronLeftIcon} alt="" classes="studio-icon icon-sm" />
        </Button>
      </Tooltip>
    </div>
    <PanelHeader />
    <ScopeSwitcher />
    <TokenList />
  </aside>
{/if}

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 300px;
    min-width: 0;
    min-height: 0;
    background: var(--bg-panel);
    border-right: 1px solid var(--border);
    overflow: hidden;
    flex-shrink: 0;
  }

  .sidebar-collapsed {
    width: 40px;
    align-items: center;
    padding-top: 6px;
  }

  .sidebar-toolbar {
    display: flex;
    justify-content: flex-end;
    padding: 6px 8px 0 8px;
  }
</style>
