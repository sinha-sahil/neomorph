<script lang="ts">
  import { Button, Img, Toolbar, Tooltip } from '@juspay/svelte-ui-components';
  import { clearAll, rescrape } from '$lib/modules/connection';
  import { URLBar } from '$lib/modules/connection';
  import { ZoomControl } from '$lib/modules/canvas';
  import ThemeSwitch from './ThemeSwitch.svelte';
  import { ExportPanel } from '$lib/modules/export';
  import refreshIcon from '$lib/assets/icons/refresh.svg?url';
  import resetIcon from '$lib/assets/icons/reset.svg?url';
</script>

<Toolbar classes="toolbar-app">
  {#snippet leftContent()}
    <div class="brand">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-text">Studio</span>
    </div>
  {/snippet}
  {#snippet centerContent()}
    <URLBar />
  {/snippet}
  {#snippet rightContent()}
    <div class="actions">
      <ZoomControl />
      <Tooltip text="Rescrape variables" position="bottom" classes="tooltip-studio">
        <Button ariaLabel="Rescrape CSS variables" onclick={rescrape} classes="btn-icon">
          <Img src={refreshIcon} alt="" classes="studio-icon icon-sm" />
        </Button>
      </Tooltip>
      <Tooltip text="Reset all overrides" position="bottom" classes="tooltip-studio">
        <Button ariaLabel="Reset all overrides" onclick={clearAll} classes="btn-icon">
          <Img src={resetIcon} alt="" classes="studio-icon icon-sm" />
        </Button>
      </Tooltip>
      <ExportPanel />
      <ThemeSwitch />
    </div>
  {/snippet}
</Toolbar>

<style>
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px 0 12px;
    min-width: 180px;
  }

  .brand-mark {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.06),
      0 1px 2px rgba(99, 102, 241, 0.3);
  }

  .brand-text {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    padding: 0 12px 0 12px;
    min-width: 180px;
  }
</style>
